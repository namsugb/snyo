-- 탑승 인원(headcount) → 동승자 명단(companion_names text[])
-- 추가 동승자 이름 배열; 비어 있으면 대표(guest_name)만 탑승으로 간주

alter table if exists public.wedding_rsvps
  add column if not exists companion_names text[] not null default '{}';

update public.wedding_rsvps
set companion_names = case
  when headcount <= 1 then '{}'::text[]
  else ARRAY['(기존 제출: 탑승 인원 ' || headcount::text || '명, 이름 미기재)']
end;

alter table if exists public.wedding_rsvps
  drop column if exists headcount;

comment on column public.wedding_rsvps.companion_names is '추가 동승자 이름 목록; 빈 배열이면 신청 성함만 탑승';

comment on table public.wedding_rsvps is '전세버스 탑승 여부 (성명, 동승자 명단, 탑승장소)';
