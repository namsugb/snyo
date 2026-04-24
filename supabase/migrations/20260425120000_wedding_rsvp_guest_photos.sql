-- 참석 의사 + 하객 사진 메타데이터
-- Storage 버킷: guest-uploads (서버에서 service_role로 업로드)

create table if not exists public.wedding_rsvps (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  side text not null check (side in ('groom', 'bride')),
  guest_name text not null,
  headcount int not null check (headcount >= 1 and headcount <= 99),
  meal text not null check (meal in ('planned', 'no', 'undecided')),
  privacy_agreed boolean not null default true
);

create index if not exists wedding_rsvps_created_at_idx on public.wedding_rsvps (created_at desc);

create table if not exists public.guest_photos (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  storage_path text not null unique,
  original_filename text,
  content_type text,
  file_size bigint
);

create index if not exists guest_photos_created_at_idx on public.guest_photos (created_at desc);

alter table public.wedding_rsvps enable row level security;
alter table public.guest_photos enable row level security;

-- 공개 청첩장: 로그인 없이 참석 의사만 insert (anon 키)
create policy "wedding_rsvps_insert_anon"
  on public.wedding_rsvps
  for insert
  to anon
  with check (
    privacy_agreed is true
    and length(trim(guest_name)) between 1 and 120
  );

create policy "wedding_rsvps_insert_authenticated"
  on public.wedding_rsvps
  for insert
  to authenticated
  with check (
    privacy_agreed is true
    and length(trim(guest_name)) between 1 and 120
  );

-- guest_photos: RLS 켜두고 정책 없음 → anon/authenticated는 접근 불가
-- service_role 클라이언트는 RLS 우회로 insert + Storage 업로드

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'guest-uploads',
  'guest-uploads',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

comment on table public.wedding_rsvps is '하객 참석 의사 (신랑/신부 측, 인원, 식사)';
comment on table public.guest_photos is '하객 업로드 사진 메타데이터 (실제 파일은 Storage guest-uploads)';
