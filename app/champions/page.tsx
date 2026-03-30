'use client';

import { useState } from 'react';
import type { ChampionItem, ChampionRecord } from '@/lib/types';

export default function ChampionsPage() {
  const sportsTabs = ['남자축구', '여자축구', '남자농구', '여자배구'];
  const [activeTab, setActiveTab] = useState<string>('남자축구');
  const [selectedWinner, setSelectedWinner] = useState<ChampionRecord | null>(null);

  const hallOfFame: ChampionItem[] = [
    {
      sport: '남자축구',
      emoji: '⚽',
      history: [
        { season: '25 Fall', winner: '빵빵이의 축구교실', class: 'Class of 2028', photo: '' },
      ],
    },
    {
      sport: '여자축구',
      emoji: '⚽',
      history: [
        { season: '25 Fall', winner: '옥지의 축구교실', class: 'Class of 2028', photo: '' },
      ],
    },
    {
      sport: '남자농구',
      emoji: '🏀',
      history: [
        { season: '25 Fall', winner: '머리 큰 조던', class: 'Class of 2026', photo: '' },
      ],
    },
    {
      sport: '여자배구',
      emoji: '🏐',
      history: [
        { season: '25 Fall', winner: '개천에서 용 난다', class: '연합팀', photo: '' },
      ],
    },
  ];

  const filteredData = hallOfFame.filter((item) => item.sport === activeTab);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] text-white pt-32 px-6 pb-20">
      {/* Background */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 h-72 w-72 rounded-full bg-cyan-400/10 blur-[120px] -z-10" />
      <div className="absolute bottom-16 right-10 h-60 w-60 rounded-full bg-lime-400/10 blur-[120px] -z-10" />

      {/* Header */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] uppercase text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
          Neon Archive
        </div>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-[-0.05em] leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-lime-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.18)]">
              CHAMPIONS
            </h1>
            <div className="mt-5 h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-lime-400 shadow-[0_0_20px_rgba(34,211,238,0.55)]" />
          </div>

          <p className="max-w-md text-sm md:text-right text-white/55 leading-relaxed">
            Official winners archive with a futuristic navy and neon identity.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mb-12 flex gap-3 overflow-x-auto no-scrollbar">
        {sportsTabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition-all duration-300 border ${
                isActive
                  ? 'border-cyan-300/60 bg-gradient-to-r from-cyan-300 to-lime-300 text-[#04111d] shadow-[0_0_20px_rgba(103,232,249,0.45)] scale-105'
                  : 'border-white/10 bg-white/[0.04] text-white/65 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:text-white'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto grid gap-6">
        {filteredData.map((item) =>
          item.history.map((record, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedWinner(record)}
              className="group relative cursor-pointer overflow-hidden rounded-[30px] border border-cyan-400/10 bg-white/[0.045] p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_0_30px_rgba(34,211,238,0.12)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/[0.08] via-transparent to-lime-400/[0.07] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b from-cyan-300 via-sky-400 to-lime-300 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[#0a1b31] text-2xl shadow-inner shadow-cyan-400/10">
                    {item.emoji}
                  </div>

                  <div>
                    <p className="text-[11px] tracking-[0.28em] uppercase text-cyan-300/85">
                      {record.season}
                    </p>
                    <h3 className="mt-2 text-2xl md:text-4xl font-black italic tracking-[-0.04em] text-white">
                      {record.winner}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4">
                  <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-1.5 text-[11px] font-semibold tracking-wide text-lime-200">
                    {record.class}
                  </span>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_20px_rgba(34,211,238,0.15)]">
                    🏆
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selectedWinner && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#020611]/80 backdrop-blur-md px-4"
          onClick={() => setSelectedWinner(null)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-cyan-300/20 bg-[#081426]/95 p-8 shadow-[0_0_60px_rgba(34,211,238,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(163,230,53,0.12),transparent_35%)]" />

            <div className="relative z-10 text-center">
              <p className="text-[11px] tracking-[0.28em] uppercase text-cyan-300">
                {selectedWinner.season}
              </p>

              <h2 className="mt-3 text-3xl font-black italic tracking-tight text-white">
                {selectedWinner.winner}
              </h2>

              <p className="mt-2 text-sm text-white/50">{selectedWinner.class}</p>

              <div className="mt-8 flex aspect-square items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] shadow-inner shadow-cyan-400/10">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300/20 to-lime-300/20 text-7xl shadow-[0_0_24px_rgba(34,211,238,0.2)]">
                  🏆
                </div>
              </div>

              <button
                onClick={() => setSelectedWinner(null)}
                className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-lime-300 py-4 text-sm font-black tracking-[0.2em] text-[#03101b] transition-transform duration-200 hover:scale-[0.98] shadow-[0_0_24px_rgba(132,255,212,0.25)]"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="max-w-5xl mx-auto mt-24 pt-8">
        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <p className="text-xs tracking-[0.3em] uppercase text-white/30">MASL</p>
          <p className="text-xs text-cyan-300/50">Future Sports Legacy</p>
        </div>
      </div>
    </div>
  );
}