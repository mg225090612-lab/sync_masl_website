'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 🌐 글로벌 네비게이션 메뉴 데이터
  const navMenus = [
    {
      title: 'MASL',
      path: '/',
      sub: [{ name: '26 Spring Hub', path: '/masl/26s' }]
    },
    {
      title: 'GVR',
      path: '/gvr/rate',
      sub: [
        { name: 'Rate Players', path: '/gvr/rate' },
        { name: 'View Results', path: '/gvr/view' }
      ]
    },
    {
      title: 'Champions',
      path: '/champions',
      sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }]
    },
    {
      title: 'Predictions',
      path: '#',
      sub: [{ name: 'Coming Soon', path: '#' }]
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 TOP NAVIGATION BAR (스크린샷 스타일 완벽 반영) */}
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

                {/* 드롭다운 서브 메뉴 박스 */}
                <div className={`absolute left-0 top-[85%] w-52 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1730]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl transition-all duration-300 ${
                  activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0 translate-y-0'
                }`}>
                  {menu.title === 'MASL' && (
                    <div className="px-4 py-2 text-[9px] font-black tracking-[0.2em] text-cyan-400/40 uppercase border-b border-white/5 mb-1">Active Season</div>
                  )}
                  <div className="flex flex-col gap-1">
                    {menu.sub.map((s) => (
                      <Link 
                        key={s.name} 
                        href={s.path}
                        className="rounded-xl px-4 py-3 text-[11px] font-bold text-white/80 transition-all hover:bg-cyan-400/10 hover:text-cyan-300 uppercase tracking-tight"
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

      {/* 🔥 배경 레이어 (그라데이션 + 그리드 패턴) */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* 🚀 헤더 섹션 */}
        <div className="mb-20 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            MASL 26 SPRING HUB
          </div>
          <div className="mt-8">
            <h1 className="text-7xl md:text-[10rem] font-black italic tracking-[-0.06em] leading-[0.85] uppercase">
              <span className="text-white block">Sports</span>
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-lime-300 bg-clip-text text-transparent">Platform</span>
            </h1>
            <div className="mt-10 h-[5px] w-40 bg-gradient-to-r from-cyan-400 to-lime-400 shadow-[0_0_30px_rgba(34,211,238,0.8)] rounded-full" />
          </div>
        </div>

{/* 🏟️ UPCOMING MATCH (로고 크기 및 위치 살짝 조정) */}
        <div className="mb-24 relative z-0">
          <p className="mb-6 text-[11px] font-black tracking-[0.5em] text-cyan-400/50 uppercase italic">Upcoming Match / Live Event</p>

          <div className="relative overflow-hidden rounded-[60px] border border-white/5 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] group aspect-[21/9]">
            {/* 배경 이미지 */}
            <img src="/images/match_bg.png" alt="Match Background" className="absolute inset-0 h-full w-full object-cover opacity-15 transition-transform duration-[2s] group-hover:scale-110" />
            
            {/* 컨텐츠 레이어 (absolute positioning 사용) */}
            <div className="relative z-10 h-full w-full">
              
              {/* 왼쪽 팀 (김영준에게 축구를 배우다) - 크기 살짝 줄이고, 중앙 쪽으로 살짝 이동 */}
              <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square flex items-center justify-center pointer-events-none">
                <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="block w-full h-full pointer-events-auto transition-all duration-500 hover:scale-105 active:scale-95">
                  <img 
                    src="/teams/김영준에게 축구를 배우다.png" 
                    className="w-full h-full object-contain filter brightness-110 opacity-95 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_90px_rgba(57,255,20,0.5)] transition-all" 
                    alt="Team Left" 
                  />
                </Link>
              </div>

              {/* 오른쪽 팀 (빵빵이의 축구교실) - 크기 살짝 줄이고, 중앙 쪽으로 살짝 이동 */}
              <div className="absolute left-3/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square flex items-center justify-center pointer-events-none">
                <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="block w-full h-full pointer-events-auto transition-all duration-500 hover:scale-105 active:scale-95">
                  <img 
                    src="/teams/빵빵이의 축구교실.png" 
                    className="w-full h-full object-contain filter brightness-110 opacity-95 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_90px_rgba(34,211,238,0.5)] transition-all" 
                    alt="Team Right" 
                  />
                </Link>
              </div>

              {/* 경기 날짜 하단 중앙 배치 (z-index 및 배경 조정) */}
              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="rounded-full border border-cyan-400/10 bg-[#06101f]/90 px-12 py-3.5 backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-auto">
                  <p className="text-xs md:text-sm font-black tracking-[0.4em] text-cyan-300 uppercase italic">APRIL 04 / 19:30 KST</p>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        {/* 🏆 TOURNAMENT BRACKET */}
        <div className="mb-24 relative z-10">
          <h2 className="text-3xl font-black italic mb-10 tracking-[0.2em] uppercase">
            Tournament <span className="text-cyan-300">Bracket</span>
          </h2>

          <div className="relative min-h-[550px] flex items-center justify-center rounded-[60px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-inner transition-all hover:bg-white/[0.04] group/bracket">
             <div className="absolute inset-0 overflow-hidden rounded-[60px] opacity-10 group-hover/bracket:opacity-20 transition-opacity">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.3),transparent_70%)]" />
             </div>
             <div className="relative text-center">
              <div className="mb-8 text-8xl animate-bounce">⚽</div>
              <p className="text-3xl font-black italic text-white/90 tracking-widest uppercase">
                BRACKET UPDATING...
              </p>
              <p className="text-sm text-white/30 mt-4 font-black uppercase tracking-[0.3em] italic">
                Pre-Tournament Data Processing
              </p>
            </div>
          </div>
        </div>

        {/* 🏢 FOOTER */}
        <div className="mt-60 text-center opacity-10 font-black text-8xl italic tracking-tighter select-none relative z-10">
          MASL <span className="text-cyan-400">&</span> SYNC
        </div>

      </div>
    </div>
  );
}