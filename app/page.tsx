'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function HomePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);

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

  const matches = [
    {
      id: 1,
      bg: "/images/match_bg_2.png",
      teamA: "빵빵이의 축구교실",
      teamB: "김영준에게 축구를 배우다",
      date: "APRIL 02 / 19:30 KST"
    },
    {
      id: 2,
      bg: "/images/match_bg_1.png",
      teamA: "옥지의 축구교실",
      teamB: "바르셨노라",
      date: "APRIL 02 / 19:00 KST"
    }
  ];

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % matches.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + matches.length) % matches.length);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101f] px-6 pb-20 pt-15 text-white font-sans">
      
      {/* 🌐 NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 md:px-6 h-20 flex items-center justify-between w-full">
          <div className="flex items-center gap-4 md:gap-12">
            {navMenus.map((menu) => (
              <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
                <a 
                  href={menu.path} 
                  className={`block py-2 text-xs md:text-sm font-black tracking-widest transition-all uppercase cursor-pointer ${
                    menu.title === 'Predictions' 
                      ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                      : (activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40 group-hover:text-white')
                  }`}
                >
                  {menu.title}
                </a>

                <div className={`absolute left-0 top-[85%] w-52 overflow-hidden rounded-[24px] border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-3xl transition-all duration-300 ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0 translate-y-0'}`}>
                  {menu.title === 'MASL' && (
                    <div className="px-4 py-2 text-[9px] font-black tracking-[0.2em] text-cyan-400/40 uppercase border-b border-white/5 mb-1">Active Season</div>
                  )}
                  <div className="flex flex-col gap-1">
                    {menu.sub.map((s) => (
                      <a key={s.name} href={s.path} className="rounded-xl px-4 py-3 text-[11px] font-bold text-white/80 transition-all hover:bg-cyan-400/10 hover:text-cyan-300 uppercase tracking-tight">
                        {s.name}
                      </a>
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
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#06101f_0%,#040b16_45%,#01050a_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl relative z-10 flex flex-col min-h-[75vh]">
        
        {/* 💡 타이틀을 다시 화면 중앙 정렬(text-center, items-center)로 복구했습니다. 여백은 그대로 최소화! */}
        <div className="animate-in fade-in slide-in-from-top-6 duration-1000 mt-0 flex flex-col items-center">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-cyan-400/50"></div>
            <p className="text-[10px] md:text-xs font-black tracking-[0.6em] text-cyan-400 uppercase italic drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
              MASL Live Event
            </p>
            <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-cyan-400/50"></div>
          </div>
          
          <h2 className="text-5xl md:text-[5.5rem] font-black italic uppercase tracking-tighter leading-[0.9] text-center">
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]">
              Upcoming
            </span>
            <br />
            <span className="text-cyan-400 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
              Matches
            </span>
          </h2>
        </div>

        {/* 🚀 슬라이더 컨테이너 (mt-4 유지) */}
        <div className="relative w-full mt-8 mb-10">
          
          {/* ⬅️ 화살표 */}
          <button 
            onClick={prevSlide} 
            className="absolute -left-5 md:-left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-[#06101f]/90 backdrop-blur-md border border-cyan-400/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-400 hover:text-black hover:scale-110 transition-all group"
          >
            <span className="text-3xl md:text-4xl font-black -ml-1 md:-ml-2">‹</span>
          </button>

          {/* ➡️ 화살표 */}
          <button 
            onClick={nextSlide} 
            className="absolute -right-5 md:-right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-[#06101f]/90 backdrop-blur-md border border-cyan-400/30 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:bg-cyan-400 hover:text-black hover:scale-110 transition-all group"
          >
            <span className="text-3xl md:text-4xl font-black -mr-1 md:-mr-2">›</span>
          </button>

          {/* 💡 카드 본체 */}
          <div className="relative overflow-hidden rounded-[60px] border border-white/5 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] aspect-[21/9] w-full">
            {matches.map((match, idx) => (
              <div 
                key={match.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out group ${
                  idx === currentIdx ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img src={match.bg} alt="Match Background" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-110" />
                
                <div className="relative z-10 h-full w-full">
                  <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square flex items-center justify-center">
                    <Link href={`/masl/26s/team/${encodeURIComponent(match.teamA)}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                      <img src={`/teams/${match.teamA}.png`} className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_90px_rgba(34,211,238,0.5)] transition-all" alt="Team Left" />
                    </Link>
                  </div>
                  
                  <div className="absolute left-[76.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square flex items-center justify-center">
                    <Link href={`/masl/26s/team/${encodeURIComponent(match.teamB)}`} className="block w-full h-full transition-all duration-500 hover:scale-105 active:scale-95">
                      <img src={`/teams/${match.teamB}.png`} className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_100px_rgba(57,255,20,0.5)] transition-all" alt="Team Right" />
                    </Link>
                  </div>
                  
                  <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                    <div className="rounded-full border border-cyan-400/15 bg-[#06101f]/95 px-12 py-3.5 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
                      <p className="text-xs md:text-sm font-black tracking-[0.4em] text-cyan-300 uppercase italic">{match.date}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* 하단 도트 */}
          <div className="flex justify-center gap-3 mt-6 relative z-20">
            {matches.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentIdx(idx)}
                className={`h-2 transition-all duration-300 rounded-full ${idx === currentIdx ? 'w-10 bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}`} 
              />
            ))}
          </div>

        </div>

        {/* 하단 로고 */}
        <div className="mt-20 text-center opacity-10 font-black text-8xl italic tracking-tighter select-none relative z-10 uppercase">
          Masl & Sync
        </div>
      </div>
    </div>
  );
}