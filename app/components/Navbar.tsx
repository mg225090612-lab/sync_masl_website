'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-[100] border-b border-cyan-300/10 bg-[#06101f]/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-2xl font-black tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-lime-300 hover:opacity-90 transition"
        >
          MASL / GVR
        </Link>

        <div className="flex items-center gap-8 text-sm font-bold">
          <div className="group relative">
            <span className="cursor-pointer text-white/70 transition hover:text-cyan-300">
              MASL
            </span>
            <div className="absolute left-0 top-full h-4 w-full bg-transparent" />
            <div className="absolute -left-8 mt-4 hidden w-52 rounded-2xl border border-cyan-300/10 bg-[#081426]/95 p-2 shadow-[0_0_30px_rgba(34,211,238,0.14)] backdrop-blur-xl group-hover:block">
              <p className="px-4 pb-2 pt-3 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300/45">
                Active Season
              </p>
              <Link
                href="/masl/26s"
                className="block rounded-xl border border-cyan-300/10 bg-cyan-300/10 px-4 py-3 font-black text-cyan-200 transition hover:bg-cyan-300/18"
              >
                26 Spring
              </Link>
            </div>
          </div>

          <div className="group relative">
            <span className="cursor-pointer text-white/70 transition hover:text-lime-300">
              GVR
            </span>
            <div className="absolute left-0 top-full h-4 w-full bg-transparent" />
            <div className="absolute -left-8 mt-4 hidden w-52 rounded-2xl border border-cyan-300/10 bg-[#081426]/95 p-2 shadow-[0_0_30px_rgba(34,211,238,0.14)] backdrop-blur-xl group-hover:block">
              <Link
                href="/gvr/rate"
                className="block rounded-xl px-4 py-3 font-bold text-white/75 transition hover:bg-cyan-300/10 hover:text-cyan-200"
              >
                Rate
              </Link>
              <Link
                href="/gvr/view"
                className="block rounded-xl px-4 py-3 font-bold text-white/75 transition hover:bg-cyan-300/10 hover:text-cyan-200"
              >
                View
              </Link>
            </div>
          </div>

          <Link
            href="/champions"
            className="text-white/80 transition hover:text-cyan-300"
          >
            Champions
          </Link>

          <button className="cursor-not-allowed text-white/20">
            Predictions
          </button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-300/20 to-lime-300/20" />
    </nav>
  );
}