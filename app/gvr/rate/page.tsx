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

  // 내비게이션 메뉴
  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate', path: '/gvr/rate' }, { name: 'View', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament', path: '/champions/bracket' }] },
  ];

  // 1. DB에서 경기 목록 가져오기
  useEffect(() => {
    const fetchMatches = async () => {
      const { data, error } = await supabase.from('matches').select('*').order('match_date', { ascending: false });
      if (data && data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]); // 가장 최근 경기를 기본 선택
      }
      setLoading(false);
    };
    fetchMatches();
  }, []);

  // 2. 선택된 경기의 선수 명단 가져오기
  useEffect(() => {
    if (!activeMatch) return;
    const fetchPlayers = async () => {
      const { data } = await supabase.from('players').select('*').or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);
      if (data) setPlayers(data);
    };
    fetchPlayers();
  }, [activeMatch]);

  // 💡 [핵심 수정] 경기 시간과 상관없이 평점 기능을 열어두는 로직
  const getMatchStatus = (date: string) => {
    return 'LIVE'; // 확인을 위해 강제로 LIVE 반환
  };

  const handleSubmit = async () => {
    if (!studentId || !selectedPlayer || !rating) return alert('학번과 평점을 입력하세요.');
    
    // 중복 투표 체크 (필요 시 유지)
    const { data: existing } = await supabase.from('ratings')
      .select('*')
      .eq('match_id', activeMatch.id)
      .eq('student_id', studentId)
      .eq('player_id', selectedPlayer.id)
      .single();

    if (existing) return alert('이미 이 선수에게 투표하셨습니다.');

    const { error } = await supabase.from('ratings').insert({
      match_id: activeMatch.id,
      student_id: studentId,
      player_id: selectedPlayer.id,
      score: rating
    });

    if (!error) {
      alert(`${selectedPlayer.name} 선수에게 ${rating}점을 부여했습니다!`);
      setRating(null);
    } else {
      alert('오류가 발생했습니다: ' + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black tracking-widest uppercase animate-pulse">Initializing System...</div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 상단 네비게이션 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 flex h-20 items-center justify-start gap-12">
          {navMenus.map((menu) => (
            <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
              <button className={`text-sm font-black tracking-widest transition-all uppercase ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40 group-hover:text-white'}`}>{menu.title}</button>
              <div className={`absolute left-0 top-[80%] w-48 rounded-2xl border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0 translate-y-0'}`}>
                <div className="flex flex-col gap-1">
                  {menu.sub.map((s) => <Link key={s.name} href={s.path} className="rounded-xl px-4 py-3 text-xs font-bold text-white hover:bg-cyan-400/10 hover:text-cyan-300 uppercase">{s.name}</Link>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />

      <div className="mx-auto max-w-6xl relative z-10">
        
        <div className="mb-12">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300 mb-6">Database Connected</div>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-12">Rate <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">Players</span></h1>
          
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6">
            {matches.map(m => (
              <button 
                key={m.id} 
                onClick={() => { setActiveMatch(m); setSelectedPlayer(null); }} 
                className={`flex flex-col rounded-[2.5rem] border px-10 py-6 min-w-[280px] transition-all text-left ${activeMatch?.id === m.id ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/5 bg-white/5 opacity-40'}`}
              >
                <span className="text-[10px] font-bold text-white/30 mb-1 uppercase tracking-widest">{new Date(m.match_date).toLocaleDateString()}</span>
                <span className="font-black italic text-lg uppercase tracking-tighter mb-2">{m.team_a} vs {m.team_b}</span>
                <span className="text-[9px] font-black px-3 py-1 rounded-full bg-cyan-400 text-black w-fit">ACTIVE</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.5fr_0.5fr]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <TeamList title={activeMatch?.team_a} players={players.filter(p => p.team_name === activeMatch?.team_a)} selectedId={selectedPlayer?.id} onSelect={setSelectedPlayer} color="cyan" />
            <TeamList title={activeMatch?.team_b} players={players.filter(p => p.team_name === activeMatch?.team_b)} selectedId={selectedPlayer?.id} onSelect={setSelectedPlayer} color="lime" isAway />
          </div>

          <aside className="sticky top-40 h-fit rounded-[50px] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-3xl shadow-2xl">
            {selectedPlayer ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <p className="text-xs font-black text-cyan-400 mb-2 uppercase tracking-widest">{selectedPlayer.team_name}</p>
                  <h4 className="text-5xl font-black italic tracking-tighter uppercase leading-none">NO.{selectedPlayer.player_number} <br/>{selectedPlayer.name}</h4>
                </div>

                <input type="text" placeholder="학번 입력" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black focus:border-cyan-400 outline-none transition-all" />

                <div className="grid grid-cols-4 gap-2">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => (
                    <button key={v} onClick={() => setRating(v)} className={`py-4 rounded-xl border font-black italic transition-all ${rating === v ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg shadow-cyan-400/40 scale-95' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}>
                      {v.toFixed(1)}
                    </button>
                  ))}
                </div>
                <button onClick={handleSubmit} className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic uppercase tracking-[0.2em] shadow-xl shadow-cyan-500/20 active:scale-95 transition-all">Submit Rating</button>
              </div>
            ) : <div className="py-24 text-center opacity-10 font-black italic uppercase text-xs tracking-[0.3em]">Select Player From List</div>}
          </aside>
        </div>
      </div>
    </div>
  );
}

// 선수 목록 컴포넌트
function TeamList({ title, players, selectedId, onSelect, color, isAway = false }: any) {
  return (
    <div className={isAway ? 'text-right' : 'text-left'}>
      <h3 className={`mb-10 text-3xl font-black italic uppercase tracking-tighter ${isAway ? 'text-lime-400' : 'text-cyan-300'}`}>{title}</h3>
      <div className="grid gap-4">
        {players.map((p: any) => (
          <button key={p.id} onClick={() => onSelect(p)} className={`flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all ${isAway ? 'flex-row-reverse' : ''} ${selectedId === p.id ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
            <div className={`h-14 w-14 flex-shrink-0 rounded-2xl flex items-center justify-center font-black italic text-xl ${selectedId === p.id ? 'bg-black/10' : 'bg-black/40 text-cyan-400'}`}>{p.player_number}</div>
            <p className="font-black italic text-xl uppercase truncate tracking-tighter">{p.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}