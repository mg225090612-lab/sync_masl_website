'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, getSessionUser } from '@/lib/supabase';
import { cachedQuery, invalidateCache } from '@/lib/cache';
import { fetchPlayersByTeams } from '@/lib/players';

// 페이지 헤더 (spec §5.3) — 로딩/완료 상태에서 공유
function PageHeader() {
  return (
    <header className="mb-10 border-b border-edge pb-8">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
        GVR · Player Ratings
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.1] text-fg md:text-6xl">
        Rate Players
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-fg-mid">
        최근 2일 이내에 진행된 경기를 선택하고, 선수들의 활약에 평점을 남겨 보세요.
      </p>
    </header>
  );
}

export default function GvrRatePage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatch, setActiveMatch] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [rating, setRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 로그인 유저
  const [currentUser, setCurrentUser] = useState<any>(null);

  // 현재 유저가 선택한 선수에게 이미 준 rating row
  const [myRating, setMyRating] = useState<any>(null);
  const [checkingMyRating, setCheckingMyRating] = useState(false);

  // 0. 사용자 확인
  useEffect(() => {
    // 💡 getUser()는 매번 서버 요청을 보내므로, 네트워크 요청 없는 세션 조회로 교체했습니다.
    getSessionUser().then(setCurrentUser);
  }, []);

  // 1. 최근 2일 경기 로드
  useEffect(() => {
    async function loadMatches() {
      // 💡 2분 동안 캐시: 페이지를 오갈 때마다 경기 목록을 다시 요청하지 않습니다.
      const data = await cachedQuery('gvr:recent-matches', 2 * 60 * 1000, async () => {
        const now = new Date();
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        // 💡 "이미 시작했고(현재 이전) 최근 2일 이내인" 경기만 — 미래 경기는 평점 대상이 아닙니다.
        const { data, error } = await supabase
          .from('matches')
          .select('*')
          .gte('match_date', twoDaysAgo.toISOString())
          .lte('match_date', now.toISOString())
          .order('match_date', { ascending: false });

        if (error) throw error;
        return data || [];
      }).catch(() => [] as any[]);

      if (data.length > 0) {
        setMatches(data);
        setActiveMatch(data[0]);
      } else {
        setMatches([]);
        setActiveMatch(null);
      }

      setLoading(false);
    }

    loadMatches();
  }, []);

  // 2. 선수 + 평균 평점 로드
  const loadPlayersWithRatings = useCallback(async () => {
    if (!activeMatch) return;

    // 💡 선수 명단은 자주 안 바뀌므로 10분 캐시 (View 페이지와 캐시를 공유합니다)
    // 평점은 1분 캐시 + 내가 등록/수정하면 즉시 캐시를 비우고 새로 받습니다.
    let playerData: any[] | null = null;
    let allRatings: any[] | null = null;

    try {
      [playerData, allRatings] = await Promise.all([
        fetchPlayersByTeams([activeMatch.team_a, activeMatch.team_b], activeMatch.season),
        cachedQuery(`ratings:${activeMatch.id}`, 60 * 1000, async () => {
          const { data, error } = await supabase
            .from('ratings')
            .select('player_id, score, match_id')
            .eq('match_id', activeMatch.id);
          if (error) throw error;
          return data || [];
        }),
      ]);
    } catch (e) {
      console.error(e);
      return;
    }

    if (playerData) {
      const playersWithAvg = playerData.map((player) => {
        const playerRatings =
          allRatings?.filter((r) => r.player_id === player.id && r.match_id === activeMatch.id) || [];

        const avg =
          playerRatings.length > 0
            ? (playerRatings.reduce((acc, cur) => acc + Number(cur.score), 0) / playerRatings.length).toFixed(1)
            : '0.0';

        return { ...player, avgRating: avg };
      });

      setPlayers(playersWithAvg);
    }
  }, [activeMatch]);

  useEffect(() => {
    loadPlayersWithRatings();
  }, [loadPlayersWithRatings]);

  // 3. 선택한 선수에 대한 내 rating 조회
  useEffect(() => {
    async function fetchMyRating() {
      if (!selectedPlayer || !currentUser || !activeMatch) {
        setMyRating(null);
        setRating(null);
        return;
      }

      setCheckingMyRating(true);

      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('match_id', activeMatch.id)
        .eq('player_id', selectedPlayer.id)
        .eq('student_id', currentUser.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setMyRating(null);
        setRating(null);
      } else {
        setMyRating(data || null);
        setRating(data?.score ?? null);
      }

      setCheckingMyRating(false);
    }

    fetchMyRating();
  }, [selectedPlayer, currentUser, activeMatch]);

  const closeModal = () => {
    setSelectedPlayer(null);
    setMyRating(null);
    setRating(null);
  };

  // 4. 등록 또는 수정
  const handleSubmit = async () => {
    if (!currentUser) {
      alert('로그인이 필요한 서비스입니다.');
      return;
    }

    if (!selectedPlayer || rating === null) {
      alert('평점을 선택해주세요.');
      return;
    }

    if (!activeMatch) {
      alert('경기 정보가 없습니다.');
      return;
    }

    setSubmitting(true);

    try {
      // 🔥 1. 구글 이메일을 영혼까지 끌어모아서 확실하게 뽑아냅니다.
      const userEmail = currentUser.email || currentUser.user_metadata?.email || '이메일없음';

      if (myRating) {
        // 🔥 2. "수정"할 때도 이메일을 무조건 덮어씌워줍니다! (이게 빠져있었음)
        const { error } = await supabase
          .from('ratings')
          .update({
            score: rating,
            user_email: userEmail
          })
          .eq('id', myRating.id);

        if (error) {
          alert('수정 실패: ' + error.message);
          return;
        }

        alert('평점이 수정되었습니다.');
      } else {
        // "새로 등록"할 때
        const { error } = await supabase.from('ratings').insert({
          match_id: activeMatch.id,
          player_id: selectedPlayer.id,
          student_id: currentUser.id,
          user_email: userEmail, // 🔥 추출한 이메일 넣기
          score: rating,
        });

        if (error) {
          alert('제출 실패: ' + error.message);
          return;
        }

        alert('평점이 등록되었습니다.');
      }

      // 💡 방금 등록/수정했으니 이 경기의 평점 캐시를 비우고 최신 데이터를 받아옵니다.
      invalidateCache(`ratings:${activeMatch.id}`);
      await loadPlayersWithRatings();

      // 저장 후 최신 내 평점 다시 조회
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('match_id', activeMatch.id)
        .eq('player_id', selectedPlayer.id)
        .eq('student_id', currentUser.id)
        .maybeSingle();

      setMyRating(data || null);
    } finally {
      setSubmitting(false);
    }
  };

  // 5. 평점 취소
  const handleDelete = async () => {
    if (!myRating) return;

    const ok = window.confirm('이 평점을 취소하시겠습니까?');
    if (!ok) return;

    setSubmitting(true);

    try {
      const { error } = await supabase.from('ratings').delete().eq('id', myRating.id);

      if (error) {
        alert('취소 실패: ' + error.message);
        return;
      }

      alert('평점이 취소되었습니다.');
      setMyRating(null);
      setRating(null);
      // 💡 방금 삭제했으니 이 경기의 평점 캐시를 비우고 최신 데이터를 받아옵니다.
      if (activeMatch) invalidateCache(`ratings:${activeMatch.id}`);
      await loadPlayersWithRatings();
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  // 로딩: 최종 레이아웃과 같은 모양의 스켈레톤 (spec §5.14)
  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
        <PageHeader />
        <div className="no-scrollbar mb-12 flex gap-3 overflow-x-auto pb-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[88px] w-64 shrink-0 animate-pulse rounded-xl border border-edge bg-surface" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {[0, 1].map((col) => (
            <div key={col} className="grid gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[72px] animate-pulse rounded-xl border border-edge bg-surface" />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      <PageHeader />

      {/* 경기 선택 — 가로 스트립 카드 (spec §5.5, 활성 = featured 보더) */}
      {matches.length > 0 ? (
        <div className="no-scrollbar mb-12 flex gap-3 overflow-x-auto pb-1">
          {matches.map((m) => {
            const isActive = activeMatch?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMatch(m);
                  closeModal();
                }}
                className={`flex w-60 shrink-0 flex-col items-start gap-1 rounded-xl border px-4 py-3 text-left transition-colors ${
                  isActive
                    ? 'border-accent/30 bg-accent/10'
                    : 'border-edge bg-surface hover:border-edge-strong hover:bg-raised'
                }`}
              >
                <span
                  className={
                    isActive
                      ? 'text-xs font-semibold text-accent-bright'
                      : 'text-xs font-medium text-fg-dim'
                  }
                >
                  {m.sport_type}
                </span>
                <span
                  className={`w-full truncate text-sm font-semibold ${
                    isActive ? 'text-fg' : 'text-fg-mid'
                  }`}
                >
                  {m.team_a} <span className="font-medium text-fg-dim">vs</span> {m.team_b}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        // 경기 없음 — 빈 상태 (spec §5.14)
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">최근 2일 이내에 진행된 경기가 없습니다.</p>
          <p className="mt-1 text-sm text-fg-dim">경기가 끝난 뒤 이틀 동안 평점을 남길 수 있어요.</p>
        </div>
      )}

      {/* 두 팀 로스터 */}
      {activeMatch && (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <TeamList
            title={activeMatch.team_a}
            players={players.filter((p) => p.team_name === activeMatch.team_a)}
            onSelect={setSelectedPlayer}
          />
          <TeamList
            title={activeMatch.team_b}
            players={players.filter((p) => p.team_name === activeMatch.team_b)}
            onSelect={setSelectedPlayer}
            isAway
          />
        </div>
      )}

      {/* 평점 모달 (spec §5.13) */}
      {selectedPlayer && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="overlay-pop relative w-full max-w-lg rounded-2xl border border-edge bg-raised p-6 shadow-xl shadow-black/50 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              aria-label="닫기"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-surface hover:text-fg"
            >
              ✕
            </button>

            {/* 팀 이름은 한국어 → uppercase/tracking 없음 */}
            <p className="text-xs font-semibold text-accent-bright">{selectedPlayer.team_name}</p>

            <h2 className="mt-2 text-2xl font-bold leading-[1.3] tracking-[-0.01em] text-fg md:text-3xl">
              NO.{selectedPlayer.player_number} {selectedPlayer.name}
            </h2>

            <div className="mt-6 space-y-6">
              {/* 읽기 전용 이메일 필드 (spec §5.10) */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">
                  Authenticated User
                </p>
                <div className="w-full rounded-lg border border-edge bg-canvas px-4 py-3 text-center text-sm font-medium text-fg-mid">
                  {currentUser ? currentUser.email : 'Login Required'}
                </div>
              </div>

              {/* 평점 그리드 (spec §5.13) */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">
                  Rating Score
                </p>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => (
                    <button
                      key={v}
                      onClick={() => setRating(v)}
                      disabled={checkingMyRating || submitting}
                      className={
                        rating === v
                          ? 'h-12 rounded-lg bg-accent text-sm font-semibold tabular-nums text-canvas'
                          : 'h-12 rounded-lg border border-edge bg-surface text-sm font-semibold tabular-nums text-fg-mid transition-colors hover:border-edge-strong hover:text-fg'
                      }
                    >
                      {v.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {myRating && (
                <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
                    Your Current Rating
                  </p>
                  <p className="font-display text-xl font-medium leading-none tabular-nums text-fg">
                    {Number(myRating.score).toFixed(1)}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {/* 제출 — 프라이머리 버튼 (spec §5.7) */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || checkingMyRating}
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-canvas transition-colors hover:bg-accent-bright active:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {submitting
                    ? 'Processing...'
                    : myRating
                    ? 'Update Rating'
                    : 'Submit Rating'}
                </button>

                {/* 취소 — 데인저 버튼 (spec §5.8) */}
                {myRating && (
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-5 text-sm font-semibold text-danger transition-colors hover:bg-danger/20 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Cancel Rating
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamList({ title, players, onSelect, isAway = false }: any) {
  return (
    <section>
      {/* 팀 헤더 — 섹션 타이틀 (spec §5.4); 어웨이 팀은 틱 바에만 어웨이 색 */}
      <div className="mb-6 flex items-center gap-3">
        <span className={`h-4 w-1 shrink-0 rounded-full ${isAway ? 'bg-away' : 'bg-accent'}`} />
        <h2 className="min-w-0 truncate text-xl font-bold leading-[1.3] tracking-[-0.01em] text-fg md:text-2xl">
          {title}
        </h2>
        <span className="shrink-0 text-sm font-medium tabular-nums text-fg-dim">{players.length}</span>
      </div>

      {/* 선수 행 (spec §5.6) */}
      <div className="grid gap-3">
        {players.map((p: any) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex w-full items-center justify-between gap-4 rounded-xl border border-edge bg-surface px-4 py-3.5 text-left transition-colors hover:border-edge-strong hover:bg-raised"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-raised font-display text-base font-medium tabular-nums text-fg-mid">
                {p.player_number}
              </span>
              <span className="truncate text-[15px] font-semibold text-fg">{p.name}</span>
            </div>
            <div className="flex shrink-0 items-baseline gap-1.5">
              <span className="font-display text-xl font-medium tabular-nums text-fg">{p.avgRating}</span>
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">AVG</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
