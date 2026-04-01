'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type SportTab = '남자축구' | '여자축구' | '남자농구' | '여자배구';

export default function Masl26sPage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const sports: SportTab[] = ["남자축구", "여자축구", "남자농구", "여자배구"];
  
  // 1. 초기값을 설정할 때 브라우저에 저장된 값이 있는지 먼저 확인합니다.
  const [activeTab, setActiveTab] = useState<SportTab>("남자축구");
  const [teams, setTeams] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  // 💡 [추가] 페이지가 처음 켜질 때, 이전에 보던 종목이 있다면 불러옵니다.
  useEffect(() => {
    const savedTab = localStorage.getItem('masl_active_tab') as SportTab;
    if (savedTab && sports.includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // 💡 [추가] 종목(Tab)을 바꿀 때마다 브라우저에 몰래 저장해둡니다.
  useEffect(() => {
    localStorage.setItem('masl_active_tab', activeTab);
  }, [activeTab]);

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
      const { data: teamData } = await supabase.from('players').select('team_name').eq('category', activeTab);
      if (teamData) {
        setTeams(Array.from(new Set(teamData.map(p => p.team_name))));
      }

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

  // --- 이후 렌더링 및 컴포넌트 코드는 유저님이 주신 것과 100% 동일하게 유지 ---
  const semis = matches.filter(m => m.round === 4);
  const semi1 = semis.find(m => m.match_order === 1) || null;
  const semi2 = semis.find(m => m.match_order === 2) || null;
  const finalMatch = matches.find(m => m.round === 2) || null;
  const championName = finalMatch?.winnder_id || null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
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
                      <Link key={s.name} href={s.path} className="rounded-xl px-4 py-3 text-[11px] font-bold text-white/80 transition-all hover:bg-cyan-400/10 hover:text-cyan-300 uppercase tracking-tight">{s.name}</Link>
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

      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl relative z-10">
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
          <div className="lg:col-span-8 space-y-16">
            <div className="relative rounded-[40px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl p-6 md:p-12 shadow-inner">
                <div className="relative z-10 flex flex-col items-center w-full font-sans">
                  <div className="w-full md:w-2/3 z-10 mb-2">
                    <ChampionCard name={championName} />
                  </div>
                  <div className="flex flex-col items-center w-full opacity-80">
                    <div className="h-12 border-l-2 border-dashed border-cyan-400/50 relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-cyan-400 rotate-45 shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
                    </div>
                  </div>
                  <div className="w-full md:w-3/4 z-10">
                    <MatchCard match={finalMatch} label="The Grand Final" isFinal={true} />
                  </div>
                  <div className="hidden md:flex flex-col items-center w-full opacity-30">
                    <div className="h-8 border-l-2 border-white/20"></div>
                    <div className="w-1/2 h-8 border-t-2 border-l-2 border-r-2 border-white/20 rounded-t-2xl"></div>
                  </div>
                  <div className="flex md:hidden h-12 border-l-2 border-white/20 opacity-30"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full z-10">
                    <MatchCard match={semi1} label="Semi-Final 1" />
                    <MatchCard match={semi2} label="Semi-Final 2" />
                  </div>
                </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-8 italic">Participating Teams</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="py-10 text-center font-black italic text-cyan-300/30 animate-pulse text-xs tracking-widest uppercase">Fetching {activeTab}...</div>
                ) : (
                  teams.map(name => (
                    <Link href={`/masl/26s/team/${encodeURIComponent(name)}`} key={name} className="block group">
                      <div className="p-6 rounded-[2rem] border border-white/5 bg-white/[0.03] backdrop-blur-xl transition-all duration-300 group-hover:border-cyan-400/40 group-hover:bg-white/5 flex justify-between items-center shadow-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center font-black italic text-cyan-400 group-hover:bg-cyan-400 group-hover:text-black transition-colors text-sm">
                            {name.charAt(0)}
                          </div>
                          <span className="font-black italic uppercase text-sm truncate max-w-[150px] group-hover:text-cyan-300 transition-colors">{name}</span>
                        </div>
                        <span className="w-8 h-8 flex-shrink-0 rounded-full bg-white/5 flex items-center justify-center text-[10px] group-hover:bg-cyan-400 group-hover:text-black transition-all">→</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// 나머지 컴포넌트(MatchCard, TeamRow, ChampionCard)는 그대로 붙여넣으시면 됩니다.
function MatchCard({ match, label, isFinal = false }: { match: any; label: string; isFinal?: boolean }) {
  if (!match) return <div className="bg-white/5 p-6 rounded-3xl border border-dashed border-white/10 shadow-lg flex flex-col items-center justify-center min-h-[142px]"><p className="text-[10px] font-black text-white/20 tracking-[0.2em] uppercase mb-2">{label}</p><p className="text-sm font-black italic text-white/10">TBD</p></div>;
  const isWinA = match.winnder_id === match.team_a;
  const isWinB = match.winnder_id === match.team_b;
  return (
    <div className={`relative p-6 rounded-3xl border transition-all duration-300 shadow-xl flex flex-col justify-center min-h-[142px] ${isFinal ? 'bg-[#0b1730]/90 border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.15)] md:scale-105' : 'bg-white/5 border-white/5 hover:border-white/20'}`}>
      <div className="relative z-10 w-full">
        <p className={`text-[9px] font-black tracking-[0.2em] uppercase text-center mb-4 ${isFinal ? 'text-cyan-400' : 'text-white/30'}`}>{label}</p>
        <div className="space-y-4">
          <TeamRow name={match.team_a} score={match.score_a} isWinner={isWinA} isFinal={isFinal} />
          <div className="h-[1px] w-full bg-white/5" />
          <TeamRow name={match.team_b} score={match.score_b} isWinner={isWinB} isFinal={isFinal} />
        </div>
      </div>
    </div>
  );
}

function TeamRow({ name, score, isWinner, isFinal }: { name: string; score?: number; isWinner: boolean; isFinal: boolean }) {
  return (
    <div className={`flex justify-between items-center transition-colors w-full ${isWinner ? 'text-cyan-300' : 'text-white/40'}`}>
      <div className="flex items-center gap-3">
        <span className={`font-black italic uppercase truncate ${isFinal && isWinner ? 'text-base md:text-lg' : 'text-xs md:text-sm'}`}>{name || 'TBD'}</span>
        {isWinner && <span className="text-[8px] font-black bg-cyan-400/20 text-cyan-300 px-1.5 py-0.5 rounded-md border border-cyan-400/30">WIN</span>}
      </div>
      {score !== undefined && score !== null && <span className={`font-black italic ${isFinal && isWinner ? 'text-lime-300 text-lg md:text-xl' : 'text-sm md:text-base'}`}>{score}</span>}
    </div>
  );
}

function ChampionCard({ name }: { name: string | null }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 rounded-[2.5rem] border-2 border-dashed transition-all duration-700 min-h-[160px] w-full ${name ? 'border-cyan-400 bg-gradient-to-t from-cyan-400/20 to-transparent shadow-[0_0_50px_rgba(34,211,238,0.3)] md:scale-110' : 'border-white/10 bg-white/5'}`}>
      {name ? (<><p className="text-cyan-400 font-black text-[11px] tracking-widest uppercase mb-3 animate-bounce">🏆 Champion</p><p className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] text-center leading-tight">{name}</p></>) : (<><p className="text-[10px] font-black text-white/20 tracking-[0.2em] uppercase mb-2">Champion</p><p className="text-xl font-black italic text-white/10">TBD</p></>)}
    </div>
  );
}