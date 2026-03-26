'use client';

import { useState } from 'react';

export default function ChampionsPage() {
  const sportsTabs = ["남자축구", "여자축구", "남자농구", "여자배구"];
  const [activeTab, setActiveTab] = useState("남자축구");
  const [selectedWinner, setSelectedWinner] = useState<any>(null);

  // 25 Fall 데이터를 요청하신 대로 "Class of ~" 형식으로 업데이트했습니다!
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
    <div className="min-h-screen bg-white pb-20 pt-32 px-6 font-sans text-black relative">
      
      {/* 1. 타이틀 섹션 */}
      <div className="max-w-3xl mx-auto mb-16">
        <h1 className="text-7xl font-black italic tracking-tighter mb-4 text-black uppercase leading-none">CHAMPIONS</h1>
        <div className="h-2 w-20 bg-blue-600 mb-6"></div>
        <p className="text-gray-400 font-bold text-[0.6rem] uppercase tracking-[0.5em]">Official Winners Archive</p>
      </div>

      {/* 2. 종목 탭 */}
      <div className="max-w-3xl mx-auto mb-16 border-b border-gray-100 flex gap-1 overflow-x-auto no-scrollbar py-2">
        {sportsTabs.map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`px-6 py-4 font-black text-sm whitespace-nowrap transition-all relative ${activeTab === tab ? 'text-blue-600' : 'text-gray-400 hover:text-black'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-full"></div>}
          </button>
        ))}
      </div>

      {/* 3. 우승팀 리스트 */}
      <div className="max-w-3xl mx-auto space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <div key={item.sport} className="grid gap-3">
              {item.history.map((record, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedWinner(record)} 
                  className="group flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] cursor-pointer hover:bg-black hover:text-white transition-all duration-300 shadow-sm border border-transparent hover:border-blue-600"
                >
                  <div>
                    <p className="text-[0.6rem] font-black text-blue-600 group-hover:text-blue-400 mb-1 uppercase tracking-widest">{record.season}</p>
                    <h3 className="text-3xl font-black tracking-tight italic group-hover:scale-105 origin-left transition-transform duration-300 uppercase leading-none">{record.winner}</h3>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-[0.6rem] font-black text-gray-300 group-hover:text-gray-600 uppercase tracking-widest border border-gray-200 group-hover:border-gray-800 px-4 py-1.5 rounded-full transition-colors">{record.class}</span>
                    <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">🏆</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-100">
            <p className="text-gray-300 font-black italic tracking-widest uppercase text-xs">No Records Found</p>
          </div>
        )}
      </div>

      {/* ⭐ 4. 우승 사진 팝업 */}
      {selectedWinner && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[1000] flex items-center justify-center p-6 transition-all"
          onClick={() => setSelectedWinner(null)}
        >
          <div 
            className="bg-white rounded-[3.5rem] p-8 max-w-sm w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-8">
              <p className="text-blue-600 font-black text-[0.65rem] uppercase tracking-[0.3em] mb-2">{selectedWinner.season} WINNER</p>
              <h2 className="text-4xl font-black italic tracking-tighter text-black uppercase leading-tight">{selectedWinner.winner}</h2>
              <p className="mt-2 text-[0.6rem] font-bold text-gray-300 uppercase tracking-widest">{selectedWinner.class}</p>
            </div>
            
            <div className="relative aspect-square w-full rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
              {selectedWinner.photo ? (
                <img src={selectedWinner.photo} className="w-full h-full object-cover" alt="Champion" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                  <span className="text-6xl mb-4">🏆</span>
                  <p className="text-[0.65rem] font-black uppercase tracking-widest opacity-50 text-gray-400">Moment Pending</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setSelectedWinner(null)}
              className="mt-8 w-full py-5 bg-black text-white font-black text-[0.7rem] rounded-3xl transition-all uppercase tracking-widest hover:bg-blue-600 active:scale-95"
            >
              Close Archive
            </button>
          </div>
        </div>
      )}

      {/* 하단 문구 */}
      <div className="mt-60 text-center opacity-10 font-black text-8xl italic tracking-tighter select-none text-gray-900 leading-none">
        MASL <span className="text-blue-600">&</span> SYNC
      </div>
    </div>
  );
}