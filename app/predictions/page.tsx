'use client';

import { useState, useEffect } from 'react';
import { supabase, getSessionUser } from '@/lib/supabase';
import { cachedQuery, invalidateCache } from '@/lib/cache';
import TeamLogo from '@/app/components/TeamLogo';

export default function PredictionsPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userVotes, setUserVotes] = useState<Record<string, string>>({});

  // 💡 [추가됨] 모든 유저의 투표 수를 저장하는 상태
  const [voteCounts, setVoteCounts] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    async function loadPage() {
      // 1. 로그인 유저 확인 (getUser()와 달리 네트워크 요청이 없는 세션 조회)
      const user = await getSessionUser();
      setCurrentUser(user);

      // 2. 예측 대상 경기 목록 (2분 캐시: 페이지를 오가도 다시 요청하지 않음)
      const matchData = await cachedQuery('predictions:matches', 2 * 60 * 1000, async () => {
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const { data } = await supabase
          .from('matches')
          .select('*')
          .gte('match_date', oneDayAgo.toISOString())
          .order('match_date', { ascending: true });
        return data || [];
      });

      setMatches(matchData);

      const matchIds = matchData.map((m: any) => m.id);

      if (matchIds.length > 0) {
        // 3. 투표 현황: 예전엔 predictions 테이블 "전체"를 가져왔지만,
        //    이제 화면에 보이는 경기의 투표만 가져옵니다. (1분 캐시)
        const allVotes = await cachedQuery('predictions:votes', 60 * 1000, async () => {
          const { data } = await supabase
            .from('predictions')
            .select('match_id, predicted_team')
            .in('match_id', matchIds);
          return data || [];
        });

        const counts: Record<string, Record<string, number>> = {};
        allVotes.forEach((v: any) => {
          if (!counts[v.match_id]) counts[v.match_id] = {};
          counts[v.match_id][v.predicted_team] = (counts[v.match_id][v.predicted_team] || 0) + 1;
        });
        setVoteCounts(counts);

        // 4. 내 투표 내역도 해당 경기들로 범위를 좁혀서 조회합니다.
        if (user) {
          const { data: votes } = await supabase
            .from('predictions')
            .select('match_id, predicted_team')
            .eq('user_id', user.id)
            .in('match_id', matchIds);

          if (votes) {
            const voteMap: Record<string, string> = {};
            votes.forEach(v => { voteMap[v.match_id] = v.predicted_team; });
            setUserVotes(voteMap);
          }
        }
      }

      setLoading(false);
    }
    loadPage();
  }, []);

  const handleVote = async (matchId: string, teamName: string) => {
    if (!currentUser) return alert('로그인이 필요합니다. 우측 상단에서 로그인해주세요.');
    if (userVotes[matchId]) return alert('이미 이 경기에 투표하셨습니다.');

    const { error } = await supabase.from('predictions').insert({
      match_id: matchId,
      user_id: currentUser.id,
      predicted_team: teamName
    });

    if (!error) {
      // 💡 방금 투표했으니 투표 현황 캐시를 비워서, 다음 방문 때 최신 집계를 받게 합니다.
      invalidateCache('predictions:votes');
      setUserVotes(prev => ({ ...prev, [matchId]: teamName }));

      // 💡 [추가됨] 내가 투표하자마자 퍼센트 바가 실시간으로 움직이도록 카운트 증가
      setVoteCounts(prev => {
        const matchCounts = prev[matchId] || {};
        return {
          ...prev,
          [matchId]: {
            ...matchCounts,
            [teamName]: (matchCounts[teamName] || 0) + 1
          }
        };
      });

      alert(`[${teamName}] 승리에 투표하셨습니다!`);
    } else {
      alert('투표 실패: ' + error.message);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      {/* 페이지 헤더 (spec §5.3) */}
      <header className="mb-10 border-b border-edge pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
          MASL Fan Predictions
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.1] text-fg md:text-6xl">
          Match Predict
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-fg-mid">
          승리할 팀을 예측하고 팬들의 투표 현황을 확인하세요.
        </p>
      </header>

      {loading ? (
        /* 로딩 스켈레톤 (spec §5.14) — 최종 레이아웃과 같은 블록 */
        <div className="space-y-6">
          <div className="h-96 animate-pulse rounded-xl border border-edge bg-surface" />
          <div className="h-96 animate-pulse rounded-xl border border-edge bg-surface" />
        </div>
      ) : matches.length === 0 ? (
        /* 빈 상태 (spec §5.14) */
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">진행 중인 예측 경기가 없습니다.</p>
          <p className="mt-1 text-sm text-fg-dim">새 경기가 등록되면 이곳에서 투표할 수 있어요.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((match, index) => {
            // 💡 [추가됨] 투표 퍼센트 계산
            const counts = voteCounts[match.id] || {};
            const votesA = counts[match.team_a] || 0;
            const votesB = counts[match.team_b] || 0;
            const totalVotes = votesA + votesB;
            const percentA = totalVotes === 0 ? 50 : Math.round((votesA / totalVotes) * 100);
            const percentB = totalVotes === 0 ? 50 : 100 - percentA;

            const votedTeam = userVotes[match.id];
            const hasVoted = !!votedTeam;

            return (
              <article key={match.id} className="rounded-xl border border-edge bg-surface p-5 md:p-6">
                {/* 메타 행: 종목 배지 + 일시 캡션 */}
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-semibold text-fg-mid">
                    {match.sport_type || 'MASL'}
                  </span>
                  <time className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">
                    {new Date(match.match_date).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })} KST
                  </time>
                </div>

                {/* 두 팀 미디어 스트립 (spec §5.16 프레임 + 스크림) — 글로우/줌 없음 */}
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-edge bg-surface md:aspect-[21/9]">
                  <img
                    src={`/images/match_bg_${(index % 2 + 1)}.png`}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/25 to-transparent" />
                  <div className="relative z-10 grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 md:px-12">
                    <div className="flex h-full min-w-0 items-center justify-center py-6 md:py-8">
                      <TeamLogo name={match.team_a} season={match.season} className="h-full w-full" />
                    </div>
                    <span className="font-display text-lg font-medium uppercase text-fg-dim md:text-xl">VS</span>
                    <div className="flex h-full min-w-0 items-center justify-center py-6 md:py-8">
                      <TeamLogo name={match.team_b} season={match.season} className="h-full w-full" />
                    </div>
                  </div>
                </div>

                {/* 퍼센트 바 (spec §5.12) — 홈 accent / 어웨이 amber */}
                <div className="mt-5">
                  <div className="mb-2 flex items-end justify-between">
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="font-display text-2xl font-medium leading-none tabular-nums text-fg md:text-3xl">{percentA}%</span>
                      <span className="text-xs font-medium text-fg-dim">{votesA}표</span>
                    </div>
                    <span className="pb-1 text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">Fan Forecast</span>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-display text-2xl font-medium leading-none tabular-nums text-fg md:text-3xl">{percentB}%</span>
                      <span className="text-xs font-medium text-fg-dim">{votesB}표</span>
                    </div>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-raised">
                    <div
                      className="h-full bg-accent transition-[width] duration-500 ease-out motion-reduce:transition-none"
                      style={{ width: `${percentA}%` }}
                    />
                    <div
                      className="h-full bg-away transition-[width] duration-500 ease-out motion-reduce:transition-none"
                      style={{ width: `${percentB}%` }}
                    />
                  </div>
                </div>

                {/* 투표 버튼 (spec §5.8 secondary) — 투표한 팀은 accent 보더 + 배지 */}
                <div className="mt-5 grid grid-cols-1 gap-3 border-t border-edge pt-5 sm:grid-cols-2">
                  <button
                    onClick={() => handleVote(match.id, match.team_a)}
                    disabled={hasVoted}
                    className={`inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:pointer-events-none ${
                      votedTeam === match.team_a
                        ? 'border border-accent/30 bg-accent/10 text-fg'
                        : hasVoted
                          ? 'border border-edge bg-transparent text-fg-dim opacity-50'
                          : 'border border-edge-strong bg-transparent text-fg hover:bg-raised active:opacity-90'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="min-w-0 truncate">{match.team_a}</span>
                    {votedTeam === match.team_a && (
                      <span className="inline-flex shrink-0 items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-bright">
                        내 예측
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleVote(match.id, match.team_b)}
                    disabled={hasVoted}
                    className={`inline-flex h-11 w-full min-w-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors disabled:pointer-events-none ${
                      votedTeam === match.team_b
                        ? 'border border-accent/30 bg-accent/10 text-fg'
                        : hasVoted
                          ? 'border border-edge bg-transparent text-fg-dim opacity-50'
                          : 'border border-edge-strong bg-transparent text-fg hover:bg-raised active:opacity-90'
                    }`}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-away" />
                    <span className="min-w-0 truncate">{match.team_b}</span>
                    {votedTeam === match.team_b && (
                      <span className="inline-flex shrink-0 items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-bright">
                        내 예측
                      </span>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
