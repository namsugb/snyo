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

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeFilename(name: string): string {
  const base = name.replace(/[/\\]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
  return base.length > 0 ? base : "photo";
}

/** Storage 업로드 + guest_photos 행 저장. SUPABASE_SERVICE_ROLE_KEY 필요. */
export async function submitGuestPhoto(
  formData: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch {
    return {
      ok: false,
      error: "사진 업로드 설정이 완료되지 않았습니다. (서버 환경 변수를 확인해 주세요.)",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false, error: "파일을 선택해 주세요." };
  }

  if (file.size < 1) {
    return { ok: false, error: "빈 파일입니다." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "파일은 10MB 이하만 업로드할 수 있습니다." };
  }

  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.has(contentType)) {
    return { ok: false, error: "JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다." };
  }

  const safeName = sanitizeFilename(file.name);
  const path = `guest/${Date.now()}-${crypto.randomUUID()}-${safeName}`;

  const buffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage.from("guest-uploads").upload(path, buffer, {
    contentType,
    upsert: false,
  });

  if (uploadError) {
    console.error("[submitGuestPhoto] storage", uploadError.message);
    return { ok: false, error: "업로드에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  const { error: insertError } = await admin.from("guest_photos").insert({
    storage_path: path,
    original_filename: file.name.slice(0, 255),
    content_type: contentType,
    file_size: file.size,
  });

  if (insertError) {
    console.error("[submitGuestPhoto] db", insertError.message);
    await admin.storage.from("guest-uploads").remove([path]);
    return { ok: false, error: "기록 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true };
}
