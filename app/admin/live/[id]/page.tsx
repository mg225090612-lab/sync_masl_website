'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, getSessionUser } from '@/lib/supabase';
import { invalidateCache } from '@/lib/cache';
import { isAdminUser } from '@/lib/admin';
import { uniqueChannel, minuteLabel, type MatchEvent } from '@/lib/live';
import TeamLogo from '@/app/components/TeamLogo';
import LiveBadge from '@/app/components/LiveBadge';

const inputCls =
  'h-12 w-full rounded-lg border border-edge bg-surface px-3 text-base font-medium text-fg transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25';

interface PageProps {
  params: Promise<{ id: string }>;
}

// 💡 경기 하나만 크게 띄운 점수 입력 화면 (/admin/live/경기id)
// 경기장에서 휴대폰으로 누르기 편하도록 버튼을 크게 만들었습니다.
export default function AdminLivePage({ params }: PageProps) {
  const { id } = use(params);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getSessionUser().then(u => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pt-6 pb-24 sm:px-6">
      <Link href="/admin?tab=live" className="text-sm font-medium text-fg-mid transition-colors hover:text-fg">
        ← 경기 목록
      </Link>
      <div className="mt-4">
        {authLoading ? (
          <div className="h-64 animate-pulse rounded-xl border border-edge bg-surface" />
        ) : !isAdminUser(user) ? (
          <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
            <p className="text-[15px] font-semibold text-fg-mid">관리자만 점수를 입력할 수 있습니다.</p>
            <Link href="/admin" className="mt-4 inline-block text-sm font-semibold text-accent-bright hover:underline">
              관리자 로그인하러 가기
            </Link>
          </div>
        ) : (
          <Scorer id={id} />
        )}
      </div>
    </div>
  );
}

