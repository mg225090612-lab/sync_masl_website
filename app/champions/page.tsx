'use client';

import { useState } from 'react';

export default function ChampionsPage() {
  const sportsTabs = ["남자축구", "여자축구", "남자농구", "여자배구"];
  const [activeTab, setActiveTab] = useState("남자축구");
  const [selectedWinner, setSelectedWinner] = useState<any>(null);

  const hallOfFame = [
    {
      sport: "남자축구",
      emoji: "⚽",
      history: [
        { season: "25 Fall", winner: "빵빵이의 축구교실", class: "Class of 2028", photo: "" },
      ]
    },
    {
      sport: "여자축구",
      emoji: "⚽",
      history: [
        { season: "25 Fall", winner: "옥지의 축구교실", class: "Class of 2028", photo: "" }
      ]
    },
    {
      sport: "남자농구",
      emoji: "🏀",
      history: [
        { season: "25 Fall", winner: "머리 큰 조던", class: "Class of 2026", photo: "" }
      ]
    },
    {
      sport: "여자배구",
      emoji: "🏐",
      history: [
        { season: "25 Fall", winner: "개천에서 용 난다", class: "연합팀", photo: "" }
      ]
    },
  ];

  const filteredData = hallOfFame.filter(item => item.sport === activeTab);

  return (
    <div className="min-h-screen bg-[#050816] text-white pt-32 px-6 pb-20 relative">

      {/* 🔥 배경 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_30%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.2),transparent_30%)]" />
      </div>

      {/* 🔥 타이틀 */}
      <div className="max-w-4xl mx-auto mb-20">
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tight leading-none">
          CHAMPIONS
        </h1>
        <div className="h-[3px] w-24 bg-gradient-to-r from-cyan-400 to-violet-500 mt-4 mb-6"></div>
        <p className="text-xs tracking-[0.5em] text-white/40 uppercase">
          Official Winners Archive
        </p>
      </div>

      {/* 🔥 탭 */}
      <div className="max-w-4xl mx-auto mb-14 flex gap-3 overflow-x-auto no-scrollbar">
        {sportsTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 rounded-full text-sm font-bold transition-all
            ${activeTab === tab
                ? "bg-gradient-to-r from-cyan-400 to-violet-500 text-black shadow-lg scale-105"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 🔥 카드 리스트 */}
      <div className="max-w-4xl mx-auto space-y-6">
        {filteredData.map((item) =>
          item.history.map((record, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedWinner(record)}
              className="group relative p-8 rounded-[28px] bg-white/5 backdrop-blur-xl border border-white/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:bg-white/10"
            >
              {/* glow */}
              <div className="absolute inset-0 rounded-[28px] opacity-0 group-hover:opacity-100 transition bg-gradient-to-r from-cyan-400/10 to-violet-400/10" />

              <div className="flex justify-between items-center relative z-10">
                <div>
                  <p className="text-[10px] tracking-widest text-cyan-300 mb-2 uppercase">
                    {record.season}
                  </p>
                  <h3 className="text-3xl md:text-4xl font-black italic tracking-tight">
                    {record.winner}
                  </h3>
                </div>

                <div className="text-right flex items-center gap-4">
                  <span className="text-[10px] px-4 py-1 rounded-full border border-white/20 text-white/50">
                    {record.class}
                  </span>
                  <span className="text-4xl group-hover:scale-110 transition">
                    🏆
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 팝업 */}
      {selectedWinner && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-[999]"
          onClick={() => setSelectedWinner(null)}
        >
          <div
            className="bg-[#0b1220] border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <p className="text-xs text-cyan-300 tracking-widest uppercase">
                {selectedWinner.season}
              </p>
              <h2 className="text-3xl font-black italic mt-2">
                {selectedWinner.winner}
              </h2>
              <p className="text-xs text-white/40 mt-2">
                {selectedWinner.class}
              </p>
            </div>

            <div className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center">
              <span className="text-6xl">🏆</span>
            </div>

            <button
              onClick={() => setSelectedWinner(null)}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-violet-500 text-black font-bold hover:scale-95 transition"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* 🔥 하단 */}
      <div className="mt-40 text-center opacity-10 text-7xl font-black italic tracking-tight">
        MASL
      </div>
    </div>
  );
}