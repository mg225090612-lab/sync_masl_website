'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function PredictionsPage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring Hub', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate Players', path: '/gvr/rate' }, { name: 'View Results', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }] },
    { title: 'Predictions', path: '/predictions', sub: [{ name: 'Match Predict', path: '/predictions' }] }
  ];

  useEffect(() => {
    async function fetchUserAndVotes() {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (user) {
        const { data: votes } = await supabase
          .from('predictions')
          .select('match_id, predicted_team')
          .eq('user_id', user.id);

        if (votes) {
          const voteMap: Record<string, string> = {};
          votes.forEach(v => { voteMap[v.match_id] = v.predicted_team; });
          setUserVotes(voteMap);
        }
      }
    }
    fetchUserAndVotes();
  }, []);

  useEffect(() => {
    async function loadMatches() {
      // 기준 시간: 현재 시간으로부터 1일(24시간) 전
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const { data } = await supabase
        .from('matches')
        .select('*')
        .gte('match_date', oneDayAgo.toISOString()) // 1일 전보다 미래인 경기만
        .order('match_date', { ascending: true });

      setMatches(data || []);
      setLoading(false);
    }
    loadMatches();
  }, []);

  const handleGoogleLogin = async () => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) alert('로그인 에러: ' + error.message);
  };

  const handleVote = async (matchId: string, teamName: string) => {
    if (!currentUser) return alert('로그인이 필요합니다. 우측 상단에서 로그인해주세요.');
    if (userVotes[matchId]) return alert('이미 이 경기에 투표하셨습니다.');

    const { error } = await supabase.from('predictions').insert({
      match_id: matchId,
      user_id: currentUser.id,
      predicted_team: teamName
    });

    if (!error) {
      setUserVotes(prev => ({ ...prev, [matchId]: teamName }));
      alert(`[${teamName}] 승리에 투표하셨습니다!`);
    } else {
      alert('투표 실패: ' + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black animate-pulse uppercase">Syncing Matches...</div>;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06101f] px-6 pb-32 pt-48 text-white font-sans">
      
      {/* 🌐 TOP NAVIGATION BAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 md:px-6 h-20 flex items-center justify-between w-full">
          <div className="flex items-center gap-4 md:gap-12">
            {navMenus.map((menu) => (
              <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
                <button className={`text-xs md:text-sm font-black tracking-widest transition-all uppercase ${activeMenu === menu.title || menu.title === 'Predictions' ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'}`}>
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
            {currentUser ? 'Logged In' : 'Sign In'}
          </button>
        </div>
      </nav>

      {/* 🔥 BACKGROUND LAYER */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />

      <div className="mx-auto max-w-6xl relative z-10">
        <div className="mb-24 animate-in fade-in slide-in-from-top-6 duration-1000">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-6 py-2.5 text-[12px] font-black uppercase tracking-[0.4em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)] mb-8">
            MASL FAN PREDICTIONS
          </div>
          <h1 className="text-6xl md:text-[8rem] font-black italic tracking-tighter uppercase leading-[0.85]">
            Match <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-lime-300 bg-clip-text text-transparent">Predict</span>
          </h1>
          <p className="mt-8 text-white/40 font-black tracking-widest uppercase text-sm">승리할 팀을 예측하고 팬들의 투표 현황을 확인하세요.</p>
        </div>

        <div className="space-y-32">
          {matches.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-white/10 rounded-[3rem]">
              <p className="text-white/30 font-black tracking-[0.3em] uppercase italic text-xl">진행 중인 예측 경기가 없습니다.</p>
            </div>
          ) : (
            matches.map((match, index) => (
              <div key={match.id} className="relative z-0 group">
                <div className="relative overflow-hidden rounded-[60px] border border-white/5 bg-black/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] aspect-[21/9]">
                  <img src={`/images/match_bg_${(index % 2) + 1}.png`} alt="Match Background" className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-[2s] group-hover:scale-110" />
                  
                  <div className="relative z-10 h-full w-full">
                    <div className="absolute left-1/4 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3/5 aspect-square flex items-center justify-center">
                      <img src={`/teams/${match.team_a}.png`} className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_90px_rgba(34,211,238,0.5)] transition-all" alt={match.team_a} />
                    </div>

                    <div className="absolute left-[76.5%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[65%] aspect-square flex items-center justify-center">
                      <img src={`/teams/${match.team_b}.png`} className="w-full h-full object-contain filter brightness-110 drop-shadow-[0_0_50px_rgba(255,255,255,0.15)] group-hover:drop-shadow-[0_0_100px_rgba(57,255,20,0.5)] transition-all" alt={match.team_b} />
                    </div>

                    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                      <div className="rounded-full border border-cyan-400/15 bg-[#06101f]/95 px-12 py-3.5 backdrop-blur-3xl shadow-[0_15px_50px_rgba(0,0,0,0.9)]">
                        <p className="text-xs md:text-sm font-black tracking-[0.4em] text-cyan-300 uppercase italic">
                          {new Date(match.match_date).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute:'2-digit', hour12: false })} KST
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-6 px-10">
                  <button 
                    onClick={() => handleVote(match.id, match.team_a)}
                    disabled={!!userVotes[match.id]}
                    className={`relative overflow-hidden rounded-[2rem] py-8 border-2 transition-all duration-300 group/btn ${
                      userVotes[match.id] === match.team_a 
                        ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_30px_rgba(34,211,238,0.4)]' 
                        : userVotes[match.id] 
                          ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed' 
                          : 'border-white/10 bg-[#0b1730] hover:border-cyan-400/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${userVotes[match.id] === match.team_a ? 'text-cyan-300' : 'text-white/40'}`}>Predict Win</span>
                      <span className={`text-2xl font-black italic uppercase tracking-tighter ${userVotes[match.id] === match.team_a ? 'text-white' : 'text-white/80 group-hover/btn:text-cyan-300'}`}>
                        {match.team_a}
                      </span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleVote(match.id, match.team_b)}
                    disabled={!!userVotes[match.id]}
                    className={`relative overflow-hidden rounded-[2rem] py-8 border-2 transition-all duration-300 group/btn ${
                      userVotes[match.id] === match.team_b 
                        ? 'border-lime-400 bg-lime-400/20 shadow-[0_0_30px_rgba(163,230,53,0.4)]' 
                        : userVotes[match.id] 
                          ? 'border-white/5 bg-white/5 opacity-50 cursor-not-allowed' 
                          : 'border-white/10 bg-[#0b1730] hover:border-lime-400/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${userVotes[match.id] === match.team_b ? 'text-lime-300' : 'text-white/40'}`}>Predict Win</span>
                      <span className={`text-2xl font-black italic uppercase tracking-tighter ${userVotes[match.id] === match.team_b ? 'text-white' : 'text-white/80 group-hover/btn:text-lime-300'}`}>
                        {match.team_b}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-40 text-center opacity-10 font-black text-6xl italic tracking-tighter select-none uppercase">
          MASL <span className="text-cyan-400">&</span> SYNC
        </div>
      </div>
    </div>
  );
}