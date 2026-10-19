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
