'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { uniqueChannel, minuteLabel, isDone, periodsOf, periodName, isSetBased, type MatchEvent } from '@/lib/live';
import TeamLogo from '@/app/components/TeamLogo';
import ChampionStars from '@/app/components/ChampionStars';
import LiveBadge from '@/app/components/LiveBadge';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 💡 라이브 중계 페이지 (/live/경기id)
// 관리자가 점수·타임라인을 올리면 Supabase Realtime으로 새로고침 없이 바로 바뀝니다.
export default function LivePage({ params }: PageProps) {
  const { id } = use(params);
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    Promise.all([
      supabase.from('matches').select('*').eq('id', id).maybeSingle(),
      supabase.from('match_events').select('*').eq('match_id', id).order('created_at', { ascending: true }),
    ]).then(([{ data: m }, { data: ev }]) => {
      if (!alive) return;
      setMatch(m);
      setEvents((ev as MatchEvent[]) || []);
      setLoading(false);
    });

    const channel = supabase
      .channel(uniqueChannel(`live-page:${id}`))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, payload => {
        setMatch(payload.new);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` }, payload => {
        const ev = payload.new as MatchEvent;
        setEvents(prev => (prev.some(e => e.id === ev.id) ? prev : [...prev, ev]));
      })
      // 💡 DELETE는 filter가 적용되지 않아서 id로 직접 골라냅니다.
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'match_events' }, payload => {
        const oldId = (payload.old as any)?.id;
        setEvents(prev => prev.filter(e => e.id !== oldId));
      })
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-24 sm:px-6">
        <div className="h-64 animate-pulse rounded-2xl border border-edge bg-surface" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 pt-10 pb-24 sm:px-6">
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">경기를 찾을 수 없습니다.</p>
          <Link href="/masl" className="mt-4 inline-block text-sm font-semibold text-accent-bright hover:underline">
            대진표로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const isLive = match.status === 'live';
  const isFinished = isDone(match);
  const a = match.score_a ?? 0;
  const b = match.score_b ?? 0;
  // 승리 팀이 지정돼 있으면 그 값을, 없으면 점수로 판단
  const winA = isFinished && (match.winnder_id ? match.winnder_id === match.team_a : a > b);
  const winB = isFinished && (match.winnder_id ? match.winnder_id === match.team_b : b > a);
  const periods = periodsOf(match);
  // 최신 소식이 맨 위로
  const timeline = [...events].reverse();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 pb-24 sm:px-6 md:pt-10">
      <Link href="/live" className="mb-4 inline-block text-sm font-medium text-fg-mid transition-colors hover:text-fg">
        ← 라이브 목록
      </Link>
      {/* 점수판 */}
      <section className="relative overflow-hidden rounded-2xl border border-edge bg-raised p-5 shadow-xl shadow-black/30 md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(248,113,113,0.12),transparent_70%)]"
        />
        <div className="relative flex flex-wrap items-center justify-center gap-2 text-center">
          <span className="inline-flex items-center rounded-full border border-edge bg-canvas/60 px-2.5 py-0.5 text-xs font-semibold text-fg-mid">
            {match.sport_type}
          </span>
          <span className="text-xs font-medium text-fg-dim">{match.season}</span>
          {isLive ? (
            <LiveBadge />
          ) : isFinished ? (
            <span className="inline-flex items-center rounded-full border border-edge bg-canvas/60 px-2 py-0.5 font-display text-xs font-semibold uppercase tracking-[0.08em] text-fg-mid">
              FT
            </span>
          ) : (
            <span className="text-xs font-medium text-fg-dim">경기 전</span>
          )}
        </div>

        <div className="relative mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          <Side name={match.team_a} season={match.season} dim={isFinished && !winA} />
          <p className="px-1 font-display text-5xl font-medium leading-none tabular-nums md:text-7xl">
            <span className={isFinished && !winA ? 'text-fg-dim' : 'text-fg'}>{isLive ? a : match.score_a ?? '-'}</span>
            <span className="px-2 text-fg-dim md:px-3">:</span>
            <span className={isFinished && !winB ? 'text-fg-dim' : 'text-fg'}>{isLive ? b : match.score_b ?? '-'}</span>
          </p>
          <Side name={match.team_b} season={match.season} dim={isFinished && !winB} />
        </div>

        {/* 지금 몇 번째 구간인지 + 끝난 구간 점수 (전반/쿼터/세트) */}
        {isLive && (
          <p className="relative mt-5 text-center font-display text-sm font-semibold uppercase tracking-[0.08em] text-danger">
            지금 {periodName(match.sport_type, periods.length)}
          </p>
        )}
        {periods.length > 0 && (
          <div className="relative mt-4 flex flex-wrap justify-center gap-2">
            {periods.map((p, i) => (
              <span key={i} className="inline-flex items-center gap-2 rounded-lg border border-edge bg-canvas/40 px-3 py-1.5 text-xs">
                <span className="font-semibold text-fg-dim">{periodName(match.sport_type, i)}</span>
                <span className="font-display text-sm tabular-nums text-fg">{p.a} : {p.b}</span>
              </span>
            ))}
          </div>
        )}
        {isFinished && isSetBased(match.sport_type) && periods.length > 0 && (
          <p className="relative mt-2 text-center text-xs text-fg-dim">최종 점수는 이긴 세트 수입니다</p>
        )}
      </section>

      {/* 타임라인 */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-semibold uppercase tracking-[0.04em] text-fg">Timeline</h2>
        {timeline.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-10 text-center">
            <p className="text-sm font-medium text-fg-dim">아직 올라온 소식이 없습니다.</p>
          </div>
        ) : (
          <ol className="mt-4 space-y-2">
            {timeline.map(ev => (
              <li key={ev.id} className="flex gap-3 rounded-xl border border-edge bg-surface px-4 py-3">
                <span className="w-10 shrink-0 font-display text-sm font-semibold tabular-nums text-accent-bright">
                  {minuteLabel(ev.minute)}
                </span>
                <p className="min-w-0 flex-1 text-[15px] leading-[1.6] text-fg">{ev.content}</p>
                <time className="shrink-0 text-xs tabular-nums text-fg-dim">
                  {new Date(ev.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                </time>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Side({ name, season, dim }: { name: string; season?: string; dim: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
      <span
        className={`flex h-16 w-16 items-center justify-center rounded-xl border border-edge bg-canvas/40 p-2 md:h-24 md:w-24 ${
          dim ? 'opacity-60' : ''
        }`}
      >
        <TeamLogo name={name} season={season} className="h-full w-full" />
      </span>
      <p className={`w-full truncate text-sm font-semibold leading-[1.4] ${dim ? 'text-fg-dim' : 'text-fg'}`}>{name}</p>
      <ChampionStars team={name} size="md" />
    </div>
  );
}
