'use client';

import { useState } from 'react';
import type { ChampionItem, ChampionRecord } from '@/lib/types';

export default function ChampionsPage() {
  const sportsTabs = ['남자축구', '여자축구', '남자농구', '여자배구'];
  const [activeTab, setActiveTab] = useState<string>('남자축구');
  const [selectedWinner, setSelectedWinner] = useState<ChampionRecord | null>(null);

  // 📝 챔피언 데이터 (최신 시즌이 위로 오도록 순서 변경)
  const hallOfFame: ChampionItem[] = [
    {
      sport: '남자축구',
      emoji: '⚽',
      history: [
        { season: '26 Spring', winner: '김영준에게 축구를 배우다', class: 'Class of 2027', photo: '' }, // 💡 26 Spring 추가
        { season: '25 Fall', winner: '빵빵이의 축구교실', class: 'Class of 2028', photo: '/champions/남자축구 25F.JPG' },
      ],
    },
    {
      sport: '여자축구',
      emoji: '⚽',
      history: [
        { season: '26 Spring', winner: '옥지의 축구교실', class: 'Class of 2028', photo: '' }, // 💡 26 Spring 추가
        { season: '25 Fall', winner: '옥지의 축구교실', class: 'Class of 2028', photo: '/champions/여자축구 25F.JPG' },
      ],
    },
    {
      sport: '남자농구',
      emoji: '🏀',
      history: [
        { season: '26 Spring', winner: '빵빵이의 농구교실', class: 'Class of 2028', photo: '' },
        { season: '25 Fall', winner: '머리 큰 조던', class: 'Class of 2026', photo: '/champions/남자농구 25F.JPG' },
      ],
    },
    {
      sport: '여자배구',
      emoji: '🏐',
      history: [
        { season: '26 Spring', winner: '어~시니어야~', class: 'Class of 2027', photo: '' },
        { season: '25 Fall', winner: '개천에서 용 난다', class: '연합팀', photo: '/champions/여자배구 25F.JPG' },
      ],
    },
  ];

  const filteredData = hallOfFame.filter((item) => item.sport === activeTab);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      {/* 페이지 헤더 (spec §5.3) */}
      <header className="mb-10 border-b border-edge pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
          MASL Hall of Fame
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.1] text-fg md:text-6xl">
          Champions
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-fg-mid">
          Official archive of MASL champions. Exploring the future legacy of sports.
        </p>
      </header>

      {/* 종목 탭 (spec §5.9) */}
      <div className="mb-8 flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {sportsTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                isActive
                  ? 'h-10 shrink-0 whitespace-nowrap rounded-full bg-fg px-5 text-sm font-semibold text-canvas'
                  : 'h-10 shrink-0 whitespace-nowrap rounded-full border border-edge bg-transparent px-5 text-sm font-medium text-fg-mid transition-colors hover:border-edge-strong hover:text-fg'
              }
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* 우승 카드 리스트 (spec §5.5 clickable card) */}
      <div className="grid gap-3">
        {filteredData.map((item) =>
          item.history.map((record, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedWinner(record)}
              className="w-full rounded-xl border border-edge bg-surface p-5 text-left transition-colors hover:border-edge-strong hover:bg-raised md:p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-raised text-2xl">
                    {item.emoji}
                  </span>
                  <div className="min-w-0">
                    {/* 시즌 배지 (spec §5.11 neutral) */}
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-semibold text-fg-mid">
                      {record.season}
                    </span>
                    <h3 className="mt-2 truncate text-xl font-bold leading-[1.3] tracking-[-0.01em] text-fg md:text-2xl">
                      {record.winner}
                    </h3>
                  </div>
                </div>

                <div className="flex shrink-0 items-center justify-between gap-4 md:justify-end">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-semibold text-fg-mid">
                    {record.class}
                  </span>
                  {record.photo ? (
                    <img
                      src={record.photo}
                      alt={record.winner}
                      className="h-14 w-20 shrink-0 rounded-lg border border-edge object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-raised text-xl">
                      🏆
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* 우승자 상세 모달 (spec §5.13) */}
      {selectedWinner && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedWinner(null)}
        >
          <div
            className="overlay-pop relative w-full max-w-lg rounded-2xl border border-edge bg-raised p-6 shadow-xl shadow-black/50 md:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedWinner(null)}
              aria-label="닫기"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-lg text-fg-dim transition-colors hover:bg-surface hover:text-fg"
            >
              ✕
            </button>

            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
              {selectedWinner.season} Champion
            </p>
            <h2 className="mt-2 text-2xl font-bold leading-[1.3] tracking-[-0.01em] text-fg md:text-3xl">
              {selectedWinner.winner}
            </h2>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface px-2.5 py-1 text-xs font-semibold text-fg-mid">
              {selectedWinner.class}
            </span>

            <div className="mt-6 space-y-6">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-edge bg-surface">
                {selectedWinner.photo ? (
                  <img
                    src={selectedWinner.photo}
                    alt={selectedWinner.winner}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-3">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-raised text-3xl">
                      🏆
                    </span>
                    <p className="text-sm font-medium text-fg-dim">우승 사진 준비 중입니다.</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedWinner(null)}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-edge-strong bg-transparent px-5 text-sm font-semibold text-fg transition-colors hover:bg-surface active:opacity-90 disabled:pointer-events-none disabled:opacity-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
