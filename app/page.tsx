'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring Hub', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate Players', path: '/gvr/rate' }, { name: 'View Results', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }] },
    { title: 'Predictions', path: '#', sub: [{ name: 'Coming Soon', path: '#' }] }
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101f] text-white font-sans">
      
      {/* 🌐 TOP NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-8 flex h-24 items-center justify-start gap-12">
          <Link href="/" className="text-2xl font-black italic tracking-tighter text-cyan-400 mr-8">MASL</Link>
          {navMenus.map((menu) => (
            <div key={menu.title} className="relative group py-8" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
              <button className={`text-xs font-black tracking-[0.2em] transition-all uppercase ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40'}`}>
                {menu.title}
              </button>
              <div className={`absolute left-0 top-[90%] w-56 rounded-[2rem] border border-white/10 bg-[#0b1730]/95 p-3 shadow-2xl backdrop-blur-3xl transition-all duration-300 ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0'}`}>
                {menu.sub.map((s) => (
                  <Link key={s.name} href={s.path} className="block rounded-2xl px-5 py-4 text-[11px] font-bold text-white/70 hover:bg-cyan-400/10 hover:text-cyan-300 uppercase tracking-tight transition-all">
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* 🔥 BACKGROUND EFFECTS */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,255,0.15),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(57,255,20,0.1),transparent_40%),linear-gradient(180deg,#040b16_0%,#06101f_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:60px_60px]" />

      <main className="mx-auto max-w-7xl px-8 pt-64 pb-40">
        
        {/* 🚀 HERO TITLE SECTION (크기 최적화) */}
        <div className="relative mb-40 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <div className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-2 text-xs font-black uppercase tracking-[0.4em] text-cyan-300 mb-10 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
            Active Season: 26 Spring Hub
          </div>
          <h1 className="text-6xl md:text-[7.5rem] font-black italic tracking-[-0.04em] leading-[0.9] uppercase italic">
            <span className="text-white opacity-90">SPORTS</span><br/>
            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-lime-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.3)]">PLATFORM</span>
          </h1>
          <div className="mt-12 h-1.5 w-60 bg-gradient-to-r from-cyan-400 to-lime-400 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.6)]" />
        </div>

        {/* 🏟️ MEGA UPCOMING MATCHES (웅장한 메인 섹션) */}
        <section className="space-y-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-black tracking-[0.6em] text-cyan-400 uppercase mb-4 italic">Featured Events</h2>
              <p className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Upcoming <span className="text-white/20">Battles</span></p>
            </div>
          </div>

          {/* 🏟️ 1. MENS SOCCER (웅장한 확장형 카드) */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-lime-500/20 rounded-[80px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative overflow-hidden rounded-[70px] border border-white/10 bg-[#0a1628] shadow-2xl aspect-[16/7] md:aspect-[21/7]">
              <img src="/images/match_bg_1.png" alt="BG" className="absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-[3s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06101f] via-transparent to-transparent" />
              
              <div className="relative z-10 h-full w-full flex items-center justify-around px-10">
                <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="w-1/3 transition-all duration-500 hover:scale-110 active:scale-95">
                  <img src="/teams/빵빵이의 축구교실.png" className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]" alt="Team A" />
                </Link>

                <div className="flex flex-col items-center gap-6">
                  <div className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <p className="text-xs md:text-lg font-black tracking-[0.5em] text-cyan-400 uppercase italic">APRIL 04 / 19:30 KST</p>
                  </div>
                  <span className="text-7xl md:text-9xl font-black italic opacity-10 italic tracking-tighter select-none">VS</span>
                </div>

                <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="w-1/3 transition-all duration-500 hover:scale-110 active:scale-95">
                  <img src="/teams/김영준에게 축구를 배우다.png" className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]" alt="Team B" />
                </Link>
              </div>
            </div>
          </div>

          {/* 🏟️ 2. WOMENS SOCCER (동일한 웅장함 유지) */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-lime-500/20 to-cyan-500/20 rounded-[80px] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative overflow-hidden rounded-[70px] border border-white/10 bg-[#0a1628] shadow-2xl aspect-[16/7] md:aspect-[21/7]">
              <img src="/images/match_bg_2.png" alt="BG" className="absolute inset-0 h-full w-full object-cover opacity-30 transition-transform duration-[3s] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#06101f] via-transparent to-transparent" />
              
              <div className="relative z-10 h-full w-full flex items-center justify-around px-10">
                <Link href={`/masl/26s/team/${encodeURIComponent("옥지의 축구교실")}`} className="w-1/3 transition-all duration-500 hover:scale-110 active:scale-95">
                  <img src="/teams/옥지의 축구교실.png" className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]" alt="Team Left" />
                </Link>

                <div className="flex flex-col items-center gap-6">
                  <div className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                    <p className="text-xs md:text-lg font-black tracking-[0.5em] text-lime-400 uppercase italic">APRIL 04 / 19:00 KST</p>
                  </div>
                  <span className="text-7xl md:text-9xl font-black italic opacity-10 italic tracking-tighter select-none">VS</span>
                </div>

                <Link href={`/masl/26s/team/${encodeURIComponent("바르셨노라")}`} className="w-1/3 transition-all duration-500 hover:scale-110 active:scale-95">
                  <img src="/teams/바르셨노라.png" className="w-full h-auto drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]" alt="Team Right" />
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* 🏆 TOURNAMENT BRACKET (안정감 있는 배치) */}
        <div className="mt-60">
          <h2 className="text-5xl font-black italic mb-16 tracking-tight uppercase italic">Tournament <span className="text-cyan-300">Archive</span></h2>
          <div className="relative min-h-[600px] flex items-center justify-center rounded-[80px] border border-white/5 bg-white/[0.01] backdrop-blur-3xl group/bracket overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_70%)] group-hover/bracket:scale-150 transition-transform duration-[3s]" />
             <div className="relative text-center">
              <div className="text-9xl mb-10 filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] animate-pulse">⚽</div>
              <p className="text-4xl font-black italic text-white/80 tracking-[0.2em] uppercase">Bracket Processing</p>
              <p className="text-sm text-white/20 mt-6 font-black uppercase tracking-[0.5em] italic">Data Sync in Progress</p>
            </div>
          </div>
        </div>

        {/* 🏢 FOOTER */}
        <div className="mt-80 text-center opacity-5 font-black text-[15rem] italic tracking-[-0.1em] select-none uppercase">
          LEGACY
        </div>

      </main>
    </div>
  );
}