function Scorer({ id }: { id: string }) {
  const [match, setMatch] = useState<any>(null);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [minute, setMinute] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('matches').select('*').eq('id', id).maybeSingle(),
      supabase.from('match_events').select('*').eq('match_id', id).order('created_at', { ascending: false }),
    ]).then(([{ data: m }, { data: ev }]) => {
      setMatch(m);
      setEvents((ev as MatchEvent[]) || []);
      setLoading(false);
    });

    // 다른 관리자가 같은 경기를 동시에 조작해도 화면이 맞춰지도록 구독합니다.
    const channel = supabase
      .channel(uniqueChannel(`admin-live:${id}`))
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, payload => {
        setMatch(payload.new);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_events', filter: `match_id=eq.${id}` }, payload => {
        const ev = payload.new as MatchEvent;
        setEvents(prev => (prev.some(e => e.id === ev.id) ? prev : [ev, ...prev]));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'match_events' }, payload => {
        const oldId = (payload.old as any)?.id;
        setEvents(prev => prev.filter(e => e.id !== oldId));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) return <div className="h-64 animate-pulse rounded-xl border border-edge bg-surface" />;
  if (!match) {
    return (
      <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
        <p className="text-[15px] font-semibold text-fg-mid">경기를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const a = match.score_a ?? 0;
  const b = match.score_b ?? 0;

  const updateMatch = async (row: Record<string, any>) => {
    setBusy(true);
    const { data, error } = await supabase.from('matches').update(row).eq('id', match.id).select().maybeSingle();
    setBusy(false);
    if (error) { alert('저장 실패: ' + error.message); return false; }
    if (data) setMatch(data);
    invalidateCache(''); // 대진표 캐시 비우기
    return true;
  };

  const start = async () => {
    if (!confirm(`[${match.team_a} vs ${match.team_b}] 경기를 시작할까요?\n사이트 전체에 LIVE 표시가 켜집니다.`)) return;
    await updateMatch({ status: 'live', score_a: match.score_a ?? 0, score_b: match.score_b ?? 0 });
  };

  // 💡 점수를 바꾸면 타임라인에도 자동으로 한 줄 올라갑니다. (위 '분' 칸에 숫자가 있으면 함께 기록)
  const addScore = async (side: 'a' | 'b', delta: number) => {
    const current = side === 'a' ? a : b;
    const next = Math.max(0, current + delta);
    if (next === current) return;
    const ok = await updateMatch(side === 'a' ? { score_a: next } : { score_b: next });
    if (!ok) return;
    const team = side === 'a' ? match.team_a : match.team_b;
    const na = side === 'a' ? next : a;
    const nb = side === 'b' ? next : b;
    await insertEvent(delta > 0 ? `${team} 득점! (${na} : ${nb})` : `${team} 득점 취소 (${na} : ${nb})`);
  };

  const end = async () => {
    const winner = a > b ? match.team_a : b > a ? match.team_b : null;
    const msg = winner
      ? `경기를 종료할까요?\n최종 ${a} : ${b} → 승리 팀: ${winner}`
      : `경기를 종료할까요?\n최종 ${a} : ${b} (동점 — 승리 팀은 '경기 관리' 탭에서 직접 지정해 주세요)`;
    if (!confirm(msg)) return;
    await updateMatch({ status: 'finished', winnder_id: winner });
  };

  // 테스트로 눌러본 경기 등을 완전히 처음 상태로 돌립니다. (점수·승리 팀·타임라인 모두 삭제)
  const resetToScheduled = async () => {
    if (!confirm(`[${match.team_a} vs ${match.team_b}] 경기를 '경기 전'으로 되돌릴까요?
점수, 승리 팀, 타임라인 소식이 모두 지워집니다.`)) return;
    setBusy(true);
    const { error } = await supabase.from('match_events').delete().eq('match_id', match.id);
    setBusy(false);
    if (error) return alert('타임라인 삭제 실패: ' + error.message);
    setEvents([]);
    await updateMatch({ status: 'scheduled', score_a: null, score_b: null, winnder_id: null });
  };

  const reopen = async () => {
    if (!confirm('종료한 경기를 다시 진행 중으로 바꿀까요?')) return;
    await updateMatch({ status: 'live', winnder_id: null });
  };

  const insertEvent = async (text: string) => {
    setBusy(true);
    const { data, error } = await supabase
      .from('match_events')
      .insert({ match_id: match.id, minute: minute === '' ? null : Number(minute), content: text })
      .select()
      .maybeSingle();
    setBusy(false);
    if (error) { alert('타임라인 올리기 실패: ' + error.message); return false; }
    if (data) setEvents(prev => (prev.some(e => e.id === data.id) ? prev : [data as MatchEvent, ...prev]));
    return true;
  };

  const postEvent = async () => {
    const text = content.trim();
    if (!text) return;
    if (await insertEvent(text)) setContent('');
  };

  const removeEvent = async (ev: MatchEvent) => {
    if (!confirm(`이 소식을 지울까요?\n"${ev.content}"`)) return;
    const { error } = await supabase.from('match_events').delete().eq('id', ev.id);
    if (error) return alert('삭제 실패: ' + error.message);
    setEvents(prev => prev.filter(e => e.id !== ev.id));
  };

  // 자주 쓰는 문장 — 누르면 입력칸에 채워집니다. (득점은 +1 버튼이 자동으로 올립니다)
  const presets = [
    '전반 종료',
    '후반 시작',
    '타임아웃',
  ];

  return (
    <div className="space-y-5">
      {/* 상태 줄 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-full border border-edge bg-raised px-2.5 py-0.5 text-xs font-semibold text-fg-mid">
          {match.sport_type}
        </span>
        {isLive ? (
          <LiveBadge />
        ) : (
          <span className="text-xs font-medium text-fg-dim">{isFinished ? '종료된 경기' : '경기 전'}</span>
        )}
        <div className="flex-1" />
        <a href={`/live/${match.id}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-accent-bright hover:underline">
          관객 화면 보기 ↗
        </a>
      </div>

      {/* 점수판 — 큰 버튼 */}
      <section className={`rounded-2xl border bg-raised p-4 sm:p-6 ${isLive ? 'border-danger/40' : 'border-edge'}`}>
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          <TeamScore name={match.team_a} season={match.season} score={a} disabled={!isLive || busy}
            onPlus={() => addScore('a', 1)} onMinus={() => addScore('a', -1)} />
          <TeamScore name={match.team_b} season={match.season} score={b} disabled={!isLive || busy}
            onPlus={() => addScore('b', 1)} onMinus={() => addScore('b', -1)} />
        </div>

        <div className="mt-6">
          {isLive ? (
            <button onClick={end} disabled={busy}
              className="h-14 w-full rounded-xl border border-danger/30 bg-danger/10 text-base font-semibold text-danger transition-colors hover:bg-danger/20 disabled:opacity-50">
              경기 종료
            </button>
          ) : isFinished ? (
            <button onClick={reopen} disabled={busy}
              className="h-14 w-full rounded-xl border border-edge-strong text-base font-semibold text-fg transition-colors hover:bg-surface disabled:opacity-50">
              다시 진행 중으로 바꾸기
            </button>
          ) : (
            <button onClick={start} disabled={busy}
              className="h-14 w-full rounded-xl bg-accent text-base font-semibold text-canvas transition-colors hover:bg-accent-bright disabled:opacity-50">
              ▶ 경기 시작
            </button>
          )}
          {!isLive && !isFinished && (
            <p className="mt-2 text-center text-xs text-fg-dim">경기를 시작해야 점수 버튼이 눌립니다.</p>
          )}
          {(isLive || isFinished) && (
            <button onClick={resetToScheduled} disabled={busy}
              className="mt-3 w-full text-center text-xs font-medium text-fg-dim underline-offset-2 transition-colors hover:text-danger hover:underline disabled:opacity-50">
              경기 전으로 되돌리기 (테스트 기록 지우기)
            </button>
          )}
        </div>
      </section>

      {/* 타임라인 소식 */}
      <section className="rounded-2xl border border-edge bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-fg">타임라인 소식 올리기</h2>
        <p className="mt-1 text-xs text-fg-dim">점수 버튼을 누르면 &quot;득점!&quot; 소식이 자동으로 올라갑니다. &apos;분&apos; 칸을 채워두면 시간도 함께 기록돼요.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {presets.map(p => (
            <button key={p} onClick={() => setContent(p)}
              className="h-9 max-w-full truncate rounded-full border border-edge px-3 text-sm font-medium text-fg-mid transition-colors hover:border-edge-strong hover:text-fg">
              {p}
            </button>
          ))}
        </div>
        <div className="mt-3 flex gap-2">
          <input type="number" inputMode="numeric" min={0} value={minute} onChange={e => setMinute(e.target.value)}
            placeholder="분" className={`${inputCls} w-20 shrink-0 text-center tabular-nums`} />
          <input value={content} onChange={e => setContent(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) postEvent(); }}
            placeholder="예: 김민준 선수 골!" maxLength={200} className={`${inputCls} min-w-0 flex-1`} />
        </div>
        <button onClick={postEvent} disabled={busy || !content.trim()}
          className="mt-2 h-12 w-full rounded-xl bg-accent text-base font-semibold text-canvas transition-colors hover:bg-accent-bright disabled:opacity-50">
          올리기
        </button>

        {events.length > 0 && (
          <ol className="mt-4 space-y-2">
            {events.map(ev => (
              <li key={ev.id} className="flex items-center gap-3 rounded-lg border border-edge bg-raised px-3 py-2.5">
                <span className="w-10 shrink-0 font-display text-sm font-semibold tabular-nums text-accent-bright">
                  {minuteLabel(ev.minute)}
                </span>
                <p className="min-w-0 flex-1 text-sm text-fg">{ev.content}</p>
                <button onClick={() => removeEvent(ev)} className="shrink-0 px-1 text-xs font-medium text-fg-dim transition-colors hover:text-danger">
                  삭제
                </button>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function TeamScore({ name, season, score, disabled, onPlus, onMinus }: {
  name: string; season?: string; score: number; disabled: boolean; onPlus: () => void; onMinus: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-xl border border-edge bg-canvas/40 p-1.5">
        <TeamLogo name={name} season={season} className="h-full w-full" />
      </span>
      <p className="w-full truncate text-sm font-semibold text-fg">{name}</p>
      <p className="font-display text-6xl font-medium leading-none tabular-nums text-fg sm:text-7xl">{score}</p>
      <button onClick={onPlus} disabled={disabled}
        className="h-16 w-full rounded-xl bg-accent font-display text-2xl font-semibold text-canvas transition-colors hover:bg-accent-bright active:opacity-80 disabled:opacity-30">
        +1
      </button>
      <button onClick={onMinus} disabled={disabled}
        className="h-10 w-full rounded-lg border border-edge-strong text-sm font-semibold text-fg-mid transition-colors hover:bg-surface disabled:opacity-30">
        -1 (취소)
      </button>
    </div>
  );
}
