import type { Metadata } from "next";
import "pretendard/dist/web/static/pretendard-dynamic-subset.css";
import "./globals.css";

const metadataBase = new URL("https://snyo.vercel.app");

export const metadata: Metadata = {
  metadataBase,
  title: "준영❤️승효 결혼합니다!",
  description: "6월 20일 토요일 1시 40분",
  openGraph: {
    title: "준영❤️승효 결혼합니다!",
    description: "6월 20일 토요일 1시 40분",
    images: [{ url: "/share.jpg", alt: "준영❤️승효 결혼합니다!" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "준영❤️승효 결혼합니다!",
    description: "6월 20일 토요일 1시 40분",
    images: ["/share.jpg"],
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
