/** 탑승장소 — DB `wedding_rsvps_boarding_place_check` 및 서버 검증과 동일하게 유지 */
export const WEDDING_BUS_BOARDING_PLACES = ["녹동", "고흥", "순천"] as const;

export type WeddingBusBoardingPlace = (typeof WEDDING_BUS_BOARDING_PLACES)[number];
