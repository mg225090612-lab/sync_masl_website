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

  // 1. 경기 목록 가져오기 (DB matches 테이블 로드)
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      const { data: matchData, error } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });

      if (matchData && matchData.length > 0) {
        setMatches(matchData);
        setActiveMatch(matchData[0]); // 최신 경기 자동 선택
      }
      setLoading(false);
    }
    loadInitialData();
  }, []);

  // 2. 선택된 경기에 참여하는 선수들 자동 로드
  useEffect(() => {
    if (!activeMatch) return;

    async function loadPlayersForMatch() {
      // 현재 경기의 team_a와 team_b 이름에 속한 선수를 players 테이블에서 자동 검색
      const { data: playerData, error } = await supabase
        .from('players')
        .select('*')
        .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);

      if (playerData) {
        setPlayers(playerData);
      } else {
        setPlayers([]);
      }
    }
    loadPlayersForMatch();
  }, [activeMatch]);

  // 평점 제출 로직
  const handleSubmit = async () => {
    if (!studentId || !selectedPlayer || !rating) {
      alert('학번, 선수, 평점을 모두 선택해주세요.');
      return;
    }

    // 중복 투표 방지 체크
    const { data: existing } = await supabase
      .from('ratings')
      .select('*')
      .eq('match_id', activeMatch.id)
      .eq('student_id', studentId)
      .eq('player_id', selectedPlayer.id)
      .maybeSingle();

    if (existing) {
      alert('이미 투표가 완료된 선수입니다.');
      return;
    }

    // DB 삽입
    const { error } = await supabase.from('ratings').insert({
      match_id: activeMatch.id,
      student_id: studentId,
      player_id: selectedPlayer.id,
      score: rating
    });

    if (!error) {
      alert(`${selectedPlayer.name} 선수에게 ${rating}점을 기록했습니다!`);
      setRating(null);
    } else {
      alert('기록 실패: ' + error.message);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black animate-pulse uppercase tracking-[0.3em]">Syncing MASL Database...</div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans">
      
      {/* 🌐 글로벌 내비게이션 바 */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 flex h-20 items-center justify-start gap-12">
          {navMenus.map((menu) => (
            <div key={menu.title} className="relative group py-7" onMouseEnter={() => setActiveMenu(menu.title)} onMouseLeave={() => setActiveMenu(null)}>
              <button className={`text-sm font-black tracking-widest uppercase transition-all ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40'}`}>
                {menu.title}
              </button>
              <div className={`absolute left-0 top-[80%] w-48 rounded-2xl border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-2xl transition-all ${activeMenu === menu.title ? 'visible opacity-100 translate-y-2' : 'invisible opacity-0'}`}>
                {menu.sub.map((s) => <Link key={s.name} href={s.path} className="block rounded-xl px-4 py-3 text-xs font-bold text-white hover:bg-cyan-400/10 hover:text-cyan-300 uppercase">{s.name}</Link>)}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* 배경 레이어 */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />

      <div className="mx-auto max-w-6xl relative z-10">
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-12">
          Rate <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">Players</span>
        </h1>

        {/* 탭: 현재 활성화된 경기 목록 (자동 생성) */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-6 mb-12">
          {matches.map(m => (
            <button 
              key={m.id} 
              onClick={() => { setActiveMatch(m); setSelectedPlayer(null); }} 
              className={`flex flex-col rounded-[2.5rem] border px-10 py-6 min-w-[300px] transition-all text-left ${activeMatch?.id === m.id ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'}`}
            >
              <span className="text-[10px] font-bold text-white/30 mb-1 uppercase tracking-widest">{new Date(m.match_date).toLocaleDateString()}</span>
              <span className="font-black italic text-lg uppercase tracking-tighter mb-2">{m.team_a} vs {m.team_b}</span>
              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-cyan-400 text-black w-fit uppercase">Match Live</span>
            </button>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          {/* 선수 명단: 선택된 경기에 맞춰 자동 필터링 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {activeMatch ? (
              <>
                <TeamList 
                  title={activeMatch.team_a} 
                  players={players.filter(p => p.team_name === activeMatch.team_a)} 
                  selectedId={selectedPlayer?.id} 
                  onSelect={setSelectedPlayer} 
                />
                <TeamList 
                  title={activeMatch.team_b} 
                  players={players.filter(p => p.team_name === activeMatch.team_b)} 
                  selectedId={selectedPlayer?.id} 
                  onSelect={setSelectedPlayer} 
                  isAway 
                />
              </>
            ) : null}
          </div>

          {/* 평점 사이드바 패널 */}
          <aside className="sticky top-40 h-fit rounded-[50px] border border-white/5 bg-white/[0.02] p-10 backdrop-blur-3xl shadow-2xl">
            {selectedPlayer ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div>
                  <p className="text-xs font-black text-cyan-400 mb-2 uppercase tracking-widest">{selectedPlayer.team_name}</p>
                  <h4 className="text-4xl font-black italic tracking-tighter uppercase leading-tight">NO.{selectedPlayer.player_number} <br/>{selectedPlayer.name}</h4>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Student ID</p>
                  <input 
                    type="text" 
                    placeholder="학번 8자리 입력" 
                    value={studentId} 
                    onChange={(e) => setStudentId(e.target.value)} 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-black focus:border-cyan-400 outline-none transition-all placeholder:text-white/10" 
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => (
                    <button 
                      key={v} 
                      onClick={() => setRating(v)} 
                      className={`py-4 rounded-xl border font-black italic transition-all ${rating === v ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}
                    >
                      {v.toFixed(1)}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleSubmit} 
                  className="w-full py-6 rounded-[2rem] bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Submit Rate
                </button>
              </div>
            ) : (
              <div className="py-24 text-center opacity-10 font-black italic uppercase text-xs tracking-[0.4em] leading-relaxed">
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
      <h3 className={`mb-10 text-2xl font-black italic uppercase tracking-tighter ${isAway ? 'text-lime-400' : 'text-cyan-300'}`}>{title}</h3>
      <div className="grid gap-4">
        {players.length > 0 ? (
          players.map((p: any) => (
            <button 
              key={p.id} 
              onClick={() => onSelect(p)} 
              className={`flex items-center gap-6 p-6 rounded-[2.5rem] border transition-all ${isAway ? 'flex-row-reverse' : ''} ${selectedId === p.id ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}
            >
              <div className={`h-12 w-12 flex-shrink-0 rounded-2xl flex items-center justify-center font-black italic text-lg ${selectedId === p.id ? 'bg-black/10 text-black' : 'bg-black/40 text-cyan-400'}`}>{p.player_number}</div>
              <p className="font-black italic text-lg uppercase truncate tracking-tighter">{p.name}</p>
            </button>
          ))
        ) : (
          <div className="py-10 text-white/5 italic font-bold uppercase text-[10px] tracking-widest border border-dashed border-white/5 rounded-[2.5rem] flex items-center justify-center">
            No Players Found
          </div>
        )}
      </div>
    </div>
  );
}