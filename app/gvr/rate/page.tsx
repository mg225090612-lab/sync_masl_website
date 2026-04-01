'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function GvrRatePage() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
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

  const navMenus = [
    { title: 'MASL', path: '/', sub: [{ name: '26 Spring Hub', path: '/masl/26s' }] },
    { title: 'GVR', path: '/gvr/rate', sub: [{ name: 'Rate Players', path: '/gvr/rate' }, { name: 'View Results', path: '/gvr/view' }] },
    { title: 'Champions', path: '/champions', sub: [{ name: 'Tournament Bracket', path: '/champions/bracket' }] },
  ];

  // 0. 사용자 확인
  useEffect(() => {
    async function fetchUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrentUser(user);
    }
    fetchUser();
  }, []);

  // 1. 최근 2일 경기 로드
  useEffect(() => {
    async function loadMatches() {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .gte('match_date', twoDaysAgo.toISOString())
        .order('match_date', { ascending: false });

      if (!error && data && data.length > 0) {
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

    const { data: playerData, error: playerError } = await supabase
      .from('players')
      .select('*')
      .or(`team_name.eq."${activeMatch.team_a}",team_name.eq."${activeMatch.team_b}"`);

    const { data: allRatings, error: ratingError } = await supabase
      .from('ratings')
      .select('player_id, score, match_id')
      .eq('match_id', activeMatch.id);

    if (playerError || ratingError) {
      console.error(playerError || ratingError);
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
      if (myRating) {
        const { error } = await supabase
          .from('ratings')
          .update({ score: rating })
          .eq('id', myRating.id);

        if (error) {
          alert('수정 실패: ' + error.message);
          return;
        }

        alert('평점이 수정되었습니다.');
      } else {
        const { error } = await supabase.from('ratings').insert({
          match_id: activeMatch.id,
          player_id: selectedPlayer.id,
          student_id: currentUser.id,
          user_email: currentUser.email, // 💡 새로 추가한 컬럼에 이메일 꽂아주기!
          score: rating,
        });

        if (error) {
          alert('제출 실패: ' + error.message);
          return;
        }

        alert('평점이 등록되었습니다.');
      }

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
      await loadPlayersWithRatings();
      closeModal();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06101f] pt-48 text-center text-cyan-300 font-black animate-pulse uppercase">
        Syncing Database...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#06101f] px-6 pb-20 pt-48 text-white font-sans overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#06101f]/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 flex h-20 items-center justify-start gap-12 text-[11px] font-black uppercase tracking-widest">
          {navMenus.map((menu) => (
            <div
              key={menu.title}
              className="relative group py-7"
              onMouseEnter={() => setActiveMenu(menu.title)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className={`transition-all ${activeMenu === menu.title ? 'text-cyan-400' : 'text-white/40'}`}>
                {menu.title}
              </button>
              <div
                className={`absolute left-0 top-[80%] w-48 rounded-2xl border border-white/10 bg-[#0b1730]/95 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
                  activeMenu === menu.title
                    ? 'visible opacity-100 translate-y-2'
                    : 'invisible opacity-0 translate-y-0'
                }`}
              >
                {menu.sub.map((s) => (
                  <Link
                    key={s.name}
                    href={s.path}
                    className="block rounded-xl px-4 py-3 text-white/60 hover:text-cyan-300 hover:bg-white/5"
                  >
                    {s.name}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl relative z-10">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter mb-16 leading-none">
          Rate <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">Players</span>
        </h1>

        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10 mb-10 border-b border-white/5">
          {matches.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setActiveMatch(m);
                closeModal();
              }}
              className={`flex flex-col rounded-[2.5rem] border px-10 py-6 min-w-[300px] transition-all text-left ${
                activeMatch?.id === m.id
                  ? 'border-cyan-400 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]'
                  : 'border-white/5 bg-white/5 opacity-40 hover:opacity-100 hover:bg-white/10'
              }`}
            >
              <span className="text-[10px] font-black text-cyan-400/60 mb-2 uppercase tracking-widest italic">
                {m.sport_type}
              </span>
              <span className="font-black italic text-xl uppercase tracking-tighter mb-1 leading-tight">
                {m.team_a} <br />
                vs {m.team_b}
              </span>
            </button>
          ))}

          {matches.length === 0 && (
            <div className="flex items-center justify-center w-full py-6 text-white/30 font-black italic text-sm tracking-widest uppercase">
              최근 2일 이내에 진행된 경기가 없습니다.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {activeMatch && (
            <>
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
            </>
          )}
        </div>
      </div>

      {selectedPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md shadow-inner" onClick={closeModal}></div>

          <div className="relative w-full max-w-xl rounded-[45px] border border-white/10 bg-[#0b1730] p-10 md:p-14 shadow-[0_0_120px_rgba(0,0,0,0.9)] animate-in zoom-in-95 duration-200">
            <button
              onClick={closeModal}
              className="absolute top-10 right-10 text-2xl text-white/20 hover:text-white transition-colors"
            >
              ✕
            </button>

            <p className="text-cyan-400 font-black tracking-[0.3em] uppercase mb-4 italic text-sm text-center">
              {selectedPlayer.team_name}
            </p>

            <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-12 text-center leading-none">
              NO.{selectedPlayer.player_number} {selectedPlayer.name}
            </h2>

            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-center">
                  Authenticated User
                </p>
                <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-black text-center text-cyan-300/80">
                  {currentUser ? currentUser.email : 'Login Required'}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] text-center">
                  Rating Score
                </p>

                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {[7, 7.5, 8, 8.5, 9, 9.5, 10].map((v) => (
                    <button
                      key={v}
                      onClick={() => setRating(v)}
                      disabled={checkingMyRating || submitting}
                      className={`py-4 rounded-xl border font-black italic text-sm transition-all ${
                        rating === v
                          ? 'border-cyan-400 bg-cyan-400 text-black shadow-lg shadow-cyan-400/40'
                          : 'border-white/10 bg-white/5 text-white/30 hover:border-white/30'
                      }`}
                    >
                      {v.toFixed(1)}
                    </button>
                  ))}
                </div>
              </div>

              {myRating && (
                <div className="rounded-2xl border border-lime-400/20 bg-lime-400/10 px-5 py-4 text-center">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-lime-300/80 mb-1">
                    Your Current Rating
                  </p>
                  <p className="text-2xl font-black italic text-lime-300">
                    {Number(myRating.score).toFixed(1)}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || checkingMyRating}
                  className="w-full py-7 rounded-[2.2rem] bg-gradient-to-r from-cyan-300 to-lime-300 text-black font-black italic uppercase text-xl tracking-[0.1em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:hover:scale-100"
                >
                  {submitting
                    ? 'Processing...'
                    : myRating
                    ? 'Update Rating'
                    : 'Submit Rating'}
                </button>

                {myRating && (
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="w-full py-5 rounded-[1.6rem] border border-red-400/30 bg-red-500/10 text-red-300 font-black italic uppercase tracking-[0.1em] hover:bg-red-500/20 transition-all disabled:opacity-60"
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
    <div className={isAway ? 'text-right' : 'text-left'}>
      <h3 className={`mb-12 text-4xl font-black italic uppercase tracking-tighter ${isAway ? 'text-lime-400' : 'text-cyan-300'}`}>
        {title}
      </h3>
      <div className="grid gap-6">
        {players.map((p: any) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className={`flex items-center justify-between gap-6 p-8 rounded-[3.5rem] border border-white/5 bg-white/[0.03] transition-all hover:bg-white/[0.07] hover:border-white/10 group ${
              isAway ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={`flex items-center gap-8 ${isAway ? 'flex-row-reverse' : ''}`}>
              <div className="h-20 w-20 rounded-[1.8rem] bg-black/40 flex items-center justify-center font-black italic text-3xl text-cyan-400 group-hover:text-white transition-colors">
                {p.player_number}
              </div>
              <p className="font-black italic text-3xl uppercase tracking-tighter">{p.name}</p>
            </div>
            <div className="flex flex-col items-center px-6 min-w-[120px]">
              <span className="text-[10px] font-black text-white/20 uppercase mb-1">AVG</span>
              <span className="text-2xl font-black italic text-yellow-400">⭐ {p.avgRating}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}