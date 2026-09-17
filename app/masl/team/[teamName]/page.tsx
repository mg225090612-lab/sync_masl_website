'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // 💡 원본 대신 리사이즈된 이미지를 캐시해서 제공 (Supabase 요청 절감)
import { supabase } from '@/lib/supabase';
import { isPhotoMissing, markPhotoMissing } from '@/lib/cache';
import { fetchPlayersByTeams } from '@/lib/players';
import { fetchSeasons } from '@/lib/seasons';

interface PageProps {
  params: Promise<{ teamName: string }>;
}

// 로스터 그리드 — 스켈레톤과 실제 카드가 같은 레이아웃을 공유합니다.
const rosterGrid = 'grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 lg:grid-cols-6';

export default function TeamPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const teamName = decodeURIComponent(resolvedParams.teamName);

  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 💡 같은 팀 이름이 시즌마다 다른 팀일 수 있고, 같은 시즌에 두 종목에 나갈 수도 있어서
  // "시즌 + 종목" 기준으로 명단을 가져옵니다. 허브에서 넘어오면 URL의 ?season= ?sport= 값을 쓰고,
  // 시즌이 없으면 최신 시즌 기준입니다.
  const [season, setSeason] = useState<string | null>(null);
  const [sport, setSport] = useState<string | null>(null);
  const [seasonReady, setSeasonReady] = useState(false);

  useEffect(() => {
    const qs = new URLSearchParams(window.location.search);
    setSport(qs.get('sport'));
    const sp = qs.get('season');
    if (sp) {
      setSeason(sp);
      setSeasonReady(true);
    } else {
      fetchSeasons()
        .then(list => { setSeason(list[0] || null); setSeasonReady(true); })
        .catch(() => { setSeason(null); setSeasonReady(true); });
    }
  }, []);

  useEffect(() => {
    if (!seasonReady) return;
    const run = async () => {
      const data = await fetchPlayersByTeams([teamName], season, sport);
      setPlayers(
        [...data].sort((a, b) => (a.player_number ?? 0) - (b.player_number ?? 0))
      );
      setLoading(false);
    };
    run();
  }, [teamName, season, sport, seasonReady]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      {/* 💡 BACK 버튼: 클릭 시 바로 직전 페이지로 이동 (spec §5.8 ghost) */}
      <button
        type="button"
        onClick={() => window.history.back()}
        className="mb-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-mid transition-colors hover:bg-surface hover:text-fg"
      >
        <span aria-hidden="true">←</span>
        BACK
      </button>

      {/* 페이지 헤더 (spec §5.3) — 한국어 팀명은 display-ko 타입 (spec §3.2) */}
      <header className="mb-10 border-b border-edge pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
          {['MASL', season, sport].filter(Boolean).join(' · ') || 'MASL Team Roster'}
        </p>
        <h1 className="mt-3 text-3xl font-extrabold leading-[1.25] tracking-[-0.01em] text-fg md:text-5xl">
          {teamName}
        </h1>
      </header>

      {loading ? (
        /* 로딩 — 최종 레이아웃과 같은 모양의 스켈레톤 그리드 (spec §5.14) */
        <div className={rosterGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-edge bg-surface"
            >
              <div className="aspect-[3/4] bg-raised" />
              <div className="p-3">
                <div className="h-4 w-2/3 rounded bg-raised" />
              </div>
            </div>
          ))}
        </div>
      ) : players.length === 0 ? (
        /* 빈 상태 (spec §5.14) */
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">등록된 선수가 없습니다.</p>
        </div>
      ) : (
        /* 로스터 그리드 */
        <div className={rosterGrid}>
          {players.map((p) => (
            <PlayerCard key={p.id} p={p} teamName={teamName} />
          ))}
        </div>
      )}
    </div>
  );
}

// PlayerCard — 클릭 가능한 카드 (spec §5.5), 사진은 3:4 상단 고정
function PlayerCard({ p, teamName }: { p: any; teamName: string }) {
  // 💡 사진이 없다고 이미 확인된 선수는 처음부터 요청을 보내지 않습니다.
  const [imgError, setImgError] = useState(() => isPhotoMissing(p.id));
  const { data } = supabase.storage.from('player-photos').getPublicUrl(`${p.id}.png`);
  const imageUrl = data.publicUrl;

  return (
    <Link
      href={`/masl/team/${encodeURIComponent(teamName)}/${p.id}`}
      className="block overflow-hidden rounded-xl border border-edge bg-surface transition-colors hover:border-edge-strong hover:bg-raised"
    >
      <div className="relative aspect-[3/4] bg-raised">
        {!imgError ? (
          <Image
            src={imageUrl}
            alt={p.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 200px"
            className="object-cover"
            onError={() => {
              markPhotoMissing(p.id);
              setImgError(true);
            }}
          />
        ) : (
          /* 사진 없음 → 등번호 폴백 */
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-5xl font-medium tabular-nums text-fg-dim">
              {p.player_number}
            </span>
          </div>
        )}
      </div>

      {/* 이름 + 등번호 */}
      <div className="flex items-center gap-2 p-3">
        <span className="shrink-0 font-display text-sm font-medium tabular-nums text-fg-dim">
          {p.player_number}
        </span>
        <p className="min-w-0 truncate text-sm font-semibold text-fg">{p.name}</p>
      </div>
    </Link>
  );
}
