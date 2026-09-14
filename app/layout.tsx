import type { Metadata } from "next";
import { Oswald } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MASL / GVR 스포츠 커뮤니티",
  description:
    "대학 스포츠 경기 일정과 결과, 선수 평점, 승부 예측을 한곳에서 확인하세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${oswald.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full bg-canvas font-sans text-fg antialiased">
        {/* Pretendard Variable (dynamic subset) — React 19 hoists this into <head> */}
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          precedence="default"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />

        {/* 단 하나의 배경 처리 — 스타디움 플러드라이트 워시 (spec §4) */}
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[480px] bg-[radial-gradient(70%_100%_at_50%_0%,rgba(14,165,233,0.07),transparent_70%)]" />

        <div className="flex min-h-screen flex-col">
          {/* 상단 바 */}
          <Navbar />

          {/* 본문 */}
          <main className="flex-1 pt-16">{children}</main>

          {/* 푸터 (spec §5.15) */}
          <footer className="border-t border-edge bg-canvas">
            <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-8 text-sm text-fg-dim sm:flex-row sm:px-6">
              <p className="font-display text-sm font-medium uppercase tracking-[0.04em] text-fg-mid">
                MASL / SYNC
              </p>
              <p>© 2026 MASL / SYNC. All rights reserved.</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
