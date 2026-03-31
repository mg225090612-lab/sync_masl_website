'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 🌐 글로벌 네비게이션 메뉴 데이터 (Predictions 제거됨)
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
    }
  ];

  // 🔐 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) alert('로그인 에러: ' + error.message);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 TOP NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        {/* 💡 컨테이너 너비를 w-full로 강제하고 양쪽 정렬을 확실하게 줌 */}
        <div className="mx-auto max-w-6xl px-4 md:px-6 w-full h-20 flex items-center justify-between">
          
          {/* 왼쪽: 메뉴 리스트 (화면이 좁을 때 겹치지 않게 gap 반응형 처리) */}
          <div className="flex items-center gap-4 md:gap-12">
            {navMenus.map((menu) => (
              <div 
                key={menu.title}
                className="relative group py-7"
                onMouseEnter={() => setActiveMenu(menu.title)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className={`text-xs md:text-sm font-black tracking-widest transition-all uppercase ${
                  activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'
                }`}>
                  {menu.title}
                </button>

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

          {/* 💡 오른쪽: 구글 로그인 버튼 (화면이 좁아도 안 찌그러지게 flex-shrink-0 추가, 눈에 띄게 테두리/그림자 추가) */}
          <button 
            onClick={handleGoogleLogin}
            className="flex-shrink-0 ml-2 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-2.5 text-[10px] md:text-[11px] font-black tracking-widest text-cyan-300 transition-all hover:bg-cyan-400 hover:text-black uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95"
          >
            Sign In
          </button>

        </div>
      </nav>

      {/* 🔥 배경 레이어 */}
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

        {/* 🏟️ UPCOMING MATCHES SECTION */}
        <div className="mb-24 relative z-0 space-y-12">
          <p className="mb-6 text-[11px] font-black tracking-[0.5em] text-cyan-400/50 uppercase italic">Upcoming Matches / Live Event</p>

          {/* 🏟️ 1. 남자축구 경기 */}
          <div className="relative overflow-hidden rounded-[60px] border border-white/5 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] group aspect-[21/9]">
            <img src="/images/match_bg_1.png" alt="Match Background 1" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-110" />
            
            <div className="relative z-10 h-full w-full">
              {/* 왼쪽 팀 (빵빵이) */}
              <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                  <img 
                    src="/teams/빵빵이의 축구교실.png" 
                    className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_90px_rgba(34,211,238,0.5)] transition-all" 
                    alt="Team Left" 
                  />
                </Link>
              </div>

              {/* 오른쪽 팀 (김영준) */}
              <div className="absolute left-[76.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                  <img 
                    src="/teams/김영준에게 축구를 배우다.png" 
                    className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_100px_rgba(57,255,20,0.5)] transition-all" 
                    alt="Team Right" 
                  />
                </Link>
              </div>

              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="rounded-full border border-cyan-400/15 bg-[#06101f]/95 px-12 py-3.5 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
                  <p className="text-xs md:text-sm font-black tracking-[0.4em] text-cyan-300 uppercase italic">APRIL 04 / 19:30 KST</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🏟️ 2. 여자축구 경기 */}
          <div className="relative overflow-hidden rounded-[60px] border border-white/5 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] group aspect-[21/9]">
            <img src="/images/match_bg_2.png" alt="Match Background 2" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-110" />
            
            <div className="relative z-10 h-full w-full">
              {/* 왼쪽 팀 (옥지) */}
              <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("옥지의 축구교실")}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                  <img 
                    src="/teams/옥지의 축구교실.png" 
                    className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_90px_rgba(34,211,238,0.5)] transition-all" 
                    alt="Team Left" 
                  />
                </Link>
              </div>

              {/* 오른쪽 팀 (바르셨노라) */}
              <div className="absolute left-[76.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("바르셨노라")}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                  <img 
                    src="/teams/바르셨노라.png" 
                    className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_100px_rgba(57,255,20,0.5)] transition-all" 
                    alt="Team Right" 
                  />
                </Link>
              </div>

              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="rounded-full border border-cyan-400/15 bg-[#06101f]/95 px-12 py-3.5 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
                  <p className="text-xs md:text-sm font-black tracking-[0.4em] text-cyan-300 uppercase italic">APRIL 11 / 17:00 KST</p>
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