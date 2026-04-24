import { NextResponse } from "next/server";
import { buildWeddingIcs } from "@/lib/wedding-calendar-ics";

/** Safari/iOS에서 Blob 다운로드 대신 네비게이션으로 열면 캘린더 연동이 더 잘 되는 경우가 많음 */
export async function GET() {
  const ics = buildWeddingIcs();
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="wedding-2026-06-20.ics"',
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
