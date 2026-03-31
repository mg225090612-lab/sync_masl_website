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
  const [dbError, setDbError] = useState<string | null>(null);

  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring Hub', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate Players', path: '/gvr/rate' }, { name: 'View Results', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }] },
  ];

  // 1. 경기 목록 가져오기
  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (error) {
        setDbError(`Matches Error: ${error.message}`);
      } else if (data && data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]);
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  // 2. 선수 목록 및 각 선수의 평균 평점 가져오기
  useEffect(() => {
    if (!activeMatch) return;

    async function loadPlayersWithRatings() {
      // 해당 경기에 참여하는 선수들 가져오기
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('*')
        .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);

      if (playerError) {
        setDbError(`Players Error: ${playerError.message}`);
        return;
      }

      if (playerData) {
        // 각 선수별 평균 평점 계산
        const playersWithAvg = await Promise.all(
          playerData.map(async (player) => {
            const { data: ratingData } = await supabase
              .from('ratings')
              .select('score')
              .eq('player_id', player.id);

            const avg =
              ratingData && ratingData.length > 0
                ? (ratingData.reduce((acc, cur) => acc + cur.score, 0) / ratingData.length).toFixed(1)
                : '0.0';

            return { ...player, avgRating: avg };
          })
        );
        setPlayers(playersWithAvg);
      }
    }
    loadPlayersWithRatings();
  }, [activeMatch]);

  const handleSubmit = async () => {
    if (!studentId || !selectedPlayer || !rating) return alert('모두 입력해 주세요.');
    const { error } = await supabase.from('ratings').insert({
      match_id: activeMatch.id,
      student_id: studentId,
      player_id: selectedPlayer.id,
      score: rating,
    });
    if (!error) {
      alert('등록 완료!');
      setRating(null);
      // 등록 후 평점 갱신을 위해 선수 목록 재로드 로직을 여기에 추가할 수 있습니다.
    } else alert('제출 실패: ' + error.message);
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black animate-pulse uppercase">Syncing Database...</div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
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
            <button key={m.id} onClick={() => { setActiveMatch(m); setSelectedPlayer(null); }} className={`flex flex-col rounded-[2.5rem] border px-10 py-6 min-w-[300px] transition-all text-left ${activeMatch?.id === m.id ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'}`}>
              <span className="text-[10px] font-black text-cyan-400/60 mb-2 uppercase tracking-widest italic">{m.sport_type}</span>
              <span className="font-black italic text-xl uppercase tracking-tighter mb-1 leading-tight">{m.team_a} <br/>vs {m.team_b}</span>
            </button>
          ))}
        </div>

        <div className="grid gap-16 lg:grid-cols-[1.6fr_0.4fr]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {activeMatch ? (
              <>
                <TeamList title={activeMatch.team_a} players={players.filter(p => p.team_name === activeMatch.team_a)} selectedId={selectedPlayer?.id} onSelect={setSelectedPlayer} />
                <TeamList title={activeMatch.team_b} players={players.filter(p => p.team_name === activeMatch.team_b)} selectedId={selectedPlayer?.id} onSelect={setSelectedPlayer} isAway />
              </>
            ) : null}
          </div>

          <aside className="sticky top-40 h-fit rounded-[50px] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-3xl shadow-2xl">
            {selectedPlayer ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">NO.{selectedPlayer.player_number} <br/>{selectedPlayer.name}</h4>
                <input type="text" placeholder="학번 입력" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black focus:border-cyan-400 outline-none transition-all" />
                <div className="grid grid-cols-4 gap-2">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => (
                    <button key={v} onClick={() => setRating(v)} className={`py-4 rounded-xl border font-black italic transition-all ${rating === v ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg shadow-cyan-400/40' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}>{v.toFixed(1)}</button>
                  ))}
                </div>
                <button onClick={handleSubmit} className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Submit Rate</button>
              </div>
            ) : <div className="py-24 text-center opacity-10 font-black italic uppercase text-xs tracking-[0.4em] leading-loose">Select A Player<br/>To Rate</div>}
          </aside>
        </div>
      </div>
    </div>
  );
}

function TeamList({ title, players, selectedId, onSelect, isAway = false }: any) {
  return (
    <div className={isAway ? 'text-right' : 'text-left'}>
      <h3 className={`mb-10 text-3xl font-black italic uppercase tracking-tighter ${isAway ? 'text-lime-400' : 'text-cyan-300'}`}>{title}</h3>
      <div className="grid gap-4">
        {players.length > 0 ? players.map((p: any) => (
          /* 💡 박스 너비를 충분히 확보하기 위해 w-full 및 min-h-24 적용, flex-wrap 방지를 위한 justify-between */
          <button 
            key={p.id} 
            onClick={() => onSelect(p)} 
            className={`flex items-center justify-between gap-4 p-6 rounded-[2.5rem] border transition-all w-full min-h-[90px] ${isAway ? 'flex-row-reverse shadow-[-10px_0_20px_rgba(0,0,0,0.2)]' : 'shadow-[10px_0_20px_rgba(0,0,0,0.2)]'} ${selectedId === p.id ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
          >
            <div className="flex items-center gap-6 overflow-hidden">
              <div className={`h-14 w-14 flex-shrink-0 rounded-2xl flex items-center justify-center font-black italic text-xl ${selectedId === p.id ? 'bg-black/10' : 'bg-black/40 text-cyan-400'}`}>
                {p.player_number}
              </div>
              {/* 💡 이름 텍스트가 짤리지 않도록 truncate 제거 및 폰트 크기 조정 */}
              <p className="font-black italic text-xl uppercase tracking-tighter whitespace-nowrap overflow-visible">
                {p.name}
              </p>
            </div>
            
            {/* 💡 평균 평점 표시 영역 */}
            <div className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl ${selectedId === p.id ? 'bg-black/20' : 'bg-black/40 border border-white/5'}`}>
              <span className={`text-[10px] font-bold uppercase mb-0.5 ${selectedId === p.id ? 'text-black/60' : 'text-white/30'}`}>AVG</span>
              <span className={`text-lg font-black italic ${selectedId === p.id ? 'text-black' : 'text-yellow-400'}`}>
                ⭐ {p.avgRating}
              </span>
            </div>
          </button>
        )) : <div className="py-10 text-white/5 italic font-black uppercase text-[10px] tracking-widest border border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center text-center">Roster Empty</div>}
      </div>
    </div>
  );
}