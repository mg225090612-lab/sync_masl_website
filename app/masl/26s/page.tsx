'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type SportTab = '남자축구' | '여자축구' | '남자농구' | '여자배구';

export default function Masl26sPage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const sports: SportTab[] = ["남자축구", "여자축구", "남자농구", "여자배구"];
  const [activeTab, setActiveTab] = useState<SportTab>("남자축구");
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 글로벌 내비게이션
  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring Hub', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate Players', path: '/gvr/rate' }, { name: 'View Results', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }] },
  ];

  // DB에서 해당 종목의 팀 리스트 로드
  useEffect(() => {
    const loadHubData = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('players')
        .select('team_name')
        .eq('category', activeTab);

      if (data) {
        const uniqueTeams = Array.from(new Set(data.map(p => p.team_name)));
        setTeams(uniqueTeams as string[]);
      }
      setLoading(false);
    };
    loadHubData();
  }, [activeTab]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 글로벌 내비게이션 바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 flex h-20 items-center justify-start gap-12">
          {navMenus.map((menu) => (
            <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
              <button className={`text-sm font-black tracking-widest transition-all uppercase ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'}`}>
                {menu.title}
              </button>
              <div className={`absolute left-0 top-[85%] w-52 rounded-[24px] border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-3xl transition-all duration-300 ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0 translate-y-0'}`}>
                <div className="flex flex-col gap-1">
                  {menu.sub.map((s) => (
                    <Link key={s.name} href={s.path} className="rounded-xl px-4 py-3 text-[11px] font-bold text-white hover:bg-cyan-400/10 hover:text-cyan-300 uppercase">
                      {s.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* 🔥 배경 레이어 */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* 헤더 섹션 */}
        <div className="mb-20">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300 mb-8 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            MASL SEASON 26 SPRING
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none uppercase mb-16">
            Spring <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">Hub</span>
          </h1>

          {/* 종목 선택 탭 (남자축구, 여자축구, 남자농구, 여자배구) */}
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 border-b border-white/5">
            {sports.map(s => (
              <button 
                key={s} 
                onClick={() => setActiveTab(s)} 
                className={`px-10 py-4 rounded-full text-xs font-black tracking-widest transition-all whitespace-nowrap ${
                  activeTab === s ? 'bg-cyan-400 text-black shadow-[0_0_30px_rgba(34,211,238,0.5)] scale-105' : 'bg-white/5 text-white/40 hover:bg-white/10'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-16">
          {/* 🏆 메인 섹션: 토너먼트 대진표 결과 */}
          <div className="lg:col-span-8 space-y-12">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/50 italic">{activeTab} Tournament Bracket</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic">Live Updates</span>
              </div>
            </div>

            <div className="relative min-h-[600px] rounded-[60px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.03),transparent_70%)]"></div>
              
              {/* 대진표 데이터 영역 */}
              <div className="relative z-10 text-center px-10">
                <div className="mb-8 text-8xl transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 select-none opacity-20">⚽</div>
                <h4 className="text-4xl font-black italic tracking-widest uppercase mb-4 text-white/80">{activeTab} 대진표 준비 중</h4>
                <p className="text-sm font-medium text-white/20 tracking-widest uppercase leading-relaxed">
                  현재 {activeTab} 토너먼트 데이터를 동기화 중입니다.<br/>
                  경기 결과에 따라 대진표가 자동으로 업데이트됩니다.
                </p>
                
                <div className="mt-12 inline-flex items-center gap-4 px-8 py-3 rounded-2xl bg-white/5 border border-white/10">
                   <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
                   <span className="text-[10px] font-black tracking-widest uppercase text-cyan-300">Syncing with server...</span>
                </div>
              </div>
            </div>
          </div>

          {/* 👥 사이드바: 종목별 참여 팀 리스트 */}
          <aside className="lg:col-span-4 space-y-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 italic">Participating Teams</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="py-10 text-center font-black italic text-cyan-300/30 animate-pulse text-xs tracking-widest uppercase">Fetching {activeTab} Teams...</div>
                ) : (
                  teams.map(name => (
                    <Link href={`/masl/26s/team/${encodeURIComponent(name)}`} key={name} className="block group">
                      <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 group-hover:border-cyan-400/40 group-hover:bg-white/5 flex justify-between items-center shadow-lg">
                        <div className="flex items-center gap-5">
                          <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center font-black italic text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors text-sm">
                            {name.charAt(0)}
                          </div>
                          <span className="font-black italic uppercase tracking-tighter text-lg group-hover:text-cyan-300 transition-colors">{name}</span>
                        </div>
                        <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] group-hover:bg-cyan-400 group-hover:text-black transition-all">→</span>
                      </div>
                    </Link>
                  ))
                )}
                {!loading && teams.length === 0 && (
                  <div className="py-10 text-center border border-dashed border-white/5 rounded-[2rem]">
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-widest italic">No Data Found</p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* 하단 로고 */}
        <div className="mt-40 text-center opacity-10 font-black text-7xl italic tracking-tighter select-none">
          MASL <span className="text-cyan-400">&</span> SYNC
        </div>
      </div>
    </div>
  );
}