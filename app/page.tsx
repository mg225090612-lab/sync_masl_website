'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-32 text-white font-sans">
      
      {/* 🔥 사이버틱 배경 레이어 */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl">

        {/* 🚀 헤더 섹션 */}
        <div className="mb-16">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
            MASL 26 SPRING HUB
          </div>

          <div className="mt-6">
            <h1 className="text-6xl md:text-9xl font-black italic tracking-[-0.05em] leading-none uppercase">
              <span className="text-white">Sports </span>
              <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">
                Platform
              </span>
            </h1>
            <div className="mt-6 h-[4px] w-32 bg-gradient-to-r from-cyan-400 to-lime-400 shadow-[0_0_25px_rgba(34,211,238,0.6)]" />
          </div>
        </div>

        {/* 🏟️ UPCOMING MATCH (투명 로고 버전) */}
        <div className="mb-20">
          <p className="mb-6 text-[10px] font-black tracking-[0.4em] text-cyan-400/60 uppercase">
            Upcoming Match / Live Event
          </p>

          <div className="relative overflow-hidden rounded-[50px] border border-white/5 bg-black/40 shadow-2xl">
            {/* 1. 배경 이미지: match_bg.png */}
            <div className="relative aspect-[21/9] w-full flex items-center justify-center">
              <img 
                src="/images/match_bg.png" 
                alt="Match Background" 
                className="absolute inset-0 h-full w-full object-cover opacity-20 transition-transform duration-1000 hover:scale-105"
              />
              
              {/* 2. 로고 배치 (테두리 없음, 투명 파일 전용) */}
              <div className="relative z-10 flex w-full items-center justify-around px-6 md:px-20">
                
                {/* 왼쪽 팀: 빵빵이의 축구교실 (로고 클릭 시 팀 페이지 이동) */}
                <Link 
                  href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`}
                  className="group transition-all duration-500 hover:scale-110 active:scale-95"
                >
                  <div className="h-40 w-40 md:h-72 md:w-72 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <img 
                      src="/teams/빵빵이의 축구교실.png" 
                      alt="Team Left Logo" 
                      className="h-full w-full object-contain filter brightness-125 transition-all group-hover:drop-shadow-[0_0_40px_rgba(34,211,238,0.7)]" 
                    />
                  </div>
                </Link>

                {/* 중간 VS 타이포그래피 */}
                <div className="flex flex-col items-center">
                  <span className="text-6xl md:text-9xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">VS</span>
                  <div className="mt-6 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-6 py-2 backdrop-blur-2xl">
                    <p className="text-[10px] md:text-xs font-black tracking-[0.4em] text-cyan-300 uppercase italic">March 31 / 18:00</p>
                  </div>
                </div>

                {/* 오른쪽 팀: 김영준에게 축구를 배우다 (로고 클릭 시 팀 페이지 이동) */}
                <Link 
                  href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`}
                  className="group transition-all duration-500 hover:scale-110 active:scale-95"
                >
                  <div className="h-40 w-40 md:h-72 md:w-72 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <img 
                      src="/teams/김영준에게 축구를 배우다.png" 
                      alt="Team Right Logo" 
                      className="h-full w-full object-contain filter brightness-125 transition-all group-hover:drop-shadow-[0_0_40px_rgba(57,255,20,0.7)]" 
                    />
                  </div>
                </Link>

              </div>
            </div>
          </div>
        </div>

        {/* 🏆 TOURNAMENT BRACKET */}
        <div className="mb-20">
          <h2 className="text-2xl font-black italic mb-8 tracking-[0.15em] uppercase">
            Tournament <span className="text-cyan-300">Bracket</span>
          </h2>

          <div className="relative min-h-[500px] flex items-center justify-center rounded-[50px] border border-white/5 bg-white/[0.02] backdrop-blur-3xl transition-all hover:bg-white/[0.04]">
             <div className="absolute inset-0 overflow-hidden rounded-[50px] opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.2),transparent_70%)]" />
             </div>
             <div className="relative text-center">
              <div className="mb-6 text-7xl animate-bounce">⚽</div>
              <p className="text-2xl font-black italic text-white/80 tracking-widest">
                BRACKET UPDATING...
              </p>
              <p className="text-sm text-white/30 mt-3 font-medium uppercase tracking-[0.2em]">
                Pre-Tournament Data Processing
              </p>
            </div>
          </div>
        </div>

        {/* 🏢 FOOTER 로고 */}
        <div className="mt-40 text-center opacity-10 font-black text-7xl italic tracking-tighter select-none">
          MASL <span className="text-cyan-400">&</span> SYNC
        </div>

      </div>
    </div>
  );
}