import { createClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/**
 * 서버 전용(관리자). RLS 우회 — API Route / 서버 스크립트에서만 사용.
 * `SUPABASE_SERVICE_ROLE_KEY` 없으면 호출 시 에러.
 */
export function createServiceRoleClient() {
  const { url } = getSupabasePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    throw new Error(
      "[Supabase] SUPABASE_SERVICE_ROLE_KEY가 없습니다. 서버에서만 .env.local에 secret(service_role) 키를 넣어주세요.",
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
