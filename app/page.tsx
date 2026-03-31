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
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 TOP NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 flex h-20 items-center justify-start gap-12">
          {navMenus.map((menu) => (
            <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
              <button className={`text-sm font-black tracking-widest transition-all uppercase ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'}`}>
                {menu.title}
              </button>
              <div className={`absolute left-0 top-[85%] w-52 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-3xl transition-all duration-300 ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0 translate-y-0'}`}>
                <div className="flex flex-col gap-1">
                  {menu.sub.map((s) => (
                    <Link key={s.name} href={s.path} className="rounded-xl px-4 py-3 text-[11px] font-bold text-white/80 transition-all hover:bg-cyan-400/10 hover:text-cyan-300 uppercase tracking-tight">
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* 🔥 BACKGROUND LAYER */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-7xl relative z-10">
        
        {/* 🚀 HEADER SECTION (타이틀 디자인 수정 및 크기 최적화) */}
        <div className="mb-32 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            MASL 26 SPRING HUB
          </div>
          <div className="mt-8">
            <h1 className="text-6xl md:text-[8rem] font-black italic tracking-[-0.04em] leading-[0.9] uppercase">
              <span className="text-white block opacity-90">SPORTS</span>
              {/* PLATFORM 글자 디자인: 그라데이션 및 텍스트 섀도우 강조 */}
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-lime-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                PLATFORM
              </span>
            </h1>
            <div className="mt-10 h-[6px] w-48 bg-gradient-to-r from-cyan-400 to-lime-400 shadow-[0_0_35px_rgba(34,211,238,0.8)] rounded-full" />
          </div>
        </div>

        {/* 🏟️ UPCOMING MATCHES SECTION (매치 섹션 대폭 강조) */}
        <div className="mb-40 relative z-0 space-y-24">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <p className="text-[12px] font-black tracking-[0.6em] text-cyan-400 uppercase italic">Main Events</p>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* 🏟️ 1. 남자축구 경기 (더 크게 강조) */}
          <div className="relative overflow-hidden rounded-[60px] border border-white/10 bg-black/40 shadow-[0_50px_120px_rgba(0,0,0,0.7)] group aspect-[21/8] w-full transition-all duration-500 hover:border-cyan-400/30">
            <img src="/images/match_bg_1.png" alt="Match Background 1" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-[3s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
            
            <div className="relative z-10 h-full w-full">
              {/* 왼쪽 팀: 빵빵이 (사이즈 및 선명도 강화) */}
              <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="block w-full h-full transition-all duration-500 hover:scale-110 active:scale-95">
                  <img src="/teams/빵빵이의 축구교실.png" className="w-full h-full object-contain filter brightness-125 drop-shadow-[0_0_60px_rgba(34,211,238,0.3)]" alt="Team A" />
                </Link>
              </div>

              {/* 오른쪽 팀: 김영준 (사이즈 및 선명도 강화) */}
              <div className="absolute left-[76.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="block w-full h-full transition-all duration-500 hover:scale-110 active:scale-95">
                  <img src="/teams/김영준에게 축구를 배우다.png" className="w-full h-full object-contain filter brightness-125 drop-shadow-[0_0_60px_rgba(57,255,20,0.3)]" alt="Team B" />
                </Link>
              </div>

              {/* 경기 날짜: 배너를 더 웅장하게 */}
              <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="rounded-full border border-cyan-400/30 bg-[#06101f]/95 px-16 py-4 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,1)]">
                  <p className="text-sm md:text-base font-black tracking-[0.5em] text-cyan-300 uppercase italic">APRIL 04 / 19:30 KST</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🏟️ 2. 여자축구 경기 (더 크게 강조) */}
          <div className="relative overflow-hidden rounded-[60px] border border-white/10 bg-black/40 shadow-[0_50px_120px_rgba(0,0,0,0.7)] group aspect-[21/8] w-full transition-all duration-500 hover:border-lime-400/30">
            <img src="/images/match_bg_2.png" alt="Match Background 2" className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-[3s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
            
            <div className="relative z-10 h-full w-full">
              {/* 왼쪽 팀: 옥지 */}
              <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("옥지의 축구교실")}`} className="block w-full h-full transition-all duration-500 hover:scale-110 active:scale-95">
                  <img src="/teams/옥지의 축구교실.png" className="w-full h-full object-contain filter brightness-125 drop-shadow-[0_0_60px_rgba(34,211,238,0.3)]" alt="Team A" />
                </Link>
              </div>

              {/* 오른쪽 팀: 바르셨노라 */}
              <div className="absolute left-[76.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("바르셨노라")}`} className="block w-full h-full transition-all duration-500 hover:scale-110 active:scale-95">
                  <img src="/teams/바르셨노라.png" className="w-full h-full object-contain filter brightness-125 drop-shadow-[0_0_60px_rgba(57,255,20,0.3)]" alt="Team B" />
                </Link>
              </div>

              {/* 경기 날짜 */}
              <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="rounded-full border border-cyan-400/30 bg-[#06101f]/95 px-16 py-4 backdrop-blur-3xl shadow-[0_20px_60px_rgba(0,0,0,1)]">
                  <p className="text-sm md:text-base font-black tracking-[0.5em] text-cyan-300 uppercase italic">APRIL 11 / 17:00 KST</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 🏆 TOURNAMENT BRACKET */}
        <div className="mb-24 relative z-10">
          <h2 className="text-4xl font-black italic mb-12 tracking-tight uppercase">Tournament <span className="text-cyan-300">Bracket</span></h2>
          <div className="relative min-h-[600px] flex items-center justify-center rounded-[60px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-inner transition-all hover:bg-white/[0.04] group/bracket">
             <div className="absolute inset-0 overflow-hidden rounded-[60px] opacity-10 group-hover/bracket:opacity-20 transition-opacity">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.3),transparent_70%)]" />
             </div>
             <div className="relative text-center">
              <div className="mb-10 text-9xl animate-bounce">⚽</div>
              <p className="text-4xl font-black italic text-white/90 tracking-widest uppercase">BRACKET UPDATING...</p>
              <p className="text-sm text-white/30 mt-6 font-black uppercase tracking-[0.4em] italic">Pre-Tournament Data Processing</p>
            </div>
          </div>
        </div>

        {/* 🏢 FOOTER */}
        <div className="mt-60 text-center opacity-10 font-black text-9xl italic tracking-tighter select-none relative z-10 uppercase">
          MASL <span className="text-cyan-400">&</span> SYNC
        </div>
      </div>
    </div>
  );
}