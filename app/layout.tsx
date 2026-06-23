import type { Metadata } from "next";
import "./globals.css";
import "./travence.css";

export const metadata: Metadata = {
  title: "TRAVENCE | 여행의 새로운 기준",
  description:
    "여행을 더 안전하고, 더 가볍고, 더 스마트하게. 트래번스는 글로벌 여행 브랜드를 발굴하고 키웁니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
