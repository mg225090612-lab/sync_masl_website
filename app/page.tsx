'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 스크린샷 기준 메뉴 구성
  const navMenus = [
    {
      title: 'MASL',
      path: '/',
      sub: [{ name: '26 Spring', path: '/masl/26s' }]
    },
    {
      title: 'GVR',
      path: '/gvr/rate',
      sub: [
        { name: 'Rate', path: '/gvr/rate' },
        { name: 'View', path: '/gvr/view' }
      ]
    },
    {
      title: 'Champions',
      path: '/champions',
      sub: [{ name: 'Tournament', path: '/champions/bracket' }]
    },
    {
      title: 'Predictions',
      path: '#',
      sub: [{ name: 'Coming Soon', path: '#' }]
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 TOP NAVIGATION (스크린샷 스타일 반영) */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-20 items-center justify-start gap-12">
            {navMenus.map((menu) => (
              <div 
                key={menu.title}
                className="relative group py-7"
                onMouseEnter={() => setActiveMenu(menu.title)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className={`text-sm font-black tracking-widest transition-all uppercase ${
                  activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'
                }`}>
                  {menu.title}
                </button>

                {/* 드롭다운 서브 메뉴 (스크린샷 투명 박스 스타일) */}
                <div className={`absolute left-0 top-[80%] w-48 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1730]/90 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
                  activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0 translate-y-0'
                }`}>
                  {/* 스크린샷의 'ACTIVE SEASON' 같은 헤더 (선택 사항) */}
                  {menu.title === 'MASL' && (
                    <div className="px-4 py-2 text-[9px] font-black tracking-[0.2em] text-cyan-400/50 uppercase">Active Season</div>
                  )}
                  
                  <div className="flex flex-col gap-1">
                    {menu.sub.map((s) => (
                      <Link 
                        key={s.name} 
                        href={s.path}
                        className="rounded-xl px-4 py-3 text-xs font-bold text-white transition-all hover:bg-cyan-400/10 hover:text-cyan-300"
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* 🔥 사이버틱 배경 레이어 */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl">
        {/* 🚀 헤더 섹션 */}
        <div className="mb-16">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
            MASL 26 SPRING HUB
          </div>
          <div className="mt-6">
            <h1 className="text-6xl md:text-9xl font-black italic tracking-[-0.05em] leading-none uppercase">
              <span className="text-white">Sports </span>
              <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">Platform</span>
            </h1>
            <div className="mt-6 h-[4px] w-32 bg-gradient-to-r from-cyan-400 to-lime-400 shadow-[0_0_25px_rgba(34,211,238,0.6)]" />
          </div>
        </div>

        {/* 🏟️ UPCOMING MATCH (투명 로고 버전) */}
        <div className="mb-20">
          <p className="mb-6 text-[10px] font-black tracking-[0.4em] text-cyan-400/60 uppercase">Upcoming Match / Live Event</p>
          <div className="relative overflow-hidden rounded-[50px] border border-white/5 bg-black/40 shadow-2xl">
            <div className="relative aspect-[21/9] w-full flex items-center justify-center">
              <img src="/images/match_bg.png" alt="Match BG" className="absolute inset-0 h-full w-full object-cover opacity-20" />
              <div className="relative z-10 flex w-full items-center justify-around px-6 md:px-20">
                <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="group transition-all duration-500 hover:scale-110">
                  <div className="h-40 w-40 md:h-72 md:w-72 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <img src="/teams/빵빵이의 축구교실.png" alt="Team Left" className="h-full w-full object-contain filter brightness-125 group-hover:drop-shadow-[0_0_40px_rgba(34,211,238,0.7)]" />
                  </div>
                </Link>

                <div className="flex flex-col items-center">
                  <span className="text-6xl md:text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">VS</span>
                  <div className="mt-6 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-6 py-2 backdrop-blur-2xl text-cyan-300 text-[10px] font-black tracking-[0.4em] uppercase">March 31 / 18:00</div>
                </div>

                <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="group transition-all duration-500 hover:scale-110">
                  <div className="h-40 w-40 md:h-72 md:w-72 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <img src="/teams/김영준에게 축구를 배우다.png" alt="Team Right" className="h-full w-full object-contain filter brightness-125 group-hover:drop-shadow-[0_0_40px_rgba(57,255,20,0.7)]" />
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 🏆 TOURNAMENT BRACKET */}
        <div className="mb-20">
          <h2 className="text-2xl font-black italic mb-8 tracking-[0.15em] uppercase text-white">Tournament <span className="text-cyan-300">Bracket</span></h2>
          <div className="relative min-h-[500px] flex items-center justify-center rounded-[50px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-inner">
             <div className="relative text-center">
              <div className="mb-6 text-7xl animate-bounce">⚽</div>
              <p className="text-2xl font-black italic text-white/80 tracking-widest uppercase">Bracket Updating...</p>
              <p className="text-sm text-white/30 mt-3 font-medium uppercase tracking-[0.2em]">Pre-Tournament Data Processing</p>
            </div>
          </div>
        </div>

        {/* 🏢 FOOTER 로고 */}
        <div className="mt-40 text-center opacity-10 font-black text-7xl italic tracking-tighter select-none">
          MASL <span className="text-cyan-400">&</span> SYNC
        </div>

      </div>
    </div>
  );
}