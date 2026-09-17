// lib/players.ts
// 💡 팀 이름으로 선수 명단을 가져오는 공용 함수.
// 같은 팀 이름이 시즌마다 다른 팀일 수 있고(학년 교체), 같은 시즌에 같은 이름으로
// 두 종목에 출전할 수도 있으므로, 시즌·종목을 알면 그 범위의 선수만 가져옵니다.
// (players.season 컬럼이 없는 구버전 DB에서는 자동으로 한 단계씩 폴백합니다)
import { supabase } from './supabase';
import { cachedQuery } from './cache';

export async function fetchPlayersByTeams(
  teamNames: string[],
  season?: string | null,
  category?: string | null
): Promise<any[]> {
  const key = `players:teams:${season || 'all'}:${category || 'all'}:${teamNames.join('|')}`;
  return cachedQuery(key, 10 * 60 * 1000, async () => {
    if (season || category) {
      let q = supabase.from('players').select('*').in('team_name', teamNames);
      if (season) q = q.eq('season', season);
      if (category) q = q.eq('category', category);
      const { data, error } = await q;
      if (!error) return data || [];

      // season 컬럼이 아직 없는 DB → 종목만으로 재시도
      if (category) {
        const { data: d2, error: e2 } = await supabase
          .from('players')
          .select('*')
          .in('team_name', teamNames)
          .eq('category', category);
        if (!e2) return d2 || [];
      }
    }
    const { data } = await supabase.from('players').select('*').in('team_name', teamNames);
    return data || [];
  });
}
