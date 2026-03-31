'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 💡 Predictions 메뉴가 추가된 네비게이션 데이터!
  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring Hub', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate Players', path: '/gvr/rate' }, { name: 'View Results', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }] },
    { title: 'Predictions', path: '/predictions', sub: [{ name: 'Match Predict', path: '/predictions' }] }
  ];

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
          <div className="flex items-center gap-4 md:gap-12">
            {navMenus.map((menu) => (
              <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
                <button className={`text-xs md:text-sm font-black tracking-widest transition-all uppercase ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'}`}>
                  {menu.title}
                </button>
                <div className={`absolute left-0 top-[85%] w-52 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-3xl transition-all duration-300 ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0 translate-y-0'}`}>
                  {menu.title === 'MASL' && (
                    <div className="px-4 py-2 text-[9px] font-black tracking-[0.2em] text-cyan-400/40 uppercase border-b border-white/5 mb-1">Active Season</div>
                  )}
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
          <button onClick={handleGoogleLogin} className="flex-shrink-0 ml-2 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-2.5 text-[10px] md:text-[11px] font-black tracking-widest text-cyan-300 transition-all hover:bg-cyan-400 hover:text-black uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95">
            Sign In
          </button>
        </div>
      </nav>

      {/* 🔥 BACKGROUND LAYER */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-20 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            Mungyeong Amateur Sports League
          </div>
          <div className="mt-8">
            <h1 className="text-7xl md:text-[10rem] font-black italic tracking-[-0.06em] leading-[0.85] uppercase">
              <span className="text-white block">MASL</span>
              <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-lime-300 bg-clip-text text-transparent italic">26 SUMMER</span>
            </h1>
            <div className="mt-10 h-[5px] w-40 bg-gradient-to-r from-cyan-400 to-lime-400 shadow-[0_0_30px_rgba(34,211,238,0.8)] rounded-full" />
          </div>
        </div>

        <div className="mb-24 relative z-0 space-y-12">
          <div className="space-y-2">
            <p className="text-[11px] font-black tracking-[0.5em] text-cyan-400/50 uppercase italic">Live Event</p>
            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">Upcoming Matches</h2>
          </div>

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

        <div className="mt-60 text-center opacity-10 font-black text-8xl italic tracking-tighter select-none relative z-10 uppercase">
          Masl & Sync
        </div>
      </div>
    </div>
  );
}