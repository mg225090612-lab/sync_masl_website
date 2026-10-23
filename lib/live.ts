// lib/live.ts
// 💡 실시간 라이브 경기 도우미입니다.
// Supabase Realtime으로 matches 표의 변화를 "구독"해서, 관리자가 점수를 바꾸는 순간
// 새로고침 없이 화면 숫자가 바뀌도록 합니다. (DB 준비: supabase/live_setup.sql)
'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export type MatchEvent = {
  id: string;
  match_id: string;
  minute: number | null;
  content: string;
  created_at: string;
};

// 같은 페이지에서 여러 컴포넌트가 구독해도 채널 이름이 겹치지 않게 번호를 붙입니다.
let channelSeq = 0;
export function uniqueChannel(prefix: string) {
  channelSeq += 1;
  return `${prefix}:${channelSeq}:${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 지금 진행 중(status = 'live')인 경기 목록을 실시간으로 돌려줍니다.
 * 경기가 시작/종료되거나 점수가 바뀌면 자동으로 갱신됩니다.
 */
export function useLiveMatches() {
  const [live, setLive] = useState<any[]>([]);

  useEffect(() => {
    let alive = true;

    supabase
      .from('matches')
      .select('*')
      .eq('status', 'live')
      .order('match_date', { ascending: true })
      .then(({ data }) => {
        if (alive) setLive(data || []);
      });

    // 💡 filter를 걸지 않는 이유: live → finished로 바뀌는 순간도 받아야 목록에서 뺄 수 있기 때문입니다.
    const channel = supabase
      .channel(uniqueChannel('live-matches'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, payload => {
        const row: any = payload.new;
        const oldId = (payload.old as any)?.id;
        setLive(prev => {
          const rest = prev.filter(m => m.id !== (row?.id ?? oldId));
          return row?.status === 'live' ? [...rest, row] : rest;
        });
      })
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return live;
}

/** "전반 12분" 같은 표시용 분 텍스트 */
export function minuteLabel(minute: number | null) {
  return minute === null || minute === undefined ? '' : `${minute}'`;
}

/** 오늘 0시 (오늘 경기는 '다가올 경기'로 취급하기 위한 기준) */
export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function timeOf(m: any) {
  return m.match_date ? new Date(m.match_date).getTime() : Infinity; // 날짜 없는 경기는 '다가올 경기' 맨 뒤
}

/** 다가올 경기인가요? (오늘 경기 포함) */
export function isUpcoming(m: any) {
  return timeOf(m) >= startOfToday();
}

/**
 * 결과가 이미 나온 경기인가요?
 * 라이브 기능 전에 '경기 관리' 탭에서 점수/승리 팀만 넣어둔 지난 경기도 끝난 경기로 봅니다.
 */
export function isDone(m: any) {
  if (m.status === 'finished') return true;
  if (m.status === 'live') return false;
  const hasResult = !!m.winnder_id || (m.score_a !== null && m.score_a !== undefined);
  return hasResult && !isUpcoming(m);
}

/** 다가올 경기를 앞(가까운 날짜순)으로, 지난 경기를 뒤(최근순)로 정렬합니다. */
export function sortUpcomingFirst<T>(list: T[]): T[] {
  const upcoming = list.filter(isUpcoming).sort((x, y) => timeOf(x) - timeOf(y));
  const past = list.filter(m => !isUpcoming(m)).sort((x, y) => timeOf(y) - timeOf(x));
  return [...upcoming, ...past];
}

/* ── 구간(전반·후반 / 쿼터 / 세트) ─────────────────────────────
   '구간 종료'를 누르면 그 구간 점수가 matches.periods 에 저장되고 점수판은 0 : 0으로 리셋됩니다.
   (DB 준비: supabase/periods_setup.sql) */
export type Period = { a: number; b: number };

export function periodsOf(m: any): Period[] {
  return Array.isArray(m?.periods) ? m.periods : [];
}

/** 몇 번째 구간인지 종목에 맞는 이름으로 (index는 0부터) */
export function periodName(sport: string | null | undefined, index: number) {
  if (sport?.includes('축구')) return index === 0 ? '전반' : index === 1 ? '후반' : `연장 ${index - 1}`;
  if (sport?.includes('농구')) return `${index + 1}쿼터`;
  if (sport?.includes('배구')) return `${index + 1}세트`;
  return `${index + 1}라운드`;
}

/** 배구는 세트를 이긴 횟수로 판단합니다. */
export function isSetBased(sport: string | null | undefined) {
  return !!sport?.includes('배구');
}

/** 종목별 득점 버튼 단위 — 농구는 자유투(+1)/2점/3점을 한 번에 올립니다. */
export function scoreSteps(sport: string | null | undefined): number[] {
  return sport?.includes('농구') ? [1, 2, 3] : [1];
}

/** 기록된 구간 점수의 합 (농구·축구처럼 점수가 누적되는 종목에서 구간별 득점 계산용) */
export function sumPeriods(periods: Period[]): Period {
  return periods.reduce((s, p) => ({ a: s.a + p.a, b: s.b + p.b }), { a: 0, b: 0 });
}

/**
 * 최종 점수 계산 — 배구는 이긴 세트 수(예: 2 : 1), 나머지 종목은 모든 구간 점수의 합.
 */
export function finalScore(sport: string | null | undefined, periods: Period[]): Period {
  if (isSetBased(sport)) {
    return {
      a: periods.filter(p => p.a > p.b).length,
      b: periods.filter(p => p.b > p.a).length,
    };
  }
  return periods.reduce((s, p) => ({ a: s.a + p.a, b: s.b + p.b }), { a: 0, b: 0 });
}

/* ── 종목별 점수 입력 ─────────────────────────────────────── */

/** 점수가 올라갈 때 타임라인에 자동으로 올라가는 문구 */
export function scoreText(sport: string | null | undefined, team: string, delta: number, a: number, b: number) {
  const score = `(${a} : ${b})`;
  if (delta < 0) return `${team} 점수 정정 ${score}`;
  if (sport?.includes('축구')) return `${team} ⚽ 골! ${score}`;
  if (sport?.includes('농구')) return `${team} ${delta === 3 ? '3점슛!' : delta === 2 ? '2점 득점!' : '자유투 성공'} ${score}`;
  return `${team} 득점 ${score}`;
}

/** 배구 한 세트를 이기는 점수 (학교 리그 규칙: 모든 세트 15점) */
export const VOLLEYBALL_SET_POINTS = 15;

/**
 * 배구 세트가 끝났는지 — 15점 이상이면서 2점 차 이상 (14:14면 2점 차가 날 때까지 계속).
 */
export function isSetOver(sport: string | null | undefined, _index: number, a: number, b: number) {
  if (!isSetBased(sport)) return false;
  return Math.max(a, b) >= VOLLEYBALL_SET_POINTS && Math.abs(a - b) >= 2;
}
