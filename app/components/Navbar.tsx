'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-[100] px-6 py-4 flex justify-between items-center backdrop-blur-xl border-b border-cyan-300/10 bg-[#06101f]/70 text-white">
      
      {/* LOGO */}
      <Link
        href="/"
        className="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-lime-300 hover:opacity-80 transition"
      >
        MASL / GVR
      </Link>

      {/* MENU */}
      <div className="flex gap-6 md:gap-8 font-semibold text-sm items-center">

        {/* MASL */}
        <div className="group relative cursor-pointer">
          <span className="text-white/70 hover:text-cyan-300 transition">MASL</span>

          <div className="absolute top-full left-0 w-full h-4"></div>

          <div className="absolute hidden group-hover:block bg-[#081426] border border-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,0.15)] rounded-2xl p-2 w-48 mt-4 -left-10 backdrop-blur-xl">
            <p className="p-3 text-[0.6rem] font-black text-white/30 px-4 uppercase tracking-[0.2em]">
              Active Season
            </p>

            <Link
              href="/masl/26s"
              className="block p-4 bg-cyan-300/10 text-cyan-200 rounded-xl font-bold hover:bg-cyan-300/20 transition"
            >
              26 Spring
            </Link>
          </div>
        </div>

        {/* GVR */}
        <div className="group relative cursor-pointer">
          <span className="text-white/70 hover:text-lime-300 transition">GVR</span>

          <div className="absolute top-full left-0 w-full h-4"></div>

          <div className="absolute hidden group-hover:block bg-[#081426] border border-cyan-300/10 shadow-[0_0_30px_rgba(34,211,238,0.15)] rounded-2xl p-2 w-48 mt-4 -left-10 backdrop-blur-xl">
            <Link
              href="/gvr/rate"
              className="block p-3 rounded-xl hover:bg-cyan-300/10 hover:text-cyan-200 transition"
            >
              Rate
            </Link>

            <Link
              href="/gvr/view"
              className="block p-3 rounded-xl hover:bg-cyan-300/10 hover:text-cyan-200 transition"
            >
              View
            </Link>
          </div>
        </div>

        {/* DIRECT LINKS */}
        <Link
          href="/champions"
          className="text-white/70 hover:text-cyan-300 transition"
        >
          Champions
        </Link>

        <span className="text-white/20 cursor-not-allowed">
          Predictions
        </span>
      </div>
    </nav>
  );
}