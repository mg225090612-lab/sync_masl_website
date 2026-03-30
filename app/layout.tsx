import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MASL / GVR 스포츠 커뮤니티",
  description: "스포츠 매치 정보 및 유저 평점 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#040b16] text-white antialiased">
        <div className="relative flex min-h-screen flex-col overflow-hidden">
          {/* 배경 글로우 */}
          <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(103,232,249,0.10),transparent_24%),radial-gradient(circle_at_top_right,rgba(190,242,100,0.08),transparent_20%),radial-gradient(circle_at_bottom,rgba(56,189,248,0.10),transparent_28%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

          {/* 상단 바 */}
          <Navbar />

          {/* 본문 */}
          <main className="flex-1 pt-20">
            {children}
          </main>

          {/* 푸터 */}
          <footer className="border-t border-cyan-300/10 bg-[#07111d]/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 text-sm">
              <p className="tracking-[0.25em] uppercase text-white/35">
                © 2026 MASL / SYNC
              </p>
              <p className="text-cyan-300/55">
                All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}