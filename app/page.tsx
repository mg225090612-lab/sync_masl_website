import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] bg-zinc-950 text-white flex flex-col overflow-hidden selection:bg-zinc-100 selection:text-black">
      {/* 티커 애니메이션을 위한 CSS */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      {/* 1. 상단 무한 스크롤 텍스트 티커 */}
      <div className="w-full bg-white text-zinc-950 py-2.5 overflow-hidden flex whitespace-nowrap border-b-4 border-zinc-700 z-20 shrink-0">
        <div className="flex animate-marquee text-sm sm:text-lg font-black uppercase italic tracking-widest">
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
        </div>
      </div>

      {/* 메인 화면 분할 영역 (Grid Layout) */}
      <div className="flex-1 flex flex-col lg:flex-row relative">
        {/* 스포츠 감성의 얇은 그리드 배경 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* 2. 왼쪽: 메인 히어로 배너 영역 */}
        <div className="flex-[1.2] flex flex-col justify-center p-8 lg:p-16 border-b lg:border-b-0 lg:border-r border-zinc-800 relative z-10 bg-zinc-950/50 backdrop-blur-sm">
          <div className="space-y-1 mb-8">
            <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tighter uppercase italic text-zinc-100 drop-shadow-md">
              평가하라, 증명하라.
            </h1>
            <h2 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-widest text-zinc-600 uppercase italic">
              MASL 2026
            </h2>
          </div>
          <p className="max-w-lg text-base sm:text-lg text-zinc-400 font-medium tracking-tight mb-10">
            경기 후 선수의 퍼포먼스를 내 손으로 직접 평가하세요.<br />
            당신의 한 표가 이번 시즌 최고의 선수를 결정합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* GVR 평점 남기기 버튼 (글자색 강제 고정) */}
            <Link
              href="/gvr/rate"
              className="px-8 py-3.5 bg-zinc-100 text-zinc-950 font-extrabold text-base uppercase tracking-wider hover:bg-zinc-300 transition-colors text-center shadow-lg"
            >
              GVR 평점 남기기
            </Link>
            {/* 현재 GVR 랭킹 버튼 */}
            <Link
              href="/gvr/view"
              className="px-8 py-3.5 border-2 border-zinc-700 text-zinc-300 font-bold text-base uppercase tracking-wider hover:border-zinc-300 hover:text-zinc-100 transition-colors bg-zinc-950/80 backdrop-blur-sm text-center"
            >
              현재 GVR 랭킹
            </Link>
          </div>
        </div>

        {/* 3. 오른쪽: 정보 영역 (위/아래 분할) */}
        <div className="flex-1 flex flex-col relative z-10">
          
          {/* 오른쪽 위: 매니페스토 (Isaiah 43:19) */}
          <div className="flex-1 flex flex-col items-center justify-center p-8 border-b border-zinc-800 relative overflow-hidden group bg-zinc-900/20">
            <h2 className="text-[15vw] lg:text-[7vw] font-black uppercase italic text-zinc-800/40 tracking-tighter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full select-none pointer-events-none text-center whitespace-nowrap transition-transform duration-700 group-hover:scale-110">
              ISAIAH 43:19
            </h2>
            <div className="relative z-10 text-center">
              <p className="text-zinc-500 font-bold tracking-[0.3em] mb-2 text-xs sm:text-sm">ISAIAH 43:19</p>
              <h3 className="text-3xl sm:text-4xl xl:text-5xl font-black uppercase italic text-zinc-100 tracking-tight">
                DOING A NEW THING
              </h3>
            </div>
          </div>

          {/* 오른쪽 아래: 결승전 일정 (좌/우 분할) */}
          <div className="flex-1 flex flex-col sm:flex-row">
            {/* Men's Soccer */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center border-b sm:border-b-0 sm:border-r border-zinc-800 hover:bg-zinc-900/80 transition-colors relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <p className="text-zinc-400 font-bold mb-3 tracking-[0.2em] text-xs xl:text-sm">MEN'S SOCCER</p>
              <h3 className="text-xl xl:text-2xl font-black italic uppercase tracking-wider mb-5 text-white">THE GRAND FINAL</h3>
              <div className="bg-zinc-100 text-zinc-950 px-4 py-2 font-black text-lg xl:text-xl tracking-[0.1em]">
                2026. 9. 21.
              </div>
            </div>
            
            {/* Women's Soccer */}
            <div className="flex-1 p-6 flex flex-col justify-center items-center text-center hover:bg-zinc-900/80 transition-colors relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              <p className="text-zinc-400 font-bold mb-3 tracking-[0.2em] text-xs xl:text-sm">WOMEN'S SOCCER</p>
              <h3 className="text-xl xl:text-2xl font-black italic uppercase tracking-wider mb-5 text-white">THE GRAND FINAL</h3>
              <div className="bg-zinc-100 text-zinc-950 px-4 py-2 font-black text-lg xl:text-xl tracking-[0.1em]">
                2026. 9. 21.
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}