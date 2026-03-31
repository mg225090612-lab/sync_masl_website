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
        { season: '25 Fall', winner: '빵빵이의 축구교실', class: 'Class of 2028', photo: '/champions/남자축구 25F.JPG' },
      ],
    },
    {
      sport: '여자축구',
      emoji: '⚽',
      history: [
        { season: '25 Fall', winner: '옥지의 축구교실', class: 'Class of 2028', photo: '/champions/여자축구 25F.JPG' },
      ],
    },
    {
      sport: '남자농구',
      emoji: '🏀',
      history: [
        { season: '26 Spring', winner: '빵빵이의 농구교실', class: 'Class of 2028', photo: '' }, // 최신 시즌 위로
        { season: '25 Fall', winner: '머리 큰 조던', class: 'Class of 2026', photo: '/champions/남자농구 25F.JPG' },
      ],
    },
    {
      sport: '여자배구',
      emoji: '🏐',
      history: [
        { season: '26 Spring', winner: '어~시니어야~', class: 'Class of 2027', photo: '' }, // 최신 시즌 위로
        { season: '25 Fall', winner: '개천에서 용 난다', class: '연합팀', photo: '/champions/여자배구 25F.JPG' },
      ],
    },
  ];

  const filteredData = hallOfFame.filter((item) => item.sport === activeTab);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] text-white pt-32 px-6 pb-20">
      {/* 배경 레이어 */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
      
      {/* 헤더 섹션 */}
      <div className="max-w-5xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] uppercase text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
          Neon Archive
        </div>

        <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-5xl md:text-8xl font-black italic tracking-[-0.05em] leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-lime-300 drop-shadow-[0_0_24px_rgba(34,211,238,0.18)] uppercase">
              Champions
            </h1>
            <div className="mt-5 h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-lime-400 shadow-[0_0_20px_rgba(34,211,238,0.55)]" />
          </div>
          <p className="max-w-md text-sm md:text-right text-white/55 leading-relaxed italic">
            Official archive of MASL champions. Exploring the future legacy of sports.
          </p>
        </div>
      </div>

      {/* 종목 탭 */}
      <div className="max-w-5xl mx-auto mb-12 flex gap-3 overflow-x-auto no-scrollbar">
        {sportsTabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative whitespace-nowrap rounded-full px-6 py-3.5 text-sm font-black transition-all duration-300 border italic uppercase tracking-wider ${
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

      {/* 우승 카드 리스트 (정렬된 결과) */}
      <div className="max-w-5xl mx-auto grid gap-6">
        {filteredData.map((item) =>
          item.history.map((record, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedWinner(record)}
              className="group relative cursor-pointer overflow-hidden rounded-[30px] border border-cyan-400/10 bg-white/[0.045] p-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-[0_0_40px_rgba(34,211,238,0.15)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/[0.08] via-transparent to-lime-400/[0.07] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b from-cyan-300 via-sky-400 to-lime-300 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />

              <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-[#0a1b31] text-3xl shadow-inner shadow-cyan-400/10">
                    {item.emoji}
                  </div>
                  <div>
                    <p className="text-[11px] tracking-[0.3em] uppercase text-cyan-300/80 font-black italic">
                      {record.season}
                    </p>
                    <h3 className="mt-2 text-2xl md:text-4xl font-black italic tracking-tight text-white uppercase">
                      {record.winner}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6">
                  <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-5 py-2 text-[11px] font-black tracking-widest text-lime-200 uppercase">
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

      {/* 우승자 상세 모달 */}
      {selectedWinner && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-[#020611]/90 backdrop-blur-xl px-4 animate-in fade-in duration-300"
          onClick={() => setSelectedWinner(null)}
        >
          <div
            className="relative w-full max-w-lg overflow-hidden rounded-[40px] border border-cyan-300/20 bg-[#081426] p-10 shadow-[0_0_80px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_40%)]" />

            <div className="relative z-10 text-center">
              <p className="text-xs tracking-[0.4em] uppercase text-cyan-400 font-black italic mb-2">
                {selectedWinner.season} Champion
              </p>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase mb-4 leading-tight">
                {selectedWinner.winner}
              </h2>
              <p className="text-sm font-bold text-white/40 tracking-[0.2em] mb-8">{selectedWinner.class}</p>

              <div className="relative aspect-video w-full overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.02] shadow-2xl flex items-center justify-center">
                {selectedWinner.photo ? (
                  <img 
                    src={selectedWinner.photo} 
                    alt={selectedWinner.winner} 
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-cyan-300/20 to-lime-300/20 text-7xl shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                      🏆
                    </div>
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Victory Photo Pending</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedWinner(null)}
                className="mt-10 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-lime-300 py-5 text-sm font-black tracking-[0.3em] text-[#03101b] transition-all hover:brightness-110 active:scale-95 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
              >
                CLOSE ARCHIVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}