'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // 본인의 설정 파일 확인

export default function GvrRatePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  
  const [studentId, setStudentId] = useState(''); // 학번 입력 상태
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. 경기 목록 가져오기
  useEffect(() => {
    const fetchMatches = async () => {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .order('match_date', { ascending: false });
      if (data) {
        setMatches(data);
        setActiveMatch(data[0]); // 기본 최신 경기 선택
      }
      setLoading(false);
    };
    fetchMatches();
  }, []);

  // 2. 선택된 경기의 선수들 가져오기
  useEffect(() => {
    if (!activeMatch) return;
    const fetchPlayers = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);
      if (data) setPlayers(data);
    };
    fetchPlayers();
  }, [activeMatch]);

  // 경기 상태 체크 함수
  const getMatchStatus = (date: string) => {
    const now = new Date();
    const matchTime = new Date(date);
    const diff = now.getTime() - matchTime.getTime();
    
    if (diff < 0) return 'PREPARING'; // 아직 경기 전
    if (diff > 2 * 24 * 60 * 60 * 1000) return 'FINISHED'; // 2일 경과
    return 'LIVE'; // 평가 가능
  };

  // 평점 제출 함수
  const handleSubmit = async () => {
    if (!studentId || !selectedPlayer || !rating) {
      alert('학번과 평점을 모두 입력해 주세요.');
      return;
    }

    // 중복 투표 체크
    const { data: existing } = await supabase
      .from('ratings')
      .select('*')
      .eq('match_id', activeMatch.id)
      .eq('student_id', studentId)
      .eq('player_id', selectedPlayer.id)
      .single();

    if (existing) {
      alert('이미 이 선수에게 투표하셨습니다.');
      return;
    }

    // 투표 저장
    const { error } = await supabase.from('ratings').insert({
      match_id: activeMatch.id,
      student_id: studentId,
      player_id: selectedPlayer.id,
      score: rating
    });

    if (error) {
      alert('오류가 발생했습니다: ' + error.message);
    } else {
      alert(`${selectedPlayer.name} 선수에게 ${rating}점을 부여했습니다!`);
      setRating(null);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#06101f] pt-40 text-center font-black animate-pulse italic text-cyan-300">LOADING DATABASE...</div>;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-32 text-white">
      {/* 배경 디자인 생략 (기존과 동일) */}
      
      <div className="mx-auto max-w-6xl">
        {/* 상단 경기 탭 */}
        <div className="mb-12 overflow-x-auto no-scrollbar">
          <div className="flex gap-3">
            {matches.map((m) => {
              const status = getMatchStatus(m.match_date);
              return (
                <button
                  key={m.id}
                  onClick={() => { setActiveMatch(m); setSelectedPlayer(null); }}
                  className={`flex flex-col rounded-2xl border px-6 py-3 min-w-[220px] transition-all ${
                    activeMatch?.id === m.id ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/5 bg-white/5 opacity-40'
                  }`}
                >
                  <span className="text-[9px] font-bold text-white/30 mb-1">{new Date(m.match_date).toLocaleString()}</span>
                  <span className="font-black italic text-sm">{m.team_a} VS {m.team_b}</span>
                  <span className={`text-[8px] font-black mt-1 ${status === 'LIVE' ? 'text-cyan-400' : 'text-gray-500'}`}>{status}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.4fr_0.6fr]">
          {/* 선수 리스트 구역 */}
          <div className="grid grid-cols-2 gap-8">
            <TeamSection 
              title={activeMatch?.team_a} 
              players={players.filter(p => p.team_name === activeMatch?.team_a)}
              selectedId={selectedPlayer?.id}
              onSelect={setSelectedPlayer}
            />
            <TeamSection 
              title={activeMatch?.team_b} 
              players={players.filter(p => p.team_name === activeMatch?.team_b)}
              selectedId={selectedPlayer?.id}
              onSelect={setSelectedPlayer}
              isAway
            />
          </div>

          {/* 평점 패널 */}
          <aside className="sticky top-32 h-fit rounded-[35px] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl shadow-2xl">
            <h2 className="mb-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Rating Panel</h2>
            
            {selectedPlayer ? (
              <div className="space-y-6">
                <div>
                  <p className="text-xs font-bold text-cyan-400 mb-1 uppercase tracking-tighter">{selectedPlayer.team_name}</p>
                  <h4 className="text-4xl font-black italic tracking-tighter">NO.{selectedPlayer.player_number} {selectedPlayer.name}</h4>
                </div>

                {/* 학번 입력칸 추가 */}
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-white/40 uppercase">Student ID</p>
                  <input 
                    type="text" 
                    placeholder="학번을 입력하세요 (예: 20240001)"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:border-cyan-400 outline-none transition-all"
                  />
                </div>

                {getMatchStatus(activeMatch.match_date) === 'LIVE' ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-4 gap-2">
                      {[7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => (
                        <button
                          key={v}
                          onClick={() => setRating(v)}
                          className={`py-3 rounded-lg border font-black italic text-sm ${
                            rating === v ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-white/5 bg-white/5 text-white/40'
                          }`}
                        >
                          {v.toFixed(1)}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={handleSubmit}
                      className="w-full py-5 rounded-2xl bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic tracking-widest uppercase hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-cyan-500/20"
                    >
                      Submit Rate
                    </button>
                  </div>
                ) : (
                  <div className="py-10 text-center border border-white/5 rounded-2xl bg-black/20">
                    <p className="text-xs font-black text-white/40 uppercase tracking-widest">
                      {getMatchStatus(activeMatch.match_date) === 'PREPARING' ? '평가 기간이 아닙니다' : '평가가 종료되었습니다'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-20 text-center opacity-10 font-black italic uppercase text-xs tracking-widest leading-loose">
                Please Select<br/>A Player To Rate
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

// 팀 섹션 컴포넌트
function TeamSection({ title, players, selectedId, onSelect, isAway = false }: any) {
  return (
    <div className={isAway ? 'text-right' : 'text-left'}>
      <h3 className={`mb-6 text-xl font-black italic uppercase ${isAway ? 'text-lime-400' : 'text-cyan-300'}`}>{title}</h3>
      <div className="grid gap-3">
        {players.map((p: any) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${isAway ? 'flex-row-reverse' : ''} ${
              selectedId === p.id ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg shadow-cyan-400/20' : 'border-white/5 bg-white/5 hover:border-white/10'
            }`}
          >
            <div className={`h-10 w-10 flex-shrink-0 rounded-lg flex items-center justify-center font-black italic ${selectedId === p.id ? 'bg-black/10 text-black' : 'bg-black/40 text-cyan-400'}`}>
              {p.player_number}
            </div>
            <div className="overflow-hidden">
              <p className="font-black italic text-sm truncate uppercase tracking-tighter">{p.name}</p>
              <p className={`text-[8px] font-bold ${selectedId === p.id ? 'text-black/50' : 'text-white/20'}`}>GVR SYSTEM READY</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}