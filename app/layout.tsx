import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard-dynamic-subset.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "준영❤️승효 결혼합니다!",
  description: "6월 20일 토요일 1시 40분",
  openGraph: {
    title: "준영❤️승효 결혼합니다!",
    description: "6월 20일 토요일 1시 40분",
  },
  twitter: {
    title: "준영❤️승효 결혼합니다!",
    description: "6월 20일 토요일 1시 40분",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full bg-white antialiased">
      <body className="min-h-full flex flex-col bg-white">{children}</body>
    </html>
  );
}
