// lib/teamInfo.ts
// 💡 팀 정보(학년·색깔·각오) — teams 표에 시즌·종목별로 저장됩니다. (DB 준비: supabase/team_info_setup.sql)
'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import { cachedQuery } from './cache';

export type TeamInfo = { name: string; category: string; season: string; grade: string | null; color: string | null; motto: string | null };

/** 한 시즌의 팀 정보 전체 (10분 캐시). 칸이 아직 없는 DB에서도 오류 없이 빈 목록을 돌려줍니다. */
export async function fetchTeamInfos(season: string | null | undefined): Promise<TeamInfo[]> {
  if (!season) return [];
  return cachedQuery(`team-info:${season}`, 10 * 60 * 1000, async () => {
    const { data, error } = await supabase.from('teams').select('*').eq('season', season);
    if (error) return [];
    return (data || []).map((t: any) => ({
      name: t.name, category: t.category, season: t.season,
      grade: t.grade ?? null, color: t.color ?? null, motto: t.motto ?? null,
    }));
  });
}

export function findTeamInfo(list: TeamInfo[], name: string, category?: string | null) {
  return list.find(t => t.name === name && (!category || t.category === category)) || list.find(t => t.name === name) || null;
}

/** 팀 하나의 정보 */
export function useTeamInfo(name: string | null | undefined, season: string | null | undefined, category?: string | null) {
  const [info, setInfo] = useState<TeamInfo | null>(null);
  useEffect(() => {
    if (!name || !season) return;
    let alive = true;
    fetchTeamInfos(season).then(list => { if (alive) setInfo(findTeamInfo(list, name, category)); });
    return () => { alive = false; };
  }, [name, season, category]);
  return info;
}

/** 시즌의 팀 정보 목록 (대진표의 팀 카드처럼 여러 팀을 한 번에 보여줄 때) */
export function useTeamInfos(season: string | null | undefined) {
  const [list, setList] = useState<TeamInfo[]>([]);
  useEffect(() => {
    if (!season) return;
    let alive = true;
    fetchTeamInfos(season).then(l => { if (alive) setList(l); });
    return () => { alive = false; };
  }, [season]);
  return list;
}

// 팀 색깔 이름 → 화면에 칠할 색 (모르는 색은 점을 그리지 않고 글자만 보여줍니다)
const COLOR_WORDS: [RegExp, string][] = [
  [/검정|검은|블랙|black/i, '#111827'],
  [/하늘|sky/i, '#7DD3FC'],
  [/남색|네이비|navy/i, '#1E3A8A'],
  [/빨강|빨간|레드|red/i, '#EF4444'],
  [/분홍|핑크|pink/i, '#F9A8D4'],
  [/노랑|노란|옐로|yellow/i, '#FACC15'],
  [/파랑|파란|블루|blue/i, '#3B82F6'],
  [/초록|녹색|그린|green/i, '#22C55E'],
  [/주황|오렌지|orange/i, '#F97316'],
  [/보라|퍼플|purple/i, '#A855F7'],
  [/흰|하양|화이트|white/i, '#F9FAFB'],
];

/** '빨강, 파랑' → ['#EF4444', '#3B82F6'] */
export function colorSwatches(color: string | null | undefined): string[] {
  if (!color) return [];
  return color
    .split(/[,/·&]|\s+and\s+/i)
    .map(part => COLOR_WORDS.find(([re]) => re.test(part.trim()))?.[1])
    .filter((c): c is string => !!c);
}
