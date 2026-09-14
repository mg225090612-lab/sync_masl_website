'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image'; // 💡 원본 대신 리사이즈된 이미지를 캐시해서 제공 (Supabase 요청 절감)
import { supabase } from '@/lib/supabase';
import { cachedQuery, isPhotoMissing, markPhotoMissing } from '@/lib/cache';

interface PlayerPageProps {
  params: Promise<{ teamName: string; playerId: string }>;
}

export default function PlayerDetailPage({ params }: PlayerPageProps) {
  const resolvedParams = use(params);
  const teamName = decodeURIComponent(resolvedParams.teamName);
  const playerId = resolvedParams.playerId;

  const [player, setPlayer] = useState<any>(null);
  // 💡 사진이 없다고 이미 확인된 선수는 처음부터 요청을 보내지 않습니다.
  const [imgError, setImgError] = useState(() => isPhotoMissing(playerId));

  useEffect(() => {
    const fetch = async () => {
      // 💡 10분 동안 캐시: 같은 선수를 다시 열어도 DB에 요청하지 않습니다.
      const data = await cachedQuery(`player:${playerId}`, 10 * 60 * 1000, async () => {
        const { data } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();
        return data;
      });

      if (data) setPlayer(data);
    };

    fetch();
  }, [playerId]);

  if (!player) {
    // 스켈레톤 로딩 — 최종 레이아웃과 동일한 블록 구조 (spec §5.14)
    return (
      <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
        <div className="mb-6 h-10 w-36 animate-pulse rounded-lg bg-surface" />
        <div className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <div className="aspect-[3/4] w-full animate-pulse rounded-2xl border border-edge bg-surface" />
          </div>
          <div className="space-y-4 md:col-span-7">
            <div className="h-4 w-32 animate-pulse rounded-full bg-surface" />
            <div className="h-12 w-3/4 animate-pulse rounded-xl bg-surface" />
            <div className="h-16 w-40 animate-pulse rounded-xl bg-surface" />
            <div className="h-[72px] w-full max-w-md animate-pulse rounded-xl border border-edge bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  // 💡 무조건 스토리지의 .png 파일을 불러오도록 설정
  const { data: imgData } = supabase.storage.from('player-photos').getPublicUrl(`${player.id}.png`);
  const imageUrl = imgData.publicUrl;

  return (
    // 페이지 셸 (spec §1.1) — 배경/네비 여백은 전역 레이아웃이 담당합니다.
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      {/* 💡 Link 태그 대신 순정 뒤로가기 사용. 히스토리가 꼬이지 않아 팀 페이지에서 무한 루프에 안 빠집니다! */}
      <button
        onClick={() => window.history.back()}
        className="mb-6 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-mid transition-colors hover:bg-surface hover:text-fg"
      >
        ← Back to Team
      </button>

      <div className="grid items-center gap-8 md:grid-cols-12 md:gap-12">
        {/* 📸 LEFT: PHOTO CARD */}
        <div className="md:col-span-5">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-edge bg-surface">
            {!imgError ? (
              <>
                <Image
                  src={imageUrl}
                  alt={player.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 480px"
                  className="object-cover"
                  onError={() => {
                    markPhotoMissing(playerId);
                    setImgError(true);
                  }}
                />
                {/* 미디어 스크림 — 사진 위 유일하게 허용된 그라데이션 (spec §5.16) */}
                <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/25 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-raised">
                <span className="font-display text-8xl font-medium leading-none tabular-nums text-edge-strong">
                  {player.player_number}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 📝 RIGHT: PLAYER INFO */}
        <div className="flex flex-col justify-center md:col-span-7">
          {/* 팀 이름 키커 — 한국어라 uppercase/tracking 없음 (spec §5.13 kicker) */}
          <p className="text-xs font-semibold text-accent-bright">{player.team_name}</p>

          {/* 선수 이름 — display-ko 스케일 (spec §3.2) */}
          <h1 className="mt-3 text-3xl font-extrabold leading-[1.25] tracking-[-0.01em] text-fg md:text-5xl">
            {player.name}
          </h1>

          {/* 등번호 — stat-number 레시피, 앤티크롭 패딩 없음 */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">NO.</span>
            <span className="font-display text-6xl font-medium leading-none tabular-nums text-fg md:text-7xl">
              {player.player_number}
            </span>
          </div>

          <div className="mt-8 h-px w-full max-w-md bg-edge" />

          {/* 카테고리 / 상태 — caption + badge 행 (spec §5.11) */}
          <dl className="mt-6 grid max-w-md grid-cols-2 gap-6">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">
                CATEGORY
              </dt>
              <dd className="mt-2 text-base font-semibold leading-[1.4] text-fg md:text-lg">
                {player.category || 'PLAYER'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">
                STATUS
              </dt>
              <dd className="mt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-bright">
                  ACTIVE
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
