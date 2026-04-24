/**
 * 공개 URL + 브라우저/서버 공용 클라이언트용 키.
 * - 신규 Supabase: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 * - 기존 프로젝트: NEXT_PUBLIC_SUPABASE_ANON_KEY
 * 둘 중 하나만 넣으면 됩니다. 둘 다 있으면 publishable을 우선합니다.
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_URL이 없습니다. .env.local에 프로젝트 URL을 넣어주세요.",
    );
  }

  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const anonKey = publishable || anon;

  if (!anonKey) {
    throw new Error(
      "[Supabase] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY 중 하나를 .env.local에 넣어주세요.",
    );
  }

  return { url, anonKey };
}
