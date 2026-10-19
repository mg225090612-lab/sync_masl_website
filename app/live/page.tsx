'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useLiveMatches, isDone, startOfToday } from '@/lib/live';
import TeamLogo from '@/app/components/TeamLogo';
import LiveBadge from '@/app/components/LiveBadge';

// 💡 라이브 모아보기 (/live) — 메뉴의 "Live"를 누르면 오는 곳입니다.
// 진행 중인 경기는 실시간으로, 예정·종료 경기는 처음 열 때 한 번 불러옵니다.
// 끝난 경기의 점수는 DB(matches)에 남아 있어서 언제든 다시 볼 수 있습니다.
export default function LiveHubPage() {
  const live = useLiveMatches();
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [finished, setFinished] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase
        .from('matches')
        .select('*')
        .eq('status', 'scheduled')
        .gte('match_date', new Date(startOfToday()).toISOString()) // 오늘 경기 포함
        .order('match_date', { ascending: true })
        .limit(10),
      // 끝난 경기: 라이브로 종료한 경기 + 예전에 '경기 관리'에서 결과만 넣어둔 지난 경기
      supabase
        .from('matches')
        .select('*')
        .or(`status.eq.finished,match_date.lt.${new Date(startOfToday()).toISOString()}`)
        .order('match_date', { ascending: false })
        .limit(60),
    ]).then(([{ data: up }, { data: fin }]) => {
      setUpcoming(up || []);
      setFinished((fin || []).filter(isDone).slice(0, 30));
      setLoading(false);
    });
  }, []);

  // 방금 시작/종료된 경기가 다른 목록에 중복으로 보이지 않게 거릅니다.
  const liveIds = new Set(live.map(m => m.id));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      <header className="mb-10 border-b border-edge pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-danger">Live Center</p>
        <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.1] text-fg md:text-6xl">Live</h1>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-fg-mid">
          진행 중인 경기의 점수와 소식을 실시간으로 확인하세요. 새로고침하지 않아도 자동으로 바뀝니다.
        </p>
      </header>

      <Group title="진행 중">
        {live.length === 0 ? (
          <Empty text="지금 진행 중인 경기가 없습니다." />
        ) : (
          live.map(m => <MatchItem key={m.id} match={m} />)
        )}
      </Group>

      <Group title="예정된 경기">
        {loading ? <Skeleton /> : upcoming.filter(m => !liveIds.has(m.id)).length === 0 ? (
          <Empty text="예정된 경기가 없습니다." />
        ) : (
          upcoming.filter(m => !liveIds.has(m.id)).map(m => <MatchItem key={m.id} match={m} />)
        )}
      </Group>

      <Group title="최근 끝난 경기">
        {loading ? <Skeleton /> : finished.filter(m => !liveIds.has(m.id)).length === 0 ? (
          <Empty text="아직 끝난 경기가 없습니다." />
        ) : (
          finished.filter(m => !liveIds.has(m.id)).map(m => <MatchItem key={m.id} match={m} />)
        )}
      </Group>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">{title}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-8 text-center">
      <p className="text-sm font-medium text-fg-dim">{text}</p>
    </div>
  );
}

function Skeleton() {
  return <div className="h-[68px] animate-pulse rounded-xl border border-edge bg-surface" />;
}

function MatchItem({ match }: { match: any }) {
  const isLive = match.status === 'live';
  const isScheduled = !isLive && !isDone(match);
  return (
    <Link
      href={`/live/${match.id}`}
      className={`flex items-center gap-3 rounded-xl border bg-surface px-4 py-3 transition-colors hover:border-edge-strong ${
        isLive ? 'border-danger/40' : 'border-edge'
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-fg-dim">{match.sport_type}</span>
          {isLive && <LiveBadge small />}
          {!isLive && match.match_date && (
            <span className="text-xs tabular-nums text-fg-dim">
              {new Date(match.match_date).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-2">
          <TeamLogo name={match.team_a} season={match.season} className="h-6 w-6 shrink-0" />
          <span className="min-w-0 truncate text-sm font-semibold text-fg">{match.team_a}</span>
          <span className="shrink-0 text-xs text-fg-dim">vs</span>
          <span className="min-w-0 truncate text-sm font-semibold text-fg">{match.team_b}</span>
          <TeamLogo name={match.team_b} season={match.season} className="h-6 w-6 shrink-0" />
        </div>
      </div>
      {!isScheduled && (match.score_a !== null || isLive) ? (
        <p className="shrink-0 font-display text-2xl font-medium tabular-nums text-fg">
          {match.score_a ?? 0} : {match.score_b ?? 0}
        </p>
      ) : !isScheduled && match.winnder_id ? (
        <p className="max-w-24 shrink-0 truncate text-xs font-semibold text-accent-bright">{match.winnder_id} 승</p>
      ) : null}
    </Link>
  );
}
