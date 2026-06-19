import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
