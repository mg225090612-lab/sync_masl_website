'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function GvrRatePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [studentId, setStudentId] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring Hub', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate Players', path: '/gvr/rate' }, { name: 'View Results', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }] },
  ];

  // 1. 경기 목록 가져오기
  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const { data } = await supabase.from('matches').select('*').order('match_date', { ascending: false });
      if (data && data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]);
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  // 2. 선수 목록 및 AVG 평점 실시간 계산
  const loadPlayersWithRatings = async () => {
    if (!activeMatch) return;
    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);

    if (playerData) {
      const playersWithAvg = await Promise.all(
        playerData.map(async (player) => {
          const { data: ratingData } = await supabase.from('ratings').select('score').eq('player_id', player.id);
          const avg = ratingData && ratingData.length > 0 
            ? (ratingData.reduce((acc, cur) => acc + cur.score, 0) / ratingData.length).toFixed(1)
            : '0.0';
          return { ...player, avgRating: avg };
        })
      );
      setPlayers(playersWithAvg);
    }
  };

  useEffect(() => {
    loadPlayersWithRatings();
  }, [activeMatch]);

  const handleSubmit = async () => {
    if (!studentId || !selectedPlayer || !rating) return alert('정보를 모두 입력해주세요.');
    const { error } = await supabase.from('ratings').insert({
      match_id: activeMatch.id,
      student_id: studentId,
      player_id: selectedPlayer.id,
      score: rating
    });
    if (!error) {
      alert('평점이 등록되었습니다!');
      setSelectedPlayer(null);
      setRating(null);
      loadPlayersWithRatings(); // 평점 갱신
    } else alert('제출 실패: ' + error.message);
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black animate-pulse uppercase">Syncing Database...</div>;

  return (
    <div className="relative min-h-screen bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans overflow-x-hidden">
      
      {/* 🌐 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 flex h-20 items-center justify-start gap-12 text-[11px] font-black uppercase tracking-widest">
          {navMenus.map((menu) => (
            <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
              <button className={`transition-all ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40'}`}>{menu.title}</button>
              <div className={`absolute left-0 top-[80%] w-48 rounded-2xl border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0 translate-y-0'}`}>
                {menu.sub.map((s) => <Link key={s.name} href={s.path} className="block rounded-xl px-4 py-3 text-white/60 hover:text-cyan-300 hover:bg-white/5">{s.name}</Link>)}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl relative z-10">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-16 leading-none">
          Rate <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">Players</span>
        </h1>

        {/* 🏟️ 경기 선택 */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10 mb-10 border-b border-white/5">
          {matches.map(m => (
            <button key={m.id} onClick={() => setActiveMatch(m)} className={`flex flex-col rounded-[2.5rem] border px-10 py-6 min-w-[300px] transition-all text-left ${activeMatch?.id === m.id ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/5 bg-white/5 opacity-40'}`}>
              <span className="text-[10px] font-black text-cyan-400/60 mb-2 uppercase tracking-widest italic">{m.sport_type}</span>
              <span className="font-black italic text-xl uppercase tracking-tighter mb-1 leading-tight">{m.team_a} <br/>vs {m.team_b}</span>
            </button>
          ))}
        </div>

        {/* 👥 선수 목록 (넓은 그리드 레이아웃) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {activeMatch && (
            <>
              <TeamList title={activeMatch.team_a} players={players.filter(p => p.team_name === activeMatch.team_a)} onSelect={setSelectedPlayer} />
              <TeamList title={activeMatch.team_b} players={players.filter(p => p.team_name === activeMatch.team_b)} onSelect={setSelectedPlayer} isAway />
            </>
          )}
        </div>
      </div>

      {/* ⚡ FULLSCREEN RATE POPUP */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#06101f]/95 backdrop-blur-2xl animate-in fade-in duration-300">
          <div className="relative w-full max-w-2xl px-8 py-16 text-center">
            <button onClick={() => setSelectedPlayer(null)} className="absolute top-0 right-8 text-4xl text-white/20 hover:text-white transition-colors">✕</button>
            
            <p className="text-cyan-400 font-black tracking-[0.3em] uppercase mb-4 italic">{selectedPlayer.team_name}</p>
            <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-12">
              NO.{selectedPlayer.player_number} <br/>{selectedPlayer.name}
            </h2>

            <div className="max-w-md mx-auto space-y-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Enter Your Student ID</p>
                <input type="text" placeholder="2024XXXX" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-3xl px-8 py-6 text-xl font-black text-center focus:border-cyan-400 outline-none transition-all" />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Select Rating</p>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => (
                    <button key={v} onClick={() => setRating(v)} className={`py-5 rounded-2xl border font-black italic text-lg transition-all ${rating === v ? 'border-cyan-400 bg-cyan-400 text-black scale-95 shadow-[0_0_30px_rgba(34,211,238,0.5)]' : 'border-white/10 bg-white/5 text-white/30 hover:border-white/30'}`}>{v.toFixed(1)}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleSubmit} className="w-full py-8 rounded-[2.5rem] bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic uppercase text-2xl tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Submit Rating</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamList({ title, players, onSelect, isAway = false }: any) {
  return (
    <div className={isAway ? 'text-right' : 'text-left'}>
      <h3 className={`mb-12 text-4xl font-black italic uppercase tracking-tighter ${isAway ? 'text-lime-400' : 'text-cyan-300'}`}>{title}</h3>
      <div className="grid gap-6">
        {players.map((p: any) => (
          <button 
            key={p.id} 
            onClick={() => onSelect(p)} 
            className={`flex items-center justify-between gap-6 p-8 rounded-[3rem] border border-white/5 bg-white/[0.03] transition-all hover:bg-white/[0.07] hover:border-white/10 group ${isAway ? 'flex-row-reverse' : ''}`}
          >
            <div className={`flex items-center gap-8 ${isAway ? 'flex-row-reverse' : ''}`}>
              <div className="h-20 w-20 rounded-[1.5rem] bg-black/40 flex items-center justify-center font-black italic text-3xl text-cyan-400 group-hover:text-white transition-colors">
                {p.player_number}
              </div>
              <p className="font-black italic text-3xl uppercase tracking-tighter whitespace-nowrap">
                {p.name}
              </p>
            </div>
            
            <div className="flex flex-col items-center px-6">
              <span className="text-[10px] font-black text-white/20 uppercase mb-1">Rating</span>
              <span className="text-2xl font-black italic text-yellow-400 group-hover:scale-110 transition-transform">
                ⭐ {p.avgRating}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}