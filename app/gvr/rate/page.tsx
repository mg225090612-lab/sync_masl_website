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
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate', path: '/gvr/rate' }, { name: 'View', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament', path: '/champions/bracket' }] },
  ];

  // 1. 경기 목록 로드 (matches 테이블)
  useEffect(() => {
    async function fetchMatches() {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (data && data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]); // 첫 번째 경기를 기본 선택
      }
      setLoading(false);
    }
    fetchMatches();
  }, []);

  // 2. 선수 목록 로드 (players 테이블)
  useEffect(() => {
    if (!activeMatch) return;

    async function fetchPlayers() {
      // team_a와 team_b 이름을 정확히 매칭 (DB 스크린샷 기준)
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);

      if (data) setPlayers(data);
    }
    fetchPlayers();
  }, [activeMatch]);

  const handleSubmit = async () => {
    if (!studentId || !selectedPlayer || !rating) return alert('학번, 선수, 평점을 입력하세요.');
    
    const { error } = await supabase.from('ratings').insert({
      match_id: activeMatch.id,
      student_id: studentId,
      player_id: selectedPlayer.id,
      score: rating
    });

    if (!error) {
      alert(`${selectedPlayer.name} 평점 등록 완료!`);
      setRating(null);
    } else {
      alert('오류: ' + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black animate-pulse uppercase tracking-[0.3em]">Syncing Database...</div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 상단 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 flex h-20 items-center justify-start gap-12 text-[11px] font-black tracking-widest uppercase">
          {navMenus.map((menu) => (
            <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
              <button className={`transition-all ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40'}`}>{menu.title}</button>
              <div className={`absolute left-0 top-[80%] w-48 rounded-2xl border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-2xl transition-all ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0'}`}>
                {menu.sub.map((s) => <Link key={s.name} href={s.path} className="block rounded-xl px-4 py-3 text-white/60 hover:text-cyan-300 hover:bg-white/5">{s.name}</Link>)}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* 배경 레이어 */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />

      <div className="mx-auto max-w-6xl relative z-10">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-16 leading-none italic">
          Rate <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">Players</span>
        </h1>

        {/* 🏟️ 경기 선택 탭 (DB matches 테이블 로드 결과) */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10 mb-10 border-b border-white/5">
          {matches.length > 0 ? matches.map(m => (
            <button 
              key={m.id} 
              onClick={() => { setActiveMatch(m); setSelectedPlayer(null); }} 
              className={`flex flex-col rounded-[2.5rem] border px-10 py-6 min-w-[300px] transition-all text-left ${activeMatch?.id === m.id ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'}`}
            >
              <span className="text-[10px] font-black text-cyan-400/60 mb-2 uppercase tracking-widest">{m.sport_type}</span>
              <span className="font-black italic text-xl uppercase tracking-tighter mb-1">{m.team_a}</span>
              <span className="text-white/10 text-[10px] font-black uppercase mb-1">VS</span>
              <span className="font-black italic text-xl uppercase tracking-tighter">{m.team_b}</span>
            </button>
          )) : (
            <div className="py-10 text-white/20 italic font-black uppercase tracking-widest">No Matches Found in Database</div>
          )}
        </div>

        <div className="grid gap-16 lg:grid-cols-[1.4fr_0.6fr]">
          {/* 👥 선수 목록 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {activeMatch ? (
              <>
                <TeamList title={activeMatch.team_a} players={players.filter(p => p.team_name === activeMatch.team_a)} selectedId={selectedPlayer?.id} onSelect={setSelectedPlayer} />
                <TeamList title={activeMatch.team_b} players={players.filter(p => p.team_name === activeMatch.team_b)} selectedId={selectedPlayer?.id} onSelect={setSelectedPlayer} isAway />
              </>
            ) : null}
          </div>

          {/* ⚡ 평점 패널 */}
          <aside className="sticky top-40 h-fit rounded-[50px] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-3xl shadow-2xl">
            {selectedPlayer ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="text-5xl font-black italic tracking-tighter uppercase leading-none">NO.{selectedPlayer.player_number} <br/>{selectedPlayer.name}</h4>
                <input type="text" placeholder="학번 입력" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black focus:border-cyan-400 outline-none" />
                <div className="grid grid-cols-4 gap-2">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => (
                    <button key={v} onClick={() => setRating(v)} className={`py-4 rounded-xl border font-black italic ${rating === v ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20 transition-all'}`}>{v.toFixed(1)}</button>
                  ))}
                </div>
                <button onClick={handleSubmit} className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 active:scale-95 transition-all">Submit Rating</button>
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
          <button key={p.id} onClick={() => onSelect(p)} className={`flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all ${isAway ? 'flex-row-reverse' : ''} ${selectedId === p.id ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
            <div className={`h-14 w-14 flex-shrink-0 rounded-2xl flex items-center justify-center font-black italic text-xl ${selectedId === p.id ? 'bg-black/10' : 'bg-black/40 text-cyan-400'}`}>{p.player_number}</div>
            <p className="font-black italic text-xl uppercase truncate tracking-tighter">{p.name}</p>
          </button>
        )) : <div className="py-10 text-white/5 italic font-black uppercase text-[10px] tracking-widest border border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center">No Roster Found</div>}
      </div>
    </div>
  );
}