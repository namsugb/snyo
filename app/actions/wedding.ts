"use server";

import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import {
  WEDDING_BUS_BOARDING_PLACES,
} from "@/lib/wedding-rsvp-boarding";

const MAX_COMPANION_SLOTS = 50;
const MAX_NAME_LENGTH = 120;

export type SubmitWeddingRsvpInput = {
  guestName: string;
  companionNames: string[];
  boardingPlace: (typeof WEDDING_BUS_BOARDING_PLACES)[number];
};

export async function submitWeddingRsvp(
  input: SubmitWeddingRsvpInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(WEDDING_BUS_BOARDING_PLACES as readonly string[]).includes(input.boardingPlace)) {
    return { ok: false, error: "탑승 장소가 올바르지 않습니다." };
  }

  const guestName = input.guestName.trim();
  if (guestName.length < 1 || guestName.length > MAX_NAME_LENGTH) {
    return { ok: false, error: "성함을 확인해 주세요." };
  }

  const companions = input.companionNames
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (companions.length > MAX_COMPANION_SLOTS) {
    return { ok: false, error: `동승자는 최대 ${MAX_COMPANION_SLOTS}명까지 입력할 수 있습니다.` };
  }

  for (const name of companions) {
    if (name.length > MAX_NAME_LENGTH) {
      return { ok: false, error: "동승자 이름이 너무 깁니다." };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase.from("wedding_rsvps").insert({
    guest_name: guestName,
    companion_names: companions,
    boarding_place: input.boardingPlace,
    privacy_agreed: true,
  });

  if (error) {
    console.error("[submitWeddingRsvp]", error.message);
    return { ok: false, error: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true };
}

const MAX_BYTES_PER_FILE = 10 * 1024 * 1024;
const MAX_FILES_PER_SUBMIT = 30;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type GuestPhotoUploadInput = {
  name: string;
  type: string;
  size: number;
};

export type GuestPhotoSignedUpload = GuestPhotoUploadInput & {
  path: string;
  token: string;
};

/** Storage 객체 키는 공백·비ASCII 등이 있면 Supabase에서 거부될 수 있어, 경로는 안전한 이름만 씁니다. */
const GUEST_UPLOAD_EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function guestUploadStoragePath(file: GuestPhotoUploadInput): string {
  const ext = GUEST_UPLOAD_EXT_BY_MIME[file.type] ?? "img";
  return `guest/${Date.now()}-${crypto.randomUUID()}.${ext}`;
}

/** 브라우저에서 보낸 파일 메타데이터를 서버에서도 한 번 더 검증합니다. */
function validateImageMeta(file: GuestPhotoUploadInput): string | null {
  if (file.size < 1) return "빈 파일이 포함되어 있습니다.";
  if (file.size > MAX_BYTES_PER_FILE) {
    return `각 사진은 ${MAX_BYTES_PER_FILE / 1024 / 1024}MB 이하이어야 합니다.`;
  }
  const contentType = file.type || "application/octet-stream";
  if (!ALLOWED_TYPES.has(contentType)) {
    return "JPG, PNG, WebP, GIF 이미지만 업로드할 수 있습니다.";
  }
  return null;
}

function validateGuestPhotoBatch(files: GuestPhotoUploadInput[]): string | null {
  if (files.length === 0) return "파일을 선택해 주세요.";
  if (files.length > MAX_FILES_PER_SUBMIT) {
    return `한 번에 최대 ${MAX_FILES_PER_SUBMIT}장까지 업로드할 수 있습니다.`;
  }
  for (const file of files) {
    const err = validateImageMeta(file);
    if (err) return err;
  }
  return null;
}

/** Vercel 본문 제한을 피하기 위해 파일은 브라우저에서 Supabase Storage로 직접 업로드합니다. */
export async function createGuestPhotoUploadUrls(
  files: GuestPhotoUploadInput[],
): Promise<{ ok: true; uploads: GuestPhotoSignedUpload[] } | { ok: false; error: string }> {
  const validationError = validateGuestPhotoBatch(files);
  if (validationError) return { ok: false, error: validationError };

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch {
    return {
      ok: false,
      error: "사진 업로드 설정이 완료되지 않았습니다. 서버 환경 변수를 확인해 주세요.",
    };
  }

  const uploads: GuestPhotoSignedUpload[] = [];

  for (const file of files) {
    const path = guestUploadStoragePath(file);
    const { data, error } = await admin.storage.from("guest-uploads").createSignedUploadUrl(path);

    if (error || !data?.token) {
      console.error("[createGuestPhotoUploadUrls]", error?.message ?? "missing signed upload token");
      return { ok: false, error: "업로드 주소를 만들지 못했습니다. 잠시 후 다시 시도해 주세요." };
    }

    uploads.push({
      name: file.name,
      type: file.type,
      size: file.size,
      path,
      token: data.token,
    });
  }

  return { ok: true, uploads };
}

export async function completeGuestPhotoUploads(
  uploads: Omit<GuestPhotoSignedUpload, "token">[],
): Promise<{ ok: true; count: number } | { ok: false; error: string }> {
  const validationError = validateGuestPhotoBatch(uploads);
  if (validationError) return { ok: false, error: validationError };

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch {
    return {
      ok: false,
      error: "사진 업로드 설정이 완료되지 않았습니다. 서버 환경 변수를 확인해 주세요.",
    };
  }

  const uploadedPaths = uploads.map((upload) => upload.path);

  for (const upload of uploads) {
    if (!upload.path.startsWith("guest/")) {
      return { ok: false, error: "업로드 경로가 올바르지 않습니다." };
    }
  }

  const rows = uploads.map((upload) => ({
    storage_path: upload.path,
    original_filename: upload.name.slice(0, 255),
    content_type: upload.type || "application/octet-stream",
    file_size: upload.size,
  }));

  const { error } = await admin.from("guest_photos").insert(rows);

  if (error) {
    console.error("[completeGuestPhotoUploads] db", error.message);
    await admin.storage.from("guest-uploads").remove(uploadedPaths);
    return { ok: false, error: "기록 저장에 실패했습니다. 잠시 후 다시 시도해 주세요." };
  }

  return { ok: true, count: uploads.length };
}
