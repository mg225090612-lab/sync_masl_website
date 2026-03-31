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

  // 1. 경기 목록 가져오기 (DB matches 테이블 기준)
  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      // 스크린샷 확인: matches 테이블에서 데이터 로드
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (data && data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]); // 최신 경기 자동 선택
      }
      setLoading(false);
    }
    loadMatches();
  }, []);

  // 2. 선수 목록 가져오기 (스크린샷 확인: players 테이블의 team_name 기준)
  useEffect(() => {
    if (!activeMatch) return;

    async function loadPlayers() {
      // 선택된 경기의 두 팀에 속한 모든 선수 가져오기
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);

      if (data) {
        setPlayers(data);
      } else {
        setPlayers([]);
      }
    }
    loadPlayers();
  }, [activeMatch]);

  const handleSubmit = async () => {
    if (!studentId || !selectedPlayer || !rating) {
      alert('학번, 선수, 평점을 모두 선택해주세요.');
      return;
    }

    // ratings 테이블에 데이터 삽입
    const { error } = await supabase.from('ratings').insert({
      match_id: activeMatch.id,
      student_id: studentId,
      player_id: selectedPlayer.id,
      score: rating
    });

    if (!error) {
      alert(`${selectedPlayer.name} 선수 평점 등록 완료!`);
      setRating(null);
      setStudentId('');
    } else {
      alert('등록 실패: ' + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black animate-pulse uppercase tracking-widest">Syncing Database...</div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 글로벌 내비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 flex h-20 items-center justify-start gap-12">
          <Link href="/" className="text-xl font-black italic text-cyan-400 mr-4">MASL / GVR</Link>
          {navMenus.map((menu) => (
            <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
              <button className={`text-[11px] font-black tracking-widest uppercase transition-all ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40'}`}>
                {menu.title}
              </button>
              <div className={`absolute left-0 top-[80%] w-48 rounded-2xl border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0'}`}>
                {menu.sub.map((s) => <Link key={s.name} href={s.path} className="block rounded-xl px-4 py-3 text-[10px] font-bold text-white hover:bg-cyan-400/10 hover:text-cyan-300 uppercase">{s.name}</Link>)}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* 💥 사이버틱 배경 레이어 */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />

      <div className="mx-auto max-w-6xl relative z-10">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-16 leading-none">
          RATE <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">PLAYERS</span>
        </h1>

        {/* 🏟️ 경기 선택 탭 영역 (여기서 경기를 선택해야 선수가 나옵니다) */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10 mb-10 border-b border-white/5">
          {matches.map(m => (
            <button 
              key={m.id} 
              onClick={() => { setActiveMatch(m); setSelectedPlayer(null); }} 
              className={`flex flex-col rounded-[2.5rem] border px-10 py-6 min-w-[280px] transition-all text-left ${activeMatch?.id === m.id ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)] scale-105' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'}`}
            >
              <span className="text-[9px] font-black text-cyan-400/60 mb-2 uppercase tracking-widest italic">{m.sport_type}</span>
              <span className="font-black italic text-xl uppercase tracking-tighter mb-3 leading-tight">{m.team_a}<br/><span className="text-white/20 text-sm">VS</span> {m.team_b}</span>
              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-cyan-400 text-black w-fit uppercase">Match Live</span>
            </button>
          ))}
          {matches.length === 0 && <p className="text-white/20 italic font-black uppercase tracking-widest py-10">Waiting for Match Data...</p>}
        </div>

        <div className="grid gap-16 lg:grid-cols-[1.4fr_0.6fr]">
          {/* 👥 선수 명단 그리드 */}
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
                <div>
                  <p className="text-[10px] font-black text-cyan-400 mb-2 uppercase tracking-widest">{selectedPlayer.team_name}</p>
                  <h4 className="text-5xl font-black italic tracking-tighter uppercase leading-none">NO.{selectedPlayer.player_number} <br/>{selectedPlayer.name}</h4>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Enter Student ID</p>
                  <input type="text" placeholder="20240001" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black focus:border-cyan-400 outline-none transition-all placeholder:text-white/10" />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => (
                    <button key={v} onClick={() => setRating(v)} className={`py-4 rounded-xl border font-black italic transition-all ${rating === v ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg shadow-cyan-400/40' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}>{v.toFixed(1)}</button>
                  ))}
                </div>
                <button onClick={handleSubmit} className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Submit Rate</button>
              </div>
            ) : (
              <div className="py-24 text-center opacity-10 font-black italic uppercase text-xs tracking-[0.4em] leading-loose">
                Select A Player<br/>From The List To Rate
              </div>
            )}
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