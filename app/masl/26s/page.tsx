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
  const [matches, setMatches] = useState<any[]>([]); // 💡 추가된 경기 데이터
  const [loading, setLoading] = useState(true);

  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring Hub', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate Players', path: '/gvr/rate' }, { name: 'View Results', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }] },
  ];

  const handleGoogleLogin = async () => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) alert('로그인 에러: ' + error.message);
  };

  useEffect(() => {
    const loadHubData = async () => {
      setLoading(true);
      // 1. 팀 목록
      const { data: teamData } = await supabase.from('players').select('team_name').eq('category', activeTab);
      if (teamData) {
        setTeams(Array.from(new Set(teamData.map(p => p.team_name))));
      }

      // 2. 대진표 데이터 (4강 -> 결승 순서)
      const { data: matchData } = await supabase
        .from('matches')
        .select('*')
        .eq('sport_type', activeTab)
        .order('round', { ascending: false })
        .order('match_order', { ascending: true });

      setMatches(matchData || []);
      setLoading(false);
    };
    loadHubData();
  }, [activeTab]);

  // 라운드별 경기 필터링
  const getMatchesByRound = (round: number) => matches.filter(m => m.round === round);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 NAV BAR (기존 다크테마 + 로그인 버튼) */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 md:px-6 h-20 flex items-center justify-between w-full">
          <div className="flex items-center gap-4 md:gap-12">
            {navMenus.map((menu) => (
              <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
                <button className={`text-xs md:text-sm font-black tracking-widest transition-all uppercase ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'}`}>
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
          <button onClick={handleGoogleLogin} className="flex-shrink-0 ml-2 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-2.5 text-[10px] md:text-[11px] font-black tracking-widest text-cyan-300 transition-all hover:bg-cyan-400 hover:text-black uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95">
            Sign In
          </button>
        </div>
      </nav>

      {/* 🔥 BACKGROUND LAYER */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        {/* HEADER */}
        <div className="mb-20">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-5 py-2 text-[11px] font-black uppercase tracking-[0.3em] text-cyan-300 mb-8 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            MASL SEASON 26 SPRING
          </div>
          <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none uppercase mb-16">
            Spring <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">Hub</span>
          </h1>

          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-8 border-b border-white/5">
            {sports.map(s => (
              <button key={s} onClick={() => setActiveTab(s)}
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
          
          {/* LEFT COL */}
          <div className="lg:col-span-8 space-y-16">
            
            {/* 🏟️ UPCOMING MATCH */}
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400/50 mb-8 italic">Upcoming Match</h3>
              <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden border border-white/5 bg-black/40 group shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img src="/images/match_bg_1.png" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-[2s]" />
                <div className="relative z-10 h-full flex items-center justify-around px-10">
                  <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="group/team flex flex-col items-center hover:scale-105 transition-transform">
                    <img src="/teams/김영준에게 축구를 배우다.png" className="w-24 md:w-32 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]" />
                  </Link>
                  <span className="text-5xl md:text-7xl font-black italic text-cyan-400 drop-shadow-lg">VS</span>
                  <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="group/team flex flex-col items-center hover:scale-105 transition-transform">
                    <img src="/teams/빵빵이의 축구교실.png" className="w-24 md:w-32 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 🏆 TOURNAMENT BRACKET (DB 연동 + 자동 렌더링) */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 italic">Tournament Bracket</h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest italic">Live Updates</span>
                </div>
              </div>
              
              <div className="relative min-h-[500px] rounded-[50px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl overflow-x-auto shadow-inner p-10 md:p-14">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.03),transparent_70%)] pointer-events-none" />
                
                <div className="relative z-10 grid grid-cols-2 gap-10 min-w-[600px] h-full">
                  {/* Semi-Finals (Round 4) */}
                  <div className="flex flex-col justify-around gap-8">
                    <p className="text-[10px] font-black text-cyan-400/50 tracking-[0.3em] uppercase text-center">Semi-Finals</p>
                    {getMatchesByRound(4).map((match) => (
                      <div key={match.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5 shadow-lg space-y-4 relative">
                        {/* winnder_id는 DB 오타 그대로 사용 */}
                        <TeamRow name={match.team_a} score={match.score_a} isWinner={match.winnder_id === match.team_a} />
                        <div className="h-[1px] bg-white/5" />
                        <TeamRow name={match.team_b} score={match.score_b} isWinner={match.winnder_id === match.team_b} />
                      </div>
                    ))}
                    {getMatchesByRound(4).length === 0 && (
                      <div className="text-center py-20 text-white/20 font-black italic text-xs tracking-widest border border-dashed border-white/10 rounded-[2rem]">
                        TBD
                      </div>
                    )}
                  </div>

                  {/* Finals (Round 2) */}
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] font-black text-lime-400 tracking-[0.3em] uppercase text-center mb-6">The Grand Final</p>
                    {getMatchesByRound(2).map((match) => (
                      <div key={match.id} className="relative group">
                        {/* 💡 우승자 빛나는 효과 */}
                        {match.winnder_id && (
                          <div className="absolute inset-0 bg-cyan-400/20 blur-[50px] animate-pulse rounded-full" />
                        )}
                        <div className={`relative bg-[#0b1730]/80 p-10 rounded-[3rem] border-2 transition-all duration-500 backdrop-blur-md ${
                          match.winnder_id ? 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.3)] scale-105' : 'border-white/10'
                        }`}>
                          <div className="space-y-6 text-center">
                            <FinalTeam name={match.team_a} score={match.score_a} isWinner={match.winnder_id === match.team_a} />
                            <span className="block text-3xl font-black italic text-white/10">VS</span>
                            <FinalTeam name={match.team_b} score={match.score_b} isWinner={match.winnder_id === match.team_b} />
                          </div>
                        </div>
                      </div>
                    ))}
                    {getMatchesByRound(2).length === 0 && (
                      <div className="text-center py-20 text-white/20 font-black italic text-xs tracking-widest border border-dashed border-white/10 rounded-[3rem]">
                        FINAL MATCH TBD
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 👥 RIGHT COL (Sidebar) */}
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
                        <span className="w-8 h-8 flex-shrink-0 rounded-full bg-white/5 flex items-center justify-center text-[10px] group-hover:bg-cyan-400 group-hover:text-black transition-all">→</span>
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

        <div className="mt-40 text-center opacity-10 font-black text-7xl italic tracking-tighter select-none">
          MASL <span className="text-cyan-400">&</span> SYNC
        </div>
      </div>
    </div>
  );
}

// 서브 컴포넌트: 4강 팀 표시
function TeamRow({ name, score, isWinner }: { name: string; score?: number; isWinner: boolean }) {
  return (
    <div className={`flex justify-between items-center transition-all ${isWinner ? 'text-cyan-300' : 'text-white/40'}`}>
      <div className="flex items-center gap-3">
        <span className="font-black italic text-sm uppercase">{name || 'TBD'}</span>
        {isWinner && <span className="text-[8px] font-black bg-cyan-400/20 text-cyan-300 px-2 py-1 rounded-full border border-cyan-400/30">WIN</span>}
      </div>
      {score !== undefined && score !== null && (
        <span className="font-black italic text-lg">{score}</span>
      )}
    </div>
  );
}

// 서브 컴포넌트: 결승전 팀 표시 (우승자 화려하게)
function FinalTeam({ name, score, isWinner }: { name: string; score?: number; isWinner: boolean }) {
  return (
    <div className={`transition-all duration-700 flex flex-col items-center gap-2 ${isWinner ? 'scale-110' : name && isWinner === false ? 'opacity-30 filter grayscale' : ''}`}>
      {isWinner && <p className="text-cyan-400 font-black text-[10px] tracking-widest animate-bounce">🏆 CHAMPION</p>}
      <div className="flex items-center gap-4">
        <p className={`text-2xl md:text-3xl font-black italic uppercase tracking-tighter ${isWinner ? 'text-cyan-300 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]' : 'text-white'}`}>
          {name || 'TBD'}
        </p>
        {score !== undefined && score !== null && (
          <span className={`text-3xl font-black italic ${isWinner ? 'text-lime-300' : 'text-white/50'}`}>{score}</span>
        )}
      </div>
    </div>
  );
}