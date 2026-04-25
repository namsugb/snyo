-- 참석 의사 폼 -> 전세버스 탑승 여부 폼 전환
-- 입력값: 성함, 탑승인원, 탑승장소(고흥/순천)

alter table if exists public.wedding_rsvps
  drop column if exists side,
  drop column if exists meal;

alter table if exists public.wedding_rsvps
  add column if not exists boarding_place text;

update public.wedding_rsvps
set boarding_place = '순천'
where boarding_place is null;

alter table if exists public.wedding_rsvps
  alter column boarding_place set not null;

alter table if exists public.wedding_rsvps
  drop constraint if exists wedding_rsvps_boarding_place_check;

alter table if exists public.wedding_rsvps
  add constraint wedding_rsvps_boarding_place_check
  check (boarding_place in ('고흥', '순천'));

comment on table public.wedding_rsvps is '전세버스 탑승 여부 (성명, 탑승인원, 탑승장소)';
