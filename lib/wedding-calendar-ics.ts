/** 결혼식 일정 RFC 5545 (.ics) 본문 — API 라우트와 동일 내용 유지 */

export function buildWeddingIcs(): string {
  const dtStamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const summary = "준영❤️승효 결혼합니다!";
  const description = "2026년 6월 20일 토요일 오후 1시 40분\\n아이벡스컨벤션";
  const location = "경기 광명시 양지로 17 AK 플라자 광명 5층 아이벡스컨벤션";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//snyo//Wedding//KO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:snyo-wedding-20260620@snyo.local",
    `DTSTAMP:${dtStamp}`,
    "DTSTART:20260620T044000Z",
    "DTEND:20260620T054000Z",
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
