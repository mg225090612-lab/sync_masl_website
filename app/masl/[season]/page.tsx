'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { cachedQuery } from '@/lib/cache';
import TeamLogo from '@/app/components/TeamLogo';

type SportTab = '남자축구' | '여자축구' | '남자농구' | '여자배구';

interface PageProps {
  params: Promise<{ season: string }>;
}

export default function MaslSeasonPage({ params }: PageProps) {
  // 💡 URL의 시즌 이름으로 동작하는 동적 허브입니다. (예: /masl/26 spring)
  // admin에서 새 시즌 경기를 등록하면 이 페이지가 자동으로 그 시즌을 지원합니다.
  const resolvedParams = use(params);
  const season = decodeURIComponent(resolvedParams.season);

  const sports: SportTab[] = ["남자축구", "여자축구", "남자농구", "여자배구"];

  // 1. 초기값을 설정할 때 브라우저에 저장된 값이 있는지 먼저 확인합니다.
  const [activeTab, setActiveTab] = useState<SportTab>("남자축구");
  const [teams, setTeams] = useState<string[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 💡 [추가] 페이지가 처음 켜질 때, 이전에 보던 종목이 있다면 불러옵니다.
  useEffect(() => {
    const savedTab = localStorage.getItem('masl_active_tab') as SportTab;
    if (savedTab && sports.includes(savedTab)) {
      setActiveTab(savedTab);
    }
  }, []);

  // 💡 [추가] 종목(Tab)을 바꿀 때마다 브라우저에 몰래 저장해둡니다.
  useEffect(() => {
    localStorage.setItem('masl_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const loadHubData = async () => {
      setLoading(true);

      // 💡 5분 동안 캐시: 종목 탭을 왔다 갔다 해도 이미 본 탭은 DB에 다시 요청하지 않습니다.
      // 두 쿼리도 순서대로가 아니라 동시에(Promise.all) 실행해서 더 빠릅니다.
      const { teams: teamList, matches: matchList } = await cachedQuery(
        `masl-hub:${season}:${activeTab}`,
        5 * 60 * 1000,
        async () => {
          const [{ data: teamData }, { data: matchData }] = await Promise.all([
            supabase.from('players').select('team_name').eq('category', activeTab),
            supabase
              .from('matches')
              .select('*')
              .eq('sport_type', activeTab)
              .eq('season', season) // 💡 이 시즌의 경기만
              .order('round', { ascending: false })
              .order('match_order', { ascending: true }),
          ]);

          // 참가 팀: 이 시즌 경기에 등장한 팀 우선, 경기가 없으면 선수 명단 기준
          const matchTeams = Array.from(
            new Set((matchData || []).flatMap(m => [m.team_a, m.team_b]).filter(Boolean))
          ) as string[];
          const rosterTeams = Array.from(new Set((teamData || []).map(p => p.team_name)));

          return {
            teams: matchTeams.length > 0 ? matchTeams : rosterTeams,
            matches: matchData || [],
          };
        }
      );

      setTeams(teamList);
      setMatches(matchList);
      setLoading(false);
    };
    loadHubData();
  }, [activeTab, season]);

  const quarters = matches.filter(m => m.round === 8);
  const semis = matches.filter(m => m.round === 4);
  const semi1 = semis.find(m => m.match_order === 1) || null;
  const semi2 = semis.find(m => m.match_order === 2) || null;
  const finalMatch = matches.find(m => m.round === 2) || null;
  const championName = finalMatch?.winnder_id || null;

  const hasBracket = !!(semi1 || semi2 || finalMatch || quarters.length > 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      {/* ── 페이지 헤더 ─────────────────────────────────────────────── */}
      <header className="mb-8 border-b border-edge pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
          MASL Season Hub
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.1] text-fg md:text-6xl">
          {season}
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-fg-mid">
          종목을 선택해 참가 팀과 토너먼트 대진을 확인하세요.
        </p>
      </header>

      {/* ── 종목 탭 ─────────────────────────────────────────────────── */}
      <div className="no-scrollbar mb-10 flex gap-2 overflow-x-auto pb-1">
        {sports.map(s => (
          <button
            key={s}
            onClick={() => setActiveTab(s)}
            className={
              activeTab === s
                ? 'h-10 shrink-0 whitespace-nowrap rounded-full bg-fg px-5 text-sm font-semibold text-canvas'
                : 'h-10 shrink-0 whitespace-nowrap rounded-full border border-edge bg-transparent px-5 text-sm font-medium text-fg-mid transition-colors hover:border-edge-strong hover:text-fg'
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* ══ 토너먼트 스테이지 — 좌우 4강이 중앙 결승으로 수렴하는 방송 그래픽 ══ */}
      <section>
        <div className="mb-6 flex items-end justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-4 w-1 rounded-full bg-accent" />
            <h2 className="text-xl font-bold leading-[1.3] tracking-[-0.01em] text-fg md:text-2xl">
              토너먼트
            </h2>
          </div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-dim">
            Road to the Final
          </p>
        </div>

        {loading ? (
          <div className="h-[420px] animate-pulse rounded-2xl border border-edge bg-surface" />
        ) : !hasBracket ? (
          <div className="rounded-2xl border border-dashed border-edge bg-surface/50 px-6 py-16 text-center">
            <p className="text-[15px] font-semibold text-fg-mid">아직 대진 정보가 없습니다.</p>
            <p className="mt-1 text-sm text-fg-dim">대진이 확정되면 이곳에 표시됩니다.</p>
          </div>
        ) : (
          <>
          {/* 8강 — 있는 종목(남자농구 등)에만 표시됩니다 */}
          {quarters.length > 0 && (
            <div className="mb-4">
              <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-dim">
                Quarter Finals · 8강
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                {quarters.map(q => (
                  <SemiCard key={q.id} match={q} label={`8강 ${q.match_order}경기`} />
                ))}
              </div>
            </div>
          )}
          <div className="relative overflow-hidden rounded-2xl border border-edge bg-surface/60 px-4 py-10 sm:px-6 md:px-8 md:py-14">
            {/* 배경 모티프 — 경기장 센터 서클 + 하프라인 + 상단 조명 */}
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg/5" />
              <div className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fg/5" />
              <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-fg/5" />
              <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(14,165,233,0.09),transparent_70%)]" />
            </div>

            {/* 데스크톱: SF1 ─→ FINAL ←─ SF2 */}
            <div className="relative hidden md:grid md:grid-cols-[1fr_2.5rem_minmax(320px,400px)_2.5rem_1fr] md:items-center">
              <SemiCard match={semi1} label="Semi Final 1" />
              <Connector active={!!championName} />
              <div className="flex flex-col gap-4">
                {championName && <ChampionCrest name={championName} season={season} />}
                <FinalCard match={finalMatch} />
              </div>
              <Connector active={!!championName} flip />
              <SemiCard match={semi2} label="Semi Final 2" />
            </div>

            {/* 모바일: 챔피언 → 결승 → 4강 순 세로 스택 */}
            <div className="relative space-y-4 md:hidden">
              {championName && <ChampionCrest name={championName} season={season} />}
              <FinalCard match={finalMatch} />
              <div className="flex items-center gap-3 pt-2" aria-hidden="true">
                <div className="h-px flex-1 bg-edge" />
                <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-dim">
                  Semi Finals
                </span>
                <div className="h-px flex-1 bg-edge" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <SemiCard match={semi1} label="Semi Final 1" />
                <SemiCard match={semi2} label="Semi Final 2" />
              </div>
            </div>
          </div>
          </>
        )}
      </section>

      {/* ── 참가 팀 — 로고 카드 그리드 ──────────────────────────────── */}
      <section className="mt-14">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-4 w-1 rounded-full bg-accent" />
          <h2 className="text-xl font-bold leading-[1.3] tracking-[-0.01em] text-fg md:text-2xl">
            참가 팀
          </h2>
          {!loading && (
            <span className="text-sm font-medium tabular-nums text-fg-dim">{teams.length}</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-[76px] animate-pulse rounded-xl border border-edge bg-surface" />
            ))}
          </div>
        ) : teams.length === 0 ? (
          <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
            <p className="text-[15px] font-semibold text-fg-mid">참가 팀 정보가 없습니다.</p>
            <p className="mt-1 text-sm text-fg-dim">다른 종목을 선택해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {teams.map(name => (
              <Link
                href={`/masl/team/${encodeURIComponent(name)}?season=${encodeURIComponent(season)}&sport=${encodeURIComponent(activeTab)}`}
                key={name}
                className="flex items-center gap-3 rounded-xl border border-edge bg-surface p-4 transition-colors hover:border-edge-strong hover:bg-raised"
              >
                <TeamLogo name={name} season={season} className="h-12 w-12 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-fg">{name}</p>
                  <p className="mt-0.5 text-xs text-fg-dim">선수단 보기 →</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* 4강 → 결승 연결선. 승부가 결정되면 액센트로 점등됩니다. */
function Connector({ active, flip = false }: { active: boolean; flip?: boolean }) {
  return (
    <div className="relative h-px w-full self-center" aria-hidden="true">
      <div className={`absolute inset-0 ${active ? 'bg-accent/60' : 'bg-edge-strong'}`} />
      <div
        className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full ${flip ? 'left-0' : 'right-0'} ${
          active ? 'bg-accent' : 'bg-edge-strong'
        }`}
      />
    </div>
  );
}

/* 4강 카드 — 스코어보드 헤더 + 팀 행 */
function SemiCard({ match, label }: { match: any; label: string }) {
  if (!match) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-edge bg-surface/70 px-6 py-8 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-dim">
          {label}
        </p>
        <p className="text-[15px] font-semibold text-fg-mid">대진 미정</p>
      </div>
    );
  }
  const winA = match.winnder_id === match.team_a;
  const winB = match.winnder_id === match.team_b;
  return (
    <article className="w-full overflow-hidden rounded-xl border border-edge bg-raised shadow-lg shadow-black/25">
      {/* 헤더 스트립: 라운드 + 날짜 */}
      <div className="flex items-center justify-between gap-3 border-b border-edge bg-canvas/40 px-4 py-2.5">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-dim">
          {label}
        </p>
        {match.match_date && (
          <p className="text-xs font-medium tabular-nums text-fg-dim">
            {new Date(match.match_date).toLocaleDateString('ko-KR')}
          </p>
        )}
      </div>
      <div className="space-y-1.5 p-3">
        <SemiRow name={match.team_a} season={match.season} score={match.score_a} win={winA} />
        <SemiRow name={match.team_b} season={match.season} score={match.score_b} win={winB} />
      </div>
    </article>
  );
}

function SemiRow({ name, season, score, win }: { name: string; season?: string; score?: number; win: boolean }) {
  return (
    <div className={`flex items-center gap-3 rounded-lg px-2.5 py-2 ${win ? 'bg-accent/10' : ''}`}>
      {/* 로고 웰 */}
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-edge bg-canvas/60 p-1 ${
          win ? '' : 'opacity-60'
        }`}
      >
        <TeamLogo name={name} season={season} className="h-full w-full" />
      </span>
      <span
        className={`min-w-0 flex-1 truncate text-sm font-semibold leading-[1.4] ${
          win ? 'text-fg' : 'text-fg-dim'
        }`}
      >
        {name || 'TBD'}
      </span>
      {win && (
        <span className="inline-flex shrink-0 items-center rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent-bright">
          W
        </span>
      )}
      {/* 스코어 타일 — 스코어가 기록된 경기에만 표시 */}
      {score !== undefined && score !== null && (
        <span
          className={`flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg border px-2 font-display text-lg font-medium leading-none tabular-nums ${
            win
              ? 'border-accent/30 bg-accent/10 text-accent-bright'
              : 'border-edge bg-canvas/60 text-fg-dim'
          }`}
        >
          {score}
        </span>
      )}
    </div>
  );
}

/* 결승 카드 — 로고 페이스오프 + 대형 스코어 */
function FinalCard({ match }: { match: any }) {
  if (!match) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-edge bg-surface/70 px-6 py-12 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-fg-dim">
          The Grand Final
        </p>
        <p className="text-[15px] font-semibold text-fg-mid">대진 미정</p>
      </div>
    );
  }
  const winA = match.winnder_id === match.team_a;
  const winB = match.winnder_id === match.team_b;
  const decided = winA || winB;
  const hasScores =
    match.score_a !== undefined && match.score_a !== null &&
    match.score_b !== undefined && match.score_b !== null;
  return (
    <article className="relative overflow-hidden rounded-2xl border border-accent/30 bg-raised p-5 shadow-xl shadow-black/30 md:p-6">
      {/* 카드 상단 조명 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(14,165,233,0.14),transparent_70%)]"
      />
      <p className="relative text-center font-display text-xs font-semibold uppercase tracking-[0.14em] text-accent-bright">
        The Grand Final
      </p>
      <div className="relative mt-1.5 flex items-center justify-center gap-2">
        {match.match_date && (
          <p className="text-xs font-medium tabular-nums text-fg-dim">
            {new Date(match.match_date).toLocaleDateString('ko-KR')}
          </p>
        )}
        {decided && (
          <span className="inline-flex items-center rounded-full border border-edge bg-canvas/60 px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-[0.08em] text-fg-mid">
            FT
          </span>
        )}
      </div>
      <div className="relative mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
        <FinalSide name={match.team_a} season={match.season} win={winA} />
        {hasScores ? (
          <p className="px-1 font-display text-4xl font-medium leading-none tabular-nums md:text-5xl">
            <span className={winA ? 'text-fg' : 'text-fg-dim'}>{match.score_a}</span>
            <span className="px-1.5 text-fg-dim md:px-2">:</span>
            <span className={winB ? 'text-fg' : 'text-fg-dim'}>{match.score_b}</span>
          </p>
        ) : (
          <p className="px-2 font-display text-2xl font-medium uppercase text-fg-dim">VS</p>
        )}
        <FinalSide name={match.team_b} season={match.season} win={winB} />
      </div>
    </article>
  );
}

function FinalSide({ name, season, win }: { name: string; season?: string; win: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      {/* 로고 웰 — 승자는 액센트 프레임 */}
      <span
        className={`flex h-20 w-20 items-center justify-center rounded-xl border p-2 md:h-24 md:w-24 ${
          win ? 'border-accent/30 bg-accent/5' : 'border-edge bg-canvas/40 opacity-60'
        }`}
      >
        <TeamLogo name={name} season={season} className="h-full w-full" />
      </span>
      <p
        className={`w-full truncate text-sm font-semibold leading-[1.4] ${
          win ? 'text-fg' : 'text-fg-dim'
        }`}
      >
        {name || 'TBD'}
      </p>
      {win && (
        <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent-bright">
          WIN
        </span>
      )}
    </div>
  );
}

/* 챔피언 크레스트 — 이 페이지의 유일한 골드 히어로 모먼트 */
function ChampionCrest({ name, season }: { name: string; season: string }) {
  return (
    <div className="relative flex items-center justify-center gap-3 overflow-hidden rounded-xl border border-away/40 bg-away/10 px-5 py-4 shadow-[0_0_50px_rgba(251,191,36,0.12)]">
      <span className="text-xl" aria-hidden="true">🏆</span>
      <div className="min-w-0 text-center">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-away">
          Champion · {season}
        </p>
        <p className="truncate text-lg font-bold leading-[1.3] text-fg">{name}</p>
      </div>
    </div>
  );
}
