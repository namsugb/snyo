-- 탑승 장소에 '녹동' 추가 (녹동 / 고흥 / 순천)

alter table if exists public.wedding_rsvps
  drop constraint if exists wedding_rsvps_boarding_place_check;

alter table if exists public.wedding_rsvps
  add constraint wedding_rsvps_boarding_place_check
  check (boarding_place in ('녹동', '고흥', '순천'));

comment on table public.wedding_rsvps is '전세버스 탑승 여부 (성명, 동승자 명단, 탑승장소: 녹동·고흥·순천)';
