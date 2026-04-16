import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "윤준영 ♡ 남승효",
  description: "따뜻하고 손편지 같은 무드의 모바일 웨딩 초대장",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
