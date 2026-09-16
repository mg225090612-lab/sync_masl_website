// lib/players.ts
// 💡 팀 이름으로 선수 명단을 가져오는 공용 함수.
// 같은 팀 이름이 시즌마다 다른 팀일 수 있으므로, 시즌을 알면 그 시즌 소속 선수만 가져옵니다.
// (players.season 컬럼이 아직 없는 구버전 DB에서는 자동으로 이름 기준 조회로 폴백합니다)
import { supabase } from './supabase';
import { cachedQuery } from './cache';

export async function fetchPlayersByTeams(
  teamNames: string[],
  season?: string | null
): Promise<any[]> {
  const key = `players:teams:${season || 'all'}:${teamNames.join('|')}`;
  return cachedQuery(key, 10 * 60 * 1000, async () => {
    if (season) {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .in('team_name', teamNames)
        .eq('season', season);
      // 컬럼이 없어서 에러가 나는 경우에만 폴백. (선수가 0명인 건 "아직 등록 전"이므로 그대로 보여줍니다)
      if (!error) return data || [];
    }
    const { data } = await supabase.from('players').select('*').in('team_name', teamNames);
    return data || [];
  });
}
