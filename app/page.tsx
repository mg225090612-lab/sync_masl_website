'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 🌐 네비게이션 데이터 (구조 통일하여 에러 방지)
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
      options: { redirectTo: redirectUrl },
    });
    if (error) alert('로그인 에러: ' + error.message);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 TOP NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 md:px-6 h-20 flex items-center justify-between w-full">
          
          {/* 메뉴 리스트 */}
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

                <div className={`absolute left-0 top-[85%] w-52 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-3xl transition-all duration-300 ${
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

          {/* Sign In 버튼 */}
          <button 
            onClick={handleGoogleLogin}
            className="flex-shrink-0 ml-2 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-2.5 text-[10px] md:text-[11px] font-black tracking-widest text-cyan-300 transition-all hover:bg-cyan-400 hover:text-black uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* 🔥 BACKGROUND LAYER */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* 🚀 HEADER SECTION (MASL로 변경 및 극대화) */}
        <div className="mb-32 animate-in fade-in slide-in-from-top-6 duration-1000">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2.5 text-[12px] font-black uppercase tracking-[0.4em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] mb-10">
            Mungyeong Amateur Sports League
          </div>
          <div className="relative">
            <h1 className="text-[10rem] md:text-[16rem] font-black italic tracking-[-0.08em] leading-[0.8] uppercase select-none">
              <span className="bg-gradient-to-br from-white via-white to-white/20 bg-clip-text text-transparent block">MASL</span>
            </h1>
            <div className="mt-12 h-[8px] w-60 bg-gradient-to-r from-cyan-400 to-lime-400 shadow-[0_0_40px_rgba(34,211,238,0.8)] rounded-full" />
          </div>
        </div>

        {/* 🏟️ UPCOMING MATCHES SECTION (텍스트 크게 강조) */}
        <div className="mb-24 relative z-0 space-y-12">
          <div className="space-y-4">
            <p className="text-[13px] font-black tracking-[0.6em] text-cyan-400/50 uppercase italic">Live Event Stream</p>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white drop-shadow-2xl">
              Upcoming <span className="text-cyan-400">Matches</span>
            </h2>
          </div>

          {/* 🏟️ 1. 남자축구 경기 (원본 비율 및 수치 고수) */}
          <div className="relative overflow-hidden rounded-[60px] border border-white/5 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] group aspect-[21/9]">
            <img src="/images/match_bg_1.png" alt="Match Background 1" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-110" />
            <div className="relative z-10 h-full w-full">
              <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                  <img src="/teams/빵빵이의 축구교실.png" className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_90px_rgba(34,211,238,0.5)] transition-all" alt="Team Left" />
                </Link>
              </div>
              <div className="absolute left-[76.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                  <img src="/teams/김영준에게 축구를 배우다.png" className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_100px_rgba(57,255,20,0.5)] transition-all" alt="Team Right" />
                </Link>
              </div>
              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="rounded-full border border-cyan-400/15 bg-[#06101f]/95 px-12 py-3.5 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
                  <p className="text-xs md:text-sm font-black tracking-[0.4em] text-cyan-300 uppercase italic">APRIL 04 / 19:30 KST</p>
                </div>
              </div>
            </div>
          </div>

          {/* 🏟️ 2. 여자축구 경기 (원본 비율 및 수치 고수) */}
          <div className="relative overflow-hidden rounded-[60px] border border-white/5 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] group aspect-[21/9]">
            <img src="/images/match_bg_2.png" alt="Match Background 2" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-110" />
            <div className="relative z-10 h-full w-full">
              <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("옥지의 축구교실")}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                  <img src="/teams/옥지의 축구교실.png" className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_90px_rgba(34,211,238,0.5)] transition-all" alt="Team Left" />
                </Link>
              </div>
              <div className="absolute left-[76.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square flex items-center justify-center">
                <Link href={`/masl/26s/team/${encodeURIComponent("바르셨노라")}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                  <img src="/teams/바르셨노라.png" className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_100px_rgba(57,255,20,0.5)] transition-all" alt="Team Right" />
                </Link>
              </div>
              <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                <div className="rounded-full border border-cyan-400/15 bg-[#06101f]/95 px-12 py-3.5 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
                  <p className="text-xs md:text-sm font-black tracking-[0.4em] text-cyan-300 uppercase italic">APRIL 04 / 19:00 KST</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🏆 TOURNAMENT BRACKET */}
        <div className="mb-24 relative z-10 text-center">
          <h2 className="text-3xl font-black italic mb-10 tracking-[0.2em] uppercase">Tournament <span className="text-cyan-300">Bracket</span></h2>
          <div className="relative min-h-[550px] flex items-center justify-center rounded-[60px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-inner transition-all hover:bg-white/[0.04] group/bracket">
             <div className="absolute inset-0 overflow-hidden rounded-[60px] opacity-10 group-hover/bracket:opacity-20 transition-opacity">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.3),transparent_70%)]" />
             </div>
             <div className="relative text-center">
              <div className="mb-8 text-8xl animate-bounce">⚽</div>
              <p className="text-3xl font-black italic text-white/90 tracking-widest uppercase">BRACKET UPDATING...</p>
              <p className="text-sm text-white/30 mt-4 font-black uppercase tracking-[0.3em] italic">Pre-Tournament Data Processing</p>
            </div>
          </div>
        </div>

        {/* 🏢 FOOTER */}
        <div className="mt-60 text-center opacity-10 font-black text-8xl italic tracking-tighter select-none relative z-10 uppercase">
          Masl & Sync
        </div>
      </div>
    </div>
  );
}