'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cachedQuery } from '@/lib/cache';

// spec §5.10 — select recipe (wrapper + chevron)
const selectClass =
  'h-11 w-full appearance-none rounded-lg border border-edge bg-surface px-4 pr-10 text-sm font-medium text-fg transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25';

function SelectChevron() {
  return (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-dim"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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
      // 💡 10분 동안 캐시: 필터 목록(시즌/종목)은 자주 안 바뀌므로 매번 요청하지 않습니다.
      const data = await cachedQuery('gvr:filters', 10 * 60 * 1000, async () => {
        const { data } = await supabase
          .from('matches')
          .select('season, sport_type')
          .order('match_date', { ascending: false });
        return data || [];
      });

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
      // 💡 5분 동안 캐시: 같은 시즌/종목 조합을 다시 선택해도 요청하지 않습니다.
      const data = await cachedQuery(
        `gvr:matches:${selectedSeason}:${selectedSport}`,
        5 * 60 * 1000,
        async () => {
          const { data, error } = await supabase
            .from('matches')
            .select('*')
            .eq('season', selectedSeason)
            .eq('sport_type', selectedSport)
            .order('match_date', { ascending: false });
          if (error) throw error;
          return data || [];
        }
      ).catch(() => [] as any[]);

      if (data && data.length > 0) {
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

    // 💡 Rate 페이지와 같은 캐시 키를 사용해서, 두 페이지를 오가도 요청이 중복되지 않습니다.
    const [playerData, allRatings] = await Promise.all([
      cachedQuery(
        `players:teams:${activeMatch.team_a}|${activeMatch.team_b}`,
        10 * 60 * 1000,
        async () => {
          const { data } = await supabase
            .from('players')
            .select('*')
            .in('team_name', [activeMatch.team_a, activeMatch.team_b]);
          return data || [];
        }
      ),
      cachedQuery(`ratings:${activeMatch.id}`, 60 * 1000, async () => {
        const { data } = await supabase
          .from('ratings')
          .select('player_id, score, match_id')
          .eq('match_id', activeMatch.id);
        return data || [];
      }),
    ]);

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
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      {/* 뒤로가기 */}
      <Link
        href="/masl"
        className="mb-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-mid transition-colors hover:bg-surface hover:text-fg"
      >
        <span aria-hidden="true">←</span>
        Back to Hub
      </Link>

      {/* 페이지 헤더 (spec §5.3) + 필터 셀렉트 (spec §5.10) */}
      <header className="mb-10 border-b border-edge pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
              GVR · Player Ratings
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.1] text-fg md:text-6xl">
              Results
            </h1>
            <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-fg-mid">
              경기별 선수 평균 평점을 확인해 보세요.
            </p>
          </div>

          <div className="grid w-full shrink-0 grid-cols-2 gap-2 md:w-80">
            <div className="relative">
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                aria-label="시즌 선택"
                className={selectClass}
              >
                {seasons.map(s => <option key={s} value={s} className="bg-raised text-fg">{s}</option>)}
              </select>
              <SelectChevron />
            </div>
            <div className="relative">
              <select
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                aria-label="종목 선택"
                className={selectClass}
              >
                {sports.map(s => <option key={s} value={s} className="bg-raised text-fg">{s}</option>)}
              </select>
              <SelectChevron />
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-12 md:space-y-16">
        {/* 경기 선택 */}
        <section>
          <div className="mb-6 flex items-center gap-3">
            <span className="h-4 w-1 rounded-full bg-accent" />
            <h2 className="text-xl font-bold leading-[1.3] tracking-[-0.01em] text-fg md:text-2xl">
              경기 선택
            </h2>
            {!loading && matches.length > 0 && (
              <span className="text-sm font-medium tabular-nums text-fg-dim">
                {matches.length}
              </span>
            )}
          </div>

          {loading ? (
            /* 로딩 스켈레톤 (spec §5.14) */
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[72px] w-60 shrink-0 animate-pulse rounded-xl border border-edge bg-surface"
                />
              ))}
            </div>
          ) : matches.length > 0 ? (
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
              {matches.map((m) => {
                const active = activeMatch?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveMatch(m)}
                    className={`flex w-60 shrink-0 flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? 'border-accent/30 bg-accent/10'
                        : 'border-edge bg-surface hover:border-edge-strong hover:bg-raised'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold uppercase tracking-[0.08em] ${
                        active ? 'text-accent-bright' : 'text-fg-dim'
                      }`}
                    >
                      {new Date(m.match_date).toLocaleDateString()}
                    </span>
                    <span
                      className={`w-full truncate text-sm font-semibold ${
                        active ? 'text-fg' : 'text-fg-mid'
                      }`}
                    >
                      {m.team_a} <span className="font-medium text-fg-dim">vs</span> {m.team_b}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            /* 빈 상태 (spec §5.14) */
            <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
              <p className="text-[15px] font-semibold text-fg-mid">해당 조건의 경기가 없습니다.</p>
              <p className="mt-1 text-sm text-fg-dim">다른 시즌이나 종목을 선택해 보세요.</p>
            </div>
          )}
        </section>

        {/* 결과 표시 구역 */}
        {loading && !activeMatch ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-xl border border-edge bg-surface" />
            <div className="h-64 animate-pulse rounded-xl border border-edge bg-surface" />
          </section>
        ) : activeMatch ? (
          <section>
            <div className="mb-6 flex items-center gap-3">
              <span className="h-4 w-1 rounded-full bg-accent" />
              <h2 className="text-xl font-bold leading-[1.3] tracking-[-0.01em] text-fg md:text-2xl">
                선수 평점
              </h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <ResultGrid
                teamName={activeMatch.team_a}
                players={players.filter(p => p.team_name === activeMatch.team_a)}
              />
              <ResultGrid
                teamName={activeMatch.team_b}
                players={players.filter(p => p.team_name === activeMatch.team_b)}
                isAway
              />
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}

// 결과 목록형 컴포넌트 — spec §5.5 카드 + §5.6 스타일 컴팩트 행
function ResultGrid({
  teamName,
  players,
  isAway = false,
}: {
  teamName: string;
  players: any[];
  isAway?: boolean;
}) {
  return (
    <div className="rounded-xl border border-edge bg-surface p-5 md:p-6">
      {/* 팀 헤더 — away 패널은 앰버 틱으로 구분 (spec §2 away accent) */}
      <div className="mb-5 flex items-center gap-3">
        <span
          className={`h-4 w-1 shrink-0 rounded-full ${isAway ? 'bg-away' : 'bg-accent'}`}
        />
        <h3 className="min-w-0 flex-1 truncate text-base font-semibold leading-[1.4] text-fg md:text-lg">
          {teamName}
        </h3>
        <span className="shrink-0 text-sm font-medium tabular-nums text-fg-dim">
          {players.length}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {players.map((p: any) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-edge bg-surface px-3.5 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-raised font-display text-sm font-medium tabular-nums text-fg-mid">
                {p.player_number}
              </span>
              <p className="truncate text-sm font-semibold text-fg">{p.name}</p>
            </div>
            {/* 평점 표시 — 미평가(0.0)는 em-dash */}
            {p.avgRating !== '0.0' ? (
              <span className="shrink-0 font-display text-xl font-medium leading-none tabular-nums text-fg">
                {p.avgRating}
              </span>
            ) : (
              <span className="shrink-0 text-sm font-medium text-fg-dim">—</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
