'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function GvrViewPage() {
  const [seasons] = useState(['26 SPRING', '25 WINTER']); // 시즌 목록
  const [sports] = useState(['남자축구', '여자축구', '남자농구', '여자배구']); // 종목 목록
  
  const [selectedSeason, setSelectedSeason] = useState('26 SPRING');
  const [selectedSport, setSelectedSport] = useState('남자축구');
  
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [playerResults, setPlayerResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. 선택된 시즌과 종목에 맞는 경기 목록 가져오기
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('matches')
        .select('*')
        .eq('season', selectedSeason) // 시즌 필터
        .eq('sport_type', selectedSport) // 종목 필터
        .order('match_date', { ascending: false });
      
      if (data && data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]); // 첫 번째 경기 자동 선택
      } else {
        setMatches([]);
        setActiveMatch(null);
        setPlayerResults([]);
      }
      setLoading(false);
    };
    fetchMatches();
  }, [selectedSeason, selectedSport]);

  // 2. 선택된 경기의 평점 데이터 계산 (랭킹 없이 목록형)
  useEffect(() => {
    if (!activeMatch) return;

    const fetchResults = async () => {
      const { data: players } = await supabase
        .from('players')
        .select('*')
        .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);

      const { data: ratings } = await supabase
        .from('ratings')
        .select('*')
        .eq('match_id', activeMatch.id);

      if (players && ratings) {
        const calculated = players.map(p => {
          const pRatings = ratings.filter(r => r.player_id === p.id);
          const avg = pRatings.length > 0 
            ? pRatings.reduce((acc, curr) => acc + curr.score, 0) / pRatings.length 
            : 0;
          return { ...p, avgScore: avg };
        });
        // 랭킹 정렬 없이 등번호 순으로 정렬 (혹은 이름순)
        setPlayerResults(calculated.sort((a, b) => a.player_number - b.player_number));
      }
    };
    fetchResults();
  }, [activeMatch]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-32 text-white font-sans">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,rgba(57,255,20,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />

      <div className="mx-auto max-w-6xl">
        {/* 상단 헤더 & 필터 (시즌/종목) */}
        <div className="mb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter md:text-7xl">
              GVR <span className="text-lime-300">Results</span>
            </h1>
            <div className="flex gap-2">
              {/* 시즌 선택 */}
              <select 
                value={selectedSeason} 
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black italic text-cyan-300 outline-none"
              >
                {seasons.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {/* 종목 선택 */}
              <select 
                value={selectedSport} 
                onChange={(e) => setSelectedSport(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black italic text-lime-300 outline-none"
              >
                {sports.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* 경기 선택 탭 (가로 스크롤) */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
            {matches.length > 0 ? (
              matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMatch(m)}
                  className={`flex flex-col rounded-2xl border px-8 py-4 transition-all min-w-[220px] text-left ${
                    activeMatch?.id === m.id 
                      ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                      : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100'
                  }`}
                >
                  <span className="text-[9px] font-bold text-white/30 mb-1">{new Date(m.match_date).toLocaleDateString()}</span>
                  <span className="font-black italic text-sm uppercase tracking-tighter">{m.team_a} VS {m.team_b}</span>
                </button>
              ))
            ) : (
              <p className="text-white/20 font-black italic uppercase text-sm">No matches found for this period</p>
            )}
          </div>
        </div>

        {/* 결과 표시 구역 (A팀 vs B팀) */}
        {activeMatch && (
          <div className="grid lg:grid-cols-2 gap-10">
            <ResultGrid 
              teamName={activeMatch.team_a} 
              players={playerResults.filter(p => p.team_name === activeMatch.team_a)} 
              color="cyan"
            />
            <ResultGrid 
              teamName={activeMatch.team_b} 
              players={playerResults.filter(p => p.team_name === activeMatch.team_b)} 
              color="lime"
              isAway
            />
          </div>
        )}

        <div className="mt-40 text-center opacity-10 font-black text-6xl italic tracking-tighter select-none">
          MASL <span className="text-cyan-400">&</span> SYNC
        </div>
      </div>
    </div>
  );
}

// 랭킹 제외, 목록형 결과 컴포넌트
function ResultGrid({ teamName, players, color, isAway = false }: any) {
  return (
    <div className="rounded-[40px] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl">
      <h3 className={`mb-8 text-2xl font-black italic uppercase tracking-tighter ${color === 'cyan' ? 'text-cyan-300' : 'text-lime-300'} ${isAway ? 'text-right' : ''}`}>
        {teamName}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {players.map((p: any) => (
          <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-black/30 p-4 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 font-black italic text-xs text-white/40">
                  {p.player_number}
                </div>
                <h4 className="text-sm font-black italic text-white uppercase tracking-tighter">{p.name}</h4>
              </div>
              {/* 평점 표시 (7.0-10.0) */}
              <div className={`text-xl font-black italic ${p.avgScore > 0 ? (color === 'cyan' ? 'text-cyan-300' : 'text-lime-300') : 'text-white/10'}`}>
                {p.avgScore > 0 ? p.avgScore.toFixed(1) : '—'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}