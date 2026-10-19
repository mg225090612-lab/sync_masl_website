'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // 💡 원본 대신 리사이즈된 이미지를 캐시해서 제공 (Supabase 요청 절감)
import { supabase } from '@/lib/supabase';
import { cachedQuery, isPhotoMissing, markPhotoMissing } from '@/lib/cache';
import { isDone, isUpcoming, sortUpcomingFirst } from '@/lib/live';
import TeamLogo from '@/app/components/TeamLogo';
import ChampionStars from '@/app/components/ChampionStars';
import LiveBadge from '@/app/components/LiveBadge';

interface PlayerPageProps {
  params: Promise<{ teamName: string; playerId: string }>;
}

type RatingRow = { match_id: string; score: number };

// 💡 선수 상세 페이지 — 프로필 + GVR 평점 요약 + 경기별 평점 + 팀 경기 기록
export default function PlayerDetailPage({ params }: PlayerPageProps) {
  const resolvedParams = use(params);
  const teamName = decodeURIComponent(resolvedParams.teamName);
  const playerId = resolvedParams.playerId;

  const [player, setPlayer] = useState<any>(null);
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  // 💡 사진이 없다고 이미 확인된 선수는 처음부터 요청을 보내지 않습니다.
  const [imgError, setImgError] = useState(() => isPhotoMissing(playerId));

  useEffect(() => {
    const load = async () => {
      // 💡 10분 동안 캐시: 같은 선수를 다시 열어도 DB에 요청하지 않습니다.
      const data = await cachedQuery(`player:${playerId}`, 10 * 60 * 1000, async () => {
        const { data } = await supabase.from('players').select('*').eq('id', playerId).single();
        return data;
      });
      if (!data) return;
      setPlayer(data);

      const team = data.team_name || teamName;
      // 💡 1분 캐시: 평점·경기 결과는 자주 바뀌므로 짧게 둡니다.
      // 평점은 점수만 가져옵니다 (누가 줬는지 같은 개인 정보는 불러오지 않음).
      const { ratingRows, matchRows } = await cachedQuery(`player-stats:${playerId}`, 60 * 1000, async () => {
        const seasonFilter = (q: any) => (data.season ? q.eq('season', data.season) : q);
        // 팀 이름에 특수문자(. , !)가 있어도 안전하도록 A팀/B팀 조회를 따로 합니다.
        const [r, asA, asB] = await Promise.all([
          supabase.from('ratings').select('match_id, score').eq('player_id', playerId),
          seasonFilter(supabase.from('matches').select('*').eq('team_a', team)),
          seasonFilter(supabase.from('matches').select('*').eq('team_b', team)),
        ]);
        return {
          ratingRows: (r.data as RatingRow[]) || [],
          matchRows: [...(asA.data || []), ...(asB.data || [])],
        };
      });
      setRatings(ratingRows);
      setMatches(matchRows);
    };
    load();
  }, [playerId, teamName]);

  if (!player) {
    // 스켈레톤 로딩 — 최종 레이아웃과 동일한 블록 구조 (spec §5.14)
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
        <div className="mb-6 h-10 w-36 animate-pulse rounded-lg bg-surface" />
        <div className="grid gap-8 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <div className="aspect-[3/4] w-full animate-pulse rounded-2xl border border-edge bg-surface" />
          </div>
          <div className="space-y-4 md:col-span-8">
            <div className="h-4 w-32 animate-pulse rounded-full bg-surface" />
            <div className="h-12 w-3/4 animate-pulse rounded-xl bg-surface" />
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl border border-edge bg-surface" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 💡 무조건 스토리지의 .png 파일을 불러오도록 설정
  const { data: imgData } = supabase.storage.from('player-photos').getPublicUrl(`${player.id}.png`);
  const imageUrl = imgData.publicUrl;
  const team = player.team_name || teamName;

  /* ── GVR 평점 요약 ── */
  const avg = ratings.length > 0 ? ratings.reduce((s, r) => s + Number(r.score), 0) / ratings.length : null;
  const byMatch = new Map<string, number[]>();
  ratings.forEach(r => byMatch.set(r.match_id, [...(byMatch.get(r.match_id) || []), Number(r.score)]));

  /* ── 팀 경기 기록 ── */
  const sorted = sortUpcomingFirst(matches);
  const resultOf = (m: any): 'W' | 'L' | 'D' | null => {
    if (!isDone(m)) return null;
    if (m.winnder_id) return m.winnder_id === team ? 'W' : 'L';
    if (m.score_a === null || m.score_a === undefined) return null;
    const mine = m.team_a === team ? m.score_a : m.score_b;
    const theirs = m.team_a === team ? m.score_b : m.score_a;
    return mine > theirs ? 'W' : mine < theirs ? 'L' : 'D';
  };
  const wins = matches.filter(m => resultOf(m) === 'W').length;
  const losses = matches.filter(m => resultOf(m) === 'L').length;
  const nextMatch = sorted.find(m => m.status === 'live' || (isUpcoming(m) && !isDone(m)));

  return (
    // 페이지 셸 (spec §1.1) — 배경/네비 여백은 전역 레이아웃이 담당합니다.
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      {/* 💡 Link 태그 대신 순정 뒤로가기 사용. 히스토리가 꼬이지 않아 팀 페이지에서 무한 루프에 안 빠집니다! */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-mid transition-colors hover:bg-surface hover:text-fg"
      >
        ← 팀으로 돌아가기
      </button>

      <div className="grid gap-8 md:grid-cols-12 md:gap-10">
        {/* 📸 왼쪽: 사진 카드 */}
        <div className="md:col-span-4">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-edge bg-surface md:max-w-none">
            {!imgError ? (
              <>
                <Image
                  src={imageUrl}
                  alt={player.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                  onError={() => {
                    markPhotoMissing(playerId);
                    setImgError(true);
                  }}
                />
                {/* 미디어 스크림 — 사진 위 유일하게 허용된 그라데이션 (spec §5.16) */}
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/25 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-raised">
                <span className="font-display text-8xl font-medium leading-none tabular-nums text-edge-strong">
                  {player.player_number}
                </span>
              </div>
            )}
            {/* 사진 아래쪽 등번호 + 이름 오버레이 */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
              <span className="font-display text-5xl font-medium leading-none tabular-nums text-fg">
                {player.player_number}
              </span>
              <span className="mb-1 truncate text-sm font-semibold text-fg-mid">{player.name}</span>
            </div>
          </div>
        </div>

        {/* 📝 오른쪽: 프로필 + 기록 */}
        <div className="min-w-0 md:col-span-8">
          {/* 팀 */}
          <Link
            href={`/masl/team/${encodeURIComponent(team)}${player.season ? `?season=${encodeURIComponent(player.season)}` : ''}`}
            className="inline-flex max-w-full items-center gap-2 rounded-full border border-edge bg-surface py-1 pl-1 pr-3 transition-colors hover:border-edge-strong"
          >
            <span className="h-6 w-6 shrink-0">
              <TeamLogo name={team} season={player.season} className="h-full w-full" />
            </span>
            <span className="truncate text-xs font-semibold text-accent-bright">{team}</span>
            <ChampionStars team={team} />
          </Link>

          {/* 이름 — display-ko 스케일 (spec §3.2) */}
          <h1 className="mt-4 text-3xl font-extrabold leading-[1.25] tracking-[-0.01em] text-fg md:text-5xl">
            {player.name}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Chip>{player.category || 'PLAYER'}</Chip>
            {player.season && <Chip>{player.season}</Chip>}
            <Chip>No. {player.player_number}</Chip>
          </div>

          {/* 기록 요약 타일 */}
          <dl className="mt-8 grid grid-cols-3 gap-3">
            <StatTile label="GVR 평균 평점" value={avg !== null ? avg.toFixed(1) : '-'} sub={avg !== null ? '/ 10' : '아직 평가 없음'} accent />
            <StatTile label="받은 평가" value={String(ratings.length)} sub="건" />
            <StatTile label="팀 전적" value={`${wins}승 ${losses}패`} sub={player.season || '전체'} />
          </dl>

          {/* 다음 경기 / 진행 중 */}
          {nextMatch && (
            <Link
              href={`/live/${nextMatch.id}`}
              className={`mt-6 flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 transition-colors hover:border-edge-strong ${
                nextMatch.status === 'live' ? 'border-danger/40' : 'border-edge'
              }`}
            >
              <span className="shrink-0 text-xs font-semibold text-fg-dim">
                {nextMatch.status === 'live' ? <LiveBadge /> : '다음 경기'}
              </span>
              <p className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">
                vs {nextMatch.team_a === team ? nextMatch.team_b : nextMatch.team_a}
              </p>
              {nextMatch.status === 'live' ? (
                <span className="font-display text-lg tabular-nums text-fg">
                  {nextMatch.score_a ?? 0} : {nextMatch.score_b ?? 0}
                </span>
              ) : nextMatch.match_date && (
                <span className="shrink-0 text-xs tabular-nums text-fg-dim">
                  {new Date(nextMatch.match_date).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </Link>
          )}

          {/* 팀 경기 기록 + 경기별 평점 */}
          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold uppercase tracking-[0.04em] text-fg">Matches</h2>
            {sorted.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-10 text-center">
                <p className="text-sm font-medium text-fg-dim">아직 경기 기록이 없습니다.</p>
              </div>
            ) : (
              <ol className="mt-4 space-y-2">
                {sorted.map(m => {
                  const opp = m.team_a === team ? m.team_b : m.team_a;
                  const res = resultOf(m);
                  const scores = byMatch.get(m.id);
                  const matchAvg = scores ? scores.reduce((s, x) => s + x, 0) / scores.length : null;
                  const hasScore = m.score_a !== null && m.score_a !== undefined;
                  const mine = m.team_a === team ? m.score_a : m.score_b;
                  const theirs = m.team_a === team ? m.score_b : m.score_a;
                  return (
                    <li key={m.id}>
                      <Link
                        href={`/live/${m.id}`}
                        className="flex items-center gap-3 rounded-xl border border-edge bg-surface px-4 py-3 transition-colors hover:border-edge-strong"
                      >
                        <ResultBadge result={res} live={m.status === 'live'} />
                        <span className="h-7 w-7 shrink-0">
                          <TeamLogo name={opp} season={m.season} className="h-full w-full" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-fg">vs {opp}</p>
                          {m.match_date && (
                            <p className="text-xs tabular-nums text-fg-dim">
                              {new Date(m.match_date).toLocaleDateString('ko-KR')}
                            </p>
                          )}
                        </div>
                        {hasScore && (res || m.status === 'live') && (
                          <span className="shrink-0 font-display text-lg tabular-nums text-fg">
                            {mine} : {theirs}
                          </span>
                        )}
                        {matchAvg !== null && (
                          <span
                            title={`이 경기 GVR 평점 (${scores!.length}명 평가)`}
                            className="inline-flex shrink-0 items-center rounded-lg border border-accent/30 bg-accent/10 px-2 py-1 font-display text-sm font-semibold tabular-nums text-accent-bright"
                          >
                            ★ {matchAvg.toFixed(1)}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-edge bg-raised px-2.5 py-0.5 text-xs font-semibold text-fg-mid">
      {children}
    </span>
  );
}

function StatTile({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 sm:p-4 ${accent ? 'border-accent/30 bg-accent/5' : 'border-edge bg-surface'}`}>
      <dt className="truncate text-xs font-semibold text-fg-dim">{label}</dt>
      <dd className="mt-2 flex items-baseline gap-1">
        <span className={`font-display text-2xl font-medium leading-none tabular-nums sm:text-4xl ${accent ? 'text-accent-bright' : 'text-fg'}`}>
          {value}
        </span>
        <span className="truncate text-xs text-fg-dim">{sub}</span>
      </dd>
    </div>
  );
}

function ResultBadge({ result, live }: { result: 'W' | 'L' | 'D' | null; live: boolean }) {
  if (live) return <LiveBadge small />;
  const style =
    result === 'W'
      ? 'border-accent/30 bg-accent/10 text-accent-bright'
      : result === 'L'
        ? 'border-edge bg-canvas/60 text-fg-dim'
        : result === 'D'
          ? 'border-away/30 bg-away/10 text-away'
          : 'border-edge text-fg-dim';
  const label = result === 'W' ? '승' : result === 'L' ? '패' : result === 'D' ? '무' : '예정';
  return (
    <span className={`inline-flex h-7 w-10 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${style}`}>
      {label}
    </span>
  );
}
