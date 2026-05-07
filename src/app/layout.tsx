import type { Metadata } from "next";
import { Noto_Serif_KR } from "next/font/google";
import "./globals.css";

const notoSerifKr = Noto_Serif_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-kr",
});

export const metadata: Metadata = {
  title: "AI 디렉터 스튜디오",
  description: "AI 활용 과외 수업 핵심 도구",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${notoSerifKr.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
