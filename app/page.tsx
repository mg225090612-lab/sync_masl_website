import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-zinc-950 text-white min-h-screen selection:bg-zinc-100 selection:text-black">
      {/* 티커 애니메이션을 위한 커스텀 CSS */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      {/* 1. 메인 히어로 배너 영역 (기존 코드 유지 및 레이아웃 수정) */}
      <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden px-4">
        {/* 스포츠 감성의 거친 느낌을 주는 얇은 그리드 배경 */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        <div className="relative z-10 text-center flex flex-col items-center">
          {/* 타이틀 영역 */}
          <div className="space-y-1 mb-8">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase italic text-zinc-100 drop-shadow-md">
              평가하라, 증명하라.
            </h1>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-widest text-zinc-600 uppercase italic">
              MASL 2026
            </h2>
          </div>

          {/* 설명 문구 */}
          <p className="max-w-2xl text-lg sm:text-xl text-zinc-400 font-medium tracking-tight mb-12">
            경기 후 선수의 퍼포먼스를 내 손으로 직접 평가하세요.<br />
            당신의 한 표가 이번 시즌 최고의 선수를 결정합니다.
          </p>

          {/* 버튼 영역 */}
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto">
            <Link
              href="/gvr/rate"
              className="relative px-12 py-4 bg-white text-black font-extrabold text-lg uppercase tracking-wider hover:bg-zinc-300 transition-colors shadow-lg"
            >
              GVR 평점 남기기
            </Link>
            <Link
              href="/gvr/view"
              className="px-12 py-4 border-2 border-zinc-700 text-zinc-300 font-bold text-lg uppercase tracking-wider hover:border-white hover:text-white transition-colors bg-zinc-950/80 backdrop-blur-sm"
            >
              현재 GVR 랭킹
            </Link>
          </div>
        </div>
      </section>

      {/* 2. 무한 스크롤 텍스트 티커 (Ticker) */}
      <div className="w-full bg-white text-black py-4 overflow-hidden flex whitespace-nowrap border-y-4 border-zinc-700 shadow-xl relative z-20">
        <div className="flex animate-marquee text-xl sm:text-3xl font-black uppercase italic tracking-widest">
          {/* 부드러운 반복을 위해 텍스트를 여러 번 이어 붙임 */}
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
        </div>
      </div>

      {/* 3. 타이포그래피 매니페스토 (Isaiah 43:19) */}
      <section className="py-24 sm:py-36 px-4 flex flex-col items-center justify-center text-center border-b border-zinc-900 relative overflow-hidden bg-zinc-950">
        {/* 배경에 깔리는 거대한 텍스트 (워터마크 효과) */}
        <h2 className="text-[10vw] font-black uppercase italic text-zinc-900/50 tracking-tighter absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full select-none pointer-events-none whitespace-nowrap">
          ISAIAH 43:19
        </h2>
        
        {/* 메인 슬로건 */}
        <div className="relative z-10">
          <p className="text-zinc-500 font-bold tracking-[0.3em] mb-4 text-sm sm:text-base">ISAIAH 43:19</p>
          <h3 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase italic text-zinc-100 tracking-tight">
            DOING A NEW THING
          </h3>
        </div>
      </section>

      {/* 4. 결승전 타임라인 (The Grand Final) */}
      <section className="py-24 px-4 max-w-6xl mx-auto bg-zinc-950">
        <div className="flex flex-col md:flex-row justify-between items-center relative gap-12 md:gap-0">
          
          {/* 중앙 연결선 (데스크탑에서만 표시) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-zinc-800 -z-10 -translate-y-1/2" />

          {/* 남자 축구 결승전 카드 */}
          <div className="bg-zinc-900 border-2 border-zinc-800 p-8 sm:p-12 w-full md:w-[42%] text-center transform transition-all duration-300 hover:-translate-y-2 hover:border-zinc-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <p className="text-zinc-400 font-bold mb-3 tracking-[0.2em] text-sm sm:text-base">MEN'S SOCCER</p>
            <h3 className="text-3xl sm:text-4xl font-black italic uppercase tracking-wider mb-8 text-white">THE GRAND FINAL</h3>
            <div className="inline-block bg-white text-black px-6 py-3 font-black text-xl sm:text-2xl tracking-[0.1em]">
              2026. 9. 21.
            </div>
          </div>

          {/* 중앙 X 장식 */}
          <div className="w-16 h-16 bg-zinc-950 rounded-full flex items-center justify-center font-black italic text-zinc-500 border-4 border-zinc-800 z-10 text-2xl">
            X
          </div>

          {/* 여자 축구 결승전 카드 */}
          <div className="bg-zinc-900 border-2 border-zinc-800 p-8 sm:p-12 w-full md:w-[42%] text-center transform transition-all duration-300 hover:-translate-y-2 hover:border-zinc-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-zinc-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <p className="text-zinc-400 font-bold mb-3 tracking-[0.2em] text-sm sm:text-base">WOMEN'S SOCCER</p>
            <h3 className="text-3xl sm:text-4xl font-black italic uppercase tracking-wider mb-8 text-white">THE GRAND FINAL</h3>
            <div className="inline-block bg-white text-black px-6 py-3 font-black text-xl sm:text-2xl tracking-[0.1em]">
              2026. 9. 21.
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}