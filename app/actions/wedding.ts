"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";

const MEALS = ["planned", "no", "undecided"] as const;
const SIDES = ["groom", "bride"] as const;

export type WeddingRsvpMeal = (typeof MEALS)[number];
export type WeddingRsvpSide = (typeof SIDES)[number];

export type SubmitWeddingRsvpInput = {
  side: WeddingRsvpSide;
  guestName: string;
  headcount: number;
  meal: WeddingRsvpMeal;
};

export async function submitWeddingRsvp(
  input: SubmitWeddingRsvpInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!SIDES.includes(input.side)) {
    return { ok: false, error: "전달 대상이 올바르지 않습니다." };
  }
  if (!MEALS.includes(input.meal)) {
    return { ok: false, error: "식사 여부가 올바르지 않습니다." };
  }

  const guestName = input.guestName.trim();
  if (guestName.length < 1 || guestName.length > 120) {
    return { ok: false, error: "성함을 확인해 주세요." };
  }

  const headcount = Math.floor(Number(input.headcount));
  if (!Number.isFinite(headcount) || headcount < 1 || headcount > 99) {
    return { ok: false, error: "참석 인원을 확인해 주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("wedding_rsvps").insert({
    side: input.side,
    guest_name: guestName,
    headcount,
    meal: input.meal,
    privacy_agreed: true,
  });

  if (error) {
    console.error("[submitWeddingRsvp]", error.message);
    return { ok: false, error: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true };
}

const MAX_BYTES_PER_FILE = 10 * 1024 * 1024;
const MAX_FILES_PER_SUBMIT = 15;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
  return base.length > 0 ? base : "photo";
}

function validateImageFile(file: File): string | null {
  if (file.size < 1) return "빈 파일이 포함되어 있습니다.";
  if (file.size > MAX_BYTES_PER_FILE) {
    return `각 사진은 ${MAX_BYTES_PER_FILE / 1024 / 1024}MB 이하여야 합니다.`;
  }
  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.has(contentType)) {
    return "JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.";
  }
  return null;
}

/** 여러 장 Storage 업로드 + guest_photos 행 저장. SUPABASE_SERVICE_ROLE_KEY 필요. */
export async function submitGuestPhotos(
  formData: FormData,
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch {
    return {
      ok: false,
      error: "사진 업로드 설정이 완료되지 않았습니다. (서버 환경 변수를 확인해 주세요.)",
    };
  }

  const files = formData
    .getAll("files")
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (files.length === 0) {
    return { ok: false, error: "파일을 선택해 주세요." };
  }
  if (files.length > MAX_FILES_PER_SUBMIT) {
    return { ok: false, error: `한 번에 최대 ${MAX_FILES_PER_SUBMIT}장까지 업로드할 수 있습니다.` };
  }

  for (const file of files) {
    const err = validateImageFile(file);
    if (err) return { ok: false, error: err };
  }

  const uploadedPaths: string[] = [];

  for (const file of files) {
    const contentType = file.type || "application/octet-stream";
    const safeName = sanitizeFilename(file.name);
    const path = `guest/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    const buffer = await file.arrayBuffer();

    const { error: uploadError } = await admin.storage.from("guest-uploads").upload(path, buffer, {
      contentType,
      upsert: false,
    });

    if (uploadError) {
      console.error("[submitGuestPhotos] storage", uploadError.message);
      if (uploadedPaths.length > 0) {
        await admin.storage.from("guest-uploads").remove(uploadedPaths);
      }
      return { ok: false, error: "업로드에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    }

    const { error: insertError } = await admin.from("guest_photos").insert({
      storage_path: path,
      original_filename: file.name.slice(0, 255),
      content_type: contentType,
      file_size: file.size,
    });

    if (insertError) {
      console.error("[submitGuestPhotos] db", insertError.message);
      await admin.storage.from("guest-uploads").remove([path, ...uploadedPaths]);
      return { ok: false, error: "기록 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." };
    }

    uploadedPaths.push(path);
  }

  return { ok: true, count: files.length };
}
