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
      <body className="min-h-screen bg-[#050816] text-white antialiased">
        <div className="relative flex min-h-screen flex-col overflow-x-hidden">
          {/* Background */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_bottom,rgba(34,197,94,0.10),transparent_28%),linear-gradient(180deg,#050816_0%,#0b1220_45%,#050816_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.18]" />
            <div className="absolute left-1/2 top-0 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
          </div>

          {/* Header */}
          <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07101f]/70 backdrop-blur-2xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Navbar />
            </div>
          </header>

          {/* Hero strip */}
          <section className="relative border-b border-white/10">
            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
              <div className="flex flex-col gap-4">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-[0.18em] text-cyan-300 uppercase backdrop-blur-md">
                  MASL / GVR
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
                    Modern Sports
                    <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                      {" "}
                      Community Platform
                    </span>
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
                    매치 정보, 팀 데이터, 유저 평점이 하나로 연결된 세련된 스포츠 커뮤니티 경험
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Main */}
          <main className="flex-1">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
              <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                <div className="p-4 sm:p-6 lg:p-8">{children}</div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-8 border-t border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-white/50 sm:flex-row sm:px-6 lg:px-8">
              <p>© 2026 MASL / GVR. All rights reserved.</p>
              <p className="tracking-[0.2em] text-white/35 uppercase">
                Elevated UI for athletes & fans
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}