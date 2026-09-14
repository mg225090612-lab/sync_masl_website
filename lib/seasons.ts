// lib/seasons.ts
// 💡 시즌 목록 (최신 경기 순). 네비 드롭다운과 /masl 자동 이동이 함께 씁니다.
// 10분 캐시 — admin에서 경기를 저장하면 캐시가 비워져 즉시 갱신됩니다.
import { supabase } from './supabase';
import { cachedQuery } from './cache';

export async function fetchSeasons(): Promise<string[]> {
  return cachedQuery('nav:seasons', 10 * 60 * 1000, async () => {
    const { data } = await supabase
      .from('matches')
      .select('season, match_date')
      .order('match_date', { ascending: false });
    const seen: string[] = [];
    (data || []).forEach(m => {
      if (m.season && !seen.includes(m.season)) seen.push(m.season);
    });
    return seen;
  });
}
