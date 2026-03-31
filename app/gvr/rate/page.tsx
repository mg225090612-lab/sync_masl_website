'use client';

import { useState, useEffect, useCallback } from 'react';
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
      const { data } = await supabase.from('matches').select('*').order('match_date', { ascending: false });
      if (data && data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]);
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  // 2. 선수 목록 및 AVG 평점 로직 (최적화)
  const loadPlayersWithRatings = useCallback(async () => {
    if (!activeMatch) return;

    // 플레이어 먼저 로드
    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);

    if (playerData) {
      // 모든 레이팅 데이터를 한 번에 가져와서 메모리에서 계산 (성능 및 정확도 향상)
      const { data: allRatings } = await supabase.from('ratings').select('player_id, score');

      const playersWithAvg = playerData.map((player) => {
        const playerRatings = allRatings?.filter((r) => r.player_id === player.id) || [];
        const avg = playerRatings.length > 0 
          ? (playerRatings.reduce((acc, cur) => acc + cur.score, 0) / playerRatings.length).toFixed(1)
          : '0.0';
        return { ...player, avgRating: avg };
      });
      
      setPlayers(playersWithAvg);
    }
  }, [activeMatch]);

  useEffect(() => {
    loadPlayersWithRatings();
  }, [loadPlayersWithRatings]);

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
      setStudentId('');
      loadPlayersWithRatings(); // 즉시 평점 갱신
    } else alert('제출 실패: ' + error.message);
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black animate-pulse uppercase">Syncing Database...</div>;

  return (
    <div className="relative min-h-screen bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
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

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10 mb-10 border-b border-white/5">
          {matches.map(m => (
            <button key={m.id} onClick={() => setActiveMatch(m)} className={`flex flex-col rounded-[2.5rem] border px-10 py-6 min-w-[300px] transition-all text-left ${activeMatch?.id === m.id ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/5 bg-white/5 opacity-40'}`}>
              <span className="text-[10px] font-black text-cyan-400/60 mb-2 uppercase tracking-widest italic">{m.sport_type}</span>
              <span className="font-black italic text-xl uppercase tracking-tighter mb-1 leading-tight">{m.team_a} <br/>vs {m.team_b}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {activeMatch && (
            <>
              <TeamList title={activeMatch.team_a} players={players.filter(p => p.team_name === activeMatch.team_a)} onSelect={setSelectedPlayer} />
              <TeamList title={activeMatch.team_b} players={players.filter(p => p.team_name === activeMatch.team_b)} onSelect={setSelectedPlayer} isAway />
            </>
          )}
        </div>
      </div>

      {/* ⚡ SEMI-TRANSPARENT MODAL (화면 전체가 아닌 중앙 팝업 스타일) */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPlayer(null)}></div>
          <div className="relative w-full max-w-xl rounded-[40px] border border-white/10 bg-[#0b1730] p-10 md:p-14 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200">
            <button onClick={() => setSelectedPlayer(null)} className="absolute top-8 right-8 text-2xl text-white/20 hover:text-white transition-colors">✕</button>
            
            <p className="text-cyan-400 font-black tracking-[0.3em] uppercase mb-4 italic text-sm text-center">{selectedPlayer.team_name}</p>
            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-12 text-center leading-none">
              NO.{selectedPlayer.player_number} {selectedPlayer.name}
            </h2>

            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-center">Student ID</p>
                <input type="text" placeholder="2024XXXX" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-lg font-black text-center focus:border-cyan-400 outline-none transition-all" />
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-center">Rating</p>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => (
                    <button key={v} onClick={() => setRating(v)} className={`py-4 rounded-xl border font-black italic text-sm transition-all ${rating === v ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg shadow-cyan-400/40' : 'border-white/10 bg-white/5 text-white/30 hover:border-white/30'}`}>{v.toFixed(1)}</button>
                  ))}
                </div>
              </div>

              <button onClick={handleSubmit} className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic uppercase text-xl tracking-[0.1em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Confirm Rating</button>
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
            
            <div className="flex flex-col items-center px-6 min-w-[100px]">
              <span className="text-[10px] font-black text-white/20 uppercase mb-1">AVG</span>
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