'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function GvrViewPage() {
  // DB에서 불러온 목록을 담을 상태
  const [seasons, setSeasons] = useState<string[]>([]);
  const [sports, setSports] = useState<string[]>([]); 
  
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [selectedSport, setSelectedSport] = useState<string>('');
  
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. DB에서 모든 시즌과 종목을 가져와서 중복 제거 후 필터 메뉴 생성
  useEffect(() => {
    async function fetchFilters() {
      const { data } = await supabase
        .from('matches')
        .select('season, sport_type')
        .order('match_date', { ascending: false });

      if (data) {
        // 중복 제거해서 고유한 값만 추출 (Set 활용)
        const uniqueSeasons = Array.from(new Set(data.map(m => m.season).filter(Boolean))) as string[];
        const uniqueSports = Array.from(new Set(data.map(m => m.sport_type).filter(Boolean))) as string[];

        setSeasons(uniqueSeasons);
        setSports(uniqueSports);

        // 첫 번째 항목을 기본값으로 자동 선택
        if (uniqueSeasons.length > 0) setSelectedSeason(uniqueSeasons[0]);
        if (uniqueSports.length > 0) setSelectedSport(uniqueSports[0]);
      }
    }
    fetchFilters();
  }, []);

  // 2. 선택된 시즌과 종목에 맞는 경기 목록 가져오기
  useEffect(() => {
    // 필터값이 아직 없으면 실행 안 함
    if (!selectedSeason || !selectedSport) return;

    async function loadMatches() {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('season', selectedSeason) 
        .eq('sport_type', selectedSport) 
        .order('match_date', { ascending: false });

      if (!error && data && data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]); // 첫 번째 경기 자동 선택
      } else {
        setMatches([]);
        setActiveMatch(null);
      }
      setLoading(false);
    }
    
    loadMatches();
  }, [selectedSeason, selectedSport]);

  // 3. 선수 + 평균 평점 로드
  const loadPlayersWithRatings = useCallback(async () => {
    if (!activeMatch) {
      setPlayers([]);
      return;
    }

    const { data: playerData } = await supabase
      .from('players')
      .select('*')
      .in('team_name', [activeMatch.team_a, activeMatch.team_b]);

    const { data: allRatings } = await supabase
      .from('ratings')
      .select('player_id, score, match_id')
      .eq('match_id', activeMatch.id);

    if (playerData) {
      const playersWithAvg = playerData.map((player) => {
        const playerRatings =
          allRatings?.filter((r) => r.player_id === player.id && r.match_id === activeMatch.id) || [];

        const avg =
          playerRatings.length > 0
            ? (playerRatings.reduce((acc, cur) => acc + Number(cur.score), 0) / playerRatings.length).toFixed(1)
            : '0.0';

        return { ...player, avgRating: avg }; 
      });

      // 등번호 순으로 정렬
      setPlayers(playersWithAvg.sort((a, b) => a.player_number - b.player_number));
    }
  }, [activeMatch]);

  useEffect(() => {
    loadPlayersWithRatings();
  }, [loadPlayersWithRatings]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-32 text-white font-sans">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_right,rgba(57,255,20,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />

      <div className="mx-auto max-w-6xl">
        
        {/* 뒤로가기 버튼 */}
        <Link
          href="/masl/26s"
          className="text-xs tracking-[0.3em] text-cyan-300 uppercase mb-8 inline-block hover:text-white transition-colors"
        >
          ← BACK TO HUB
        </Link>

        {/* 상단 헤더 & 필터 */}
        <div className="mb-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter md:text-7xl">
              GVR <span className="text-lime-300">Results</span>
            </h1>
            <div className="flex gap-2">
              <select 
                value={selectedSeason} 
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black italic text-cyan-300 outline-none uppercase"
              >
                {seasons.map(s => <option key={s} value={s} className="bg-[#0b1730]">{s}</option>)}
              </select>
              <select 
                value={selectedSport} 
                onChange={(e) => setSelectedSport(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-black italic text-lime-300 outline-none uppercase"
              >
                {sports.map(s => <option key={s} value={s} className="bg-[#0b1730]">{s}</option>)}
              </select>
            </div>
          </div>

          {/* 경기 선택 탭 */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
            {loading ? (
              <p className="text-cyan-400 font-black italic uppercase animate-pulse">Loading Matches...</p>
            ) : matches.length > 0 ? (
              matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMatch(m)}
                  className={`flex flex-col rounded-2xl border px-8 py-4 transition-all min-w-[220px] text-left ${
                    activeMatch?.id === m.id 
                      ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' 
                      : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[9px] font-bold text-white/30 mb-1">
                    {new Date(m.match_date).toLocaleDateString()}
                  </span>
                  <span className="font-black italic text-sm uppercase tracking-tighter">
                    {m.team_a} VS {m.team_b}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-white/20 font-black italic uppercase text-sm">해당 조건의 경기가 없습니다.</p>
            )}
          </div>
        </div>

        {/* 결과 표시 구역 */}
        {activeMatch && (
          <div className="grid lg:grid-cols-2 gap-10">
            <ResultGrid 
              teamName={activeMatch.team_a} 
              players={players.filter(p => p.team_name === activeMatch.team_a)} 
              color="cyan"
            />
            <ResultGrid 
              teamName={activeMatch.team_b} 
              players={players.filter(p => p.team_name === activeMatch.team_b)} 
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

// 결과 목록형 컴포넌트
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
                <h4 className="text-sm font-black italic text-white uppercase tracking-tighter truncate max-w-[100px]">{p.name}</h4>
              </div>
              {/* 평점 표시 */}
              <div className={`text-xl font-black italic ${p.avgRating !== '0.0' ? (color === 'cyan' ? 'text-cyan-300' : 'text-lime-300') : 'text-white/10'}`}>
                {p.avgRating !== '0.0' ? p.avgRating : '—'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}