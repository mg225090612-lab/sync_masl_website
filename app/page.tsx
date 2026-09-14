'use client';

import { useState } from 'react';
import Link from 'next/link';
import TeamLogo from '@/app/components/TeamLogo';

export default function HomePage() {
  const [currentIdx, setCurrentIdx] = useState(0);

  const matches = [
    {
      id: 1,
      bg: "/images/match_bg_2.png",
      teamA: "빵빵이의 축구교실",
      teamB: "김영준에게 축구를 배우다",
      date: "APRIL 02 / 19:30 KST"
    },
    {
      id: 2,
      bg: "/images/match_bg_1.png",
      teamA: "옥지의 축구교실",
      teamB: "바르셨노라",
      date: "APRIL 02 / 19:00 KST"
    }
  ];

  const nextSlide = () => setCurrentIdx((prev) => (prev + 1) % matches.length);
  const prevSlide = () => setCurrentIdx((prev) => (prev - 1 + matches.length) % matches.length);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">

      {/* 페이지 헤더 (spec §5.3) */}
      <header className="mb-10 border-b border-edge pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
          MASL Live Event
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.1] text-fg md:text-6xl">
          Upcoming Matches
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-fg-mid">
          이번 주 예정된 경기를 확인하세요. 팀 로고를 누르면 팀 페이지로 이동합니다.
        </p>
      </header>

      {/* 경기 슬라이더 — 히어로 미디어 프레임 (spec §5.16) */}
      <section aria-label="예정된 경기 슬라이더">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-edge bg-surface md:aspect-[21/9]">
          {matches.map((match, idx) => (
            <div
              key={match.id}
              className={`absolute inset-0 h-full w-full transition-opacity duration-500 motion-reduce:transition-none ${
                idx === currentIdx
                  ? 'z-10 opacity-100 pointer-events-auto'
                  : 'z-0 opacity-0 pointer-events-none'
              }`}
              aria-hidden={idx !== currentIdx}
            >
              {/* 배경 이미지 */}
              <img
                src={match.bg}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-60"
              />

              {/* 가독성 스크림 — 미디어 위에 허용된 유일한 그라디언트 (spec §5.16) */}
              <div className="absolute inset-0 bg-gradient-to-t from-canvas/90 via-canvas/25 to-transparent" />

              {/* 팀 로고 — 클릭 시 팀 페이지로 이동 */}
              <div className="relative z-10 flex h-full items-center justify-center gap-4 px-6 pb-10 md:gap-8 md:px-12">
                <Link
                  href={`/masl/team/${encodeURIComponent(match.teamA)}`}
                  tabIndex={idx === currentIdx ? 0 : -1}
                  className="flex h-3/4 w-1/2 items-center justify-center transition-opacity hover:opacity-80"
                >
                  <TeamLogo name={match.teamA} className="h-full w-full" />
                </Link>
                <span className="shrink-0 font-display text-xl font-medium uppercase text-fg-dim md:text-2xl">
                  VS
                </span>
                <Link
                  href={`/masl/team/${encodeURIComponent(match.teamB)}`}
                  tabIndex={idx === currentIdx ? 0 : -1}
                  className="flex h-3/4 w-1/2 items-center justify-center transition-opacity hover:opacity-80"
                >
                  <TeamLogo name={match.teamB} className="h-full w-full" />
                </Link>
              </div>

              {/* 메타 바 — 날짜(좌) / 상태(우) */}
              <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between p-5 md:p-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-fg-mid">
                  {match.date}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
                  Upcoming
                </span>
              </div>
            </div>
          ))}

          {/* 화살표 — 프레임 안쪽 (spec §5.16) */}
          <button
            onClick={prevSlide}
            aria-label="이전 경기"
            className="absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-edge bg-canvas/70 text-fg backdrop-blur transition-colors hover:bg-raised"
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            onClick={nextSlide}
            aria-label="다음 경기"
            className="absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-edge bg-canvas/70 text-fg backdrop-blur transition-colors hover:bg-raised"
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>

        {/* 하단 도트 */}
        <div className="mt-4 flex justify-center gap-2">
          {matches.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              aria-label={`${idx + 1}번째 경기 보기`}
              aria-current={idx === currentIdx}
              className={
                idx === currentIdx
                  ? 'h-1.5 w-6 rounded-full bg-accent'
                  : 'h-1.5 w-1.5 rounded-full bg-edge-strong transition-colors hover:bg-fg-dim'
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
