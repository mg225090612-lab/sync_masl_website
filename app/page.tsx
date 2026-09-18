import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-[calc(100vh-80px)] flex items-center justify-center bg-black text-white overflow-hidden px-4">
      {/* 어두운 스포트라이트 / 조명 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full z-0 pointer-events-none" />

      {/* 메인 콘텐츠 영역 */}
      <div className="relative z-10 max-w-4xl text-center space-y-8">
        {/* 서브 상단 뱃지 */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs sm:text-sm font-medium tracking-wider uppercase">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          MASL GVR Evaluation System
        </div>

        {/* 메인 타이틀 */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight">
          평가하라, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-500">증명하라.</span>
          <br />
          <span className="text-3xl sm:text-5xl md:text-6xl text-slate-200">MASL 2026</span>
        </h1>

        {/* 설명 문구 */}
        <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-light">
          경기 후 선수의 퍼포먼스를 내 손으로 직접 평가하세요. <br className="hidden sm:inline" />
          당신의 한 표가 이번 시즌 Best Player를 결정합니다.
        </p>

        {/* 버튼 영역 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/gvr/rate"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg hover:from-blue-500 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-blue-500/25 hover:scale-105 active:scale-95 text-center"
          >
            GVR 평점 남기기
          </Link>
          <Link
            href="/gvr/view"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-700 bg-slate-900/60 text-slate-200 font-semibold text-lg hover:bg-slate-800 hover:border-slate-600 transition-all duration-200 backdrop-blur-sm hover:scale-105 active:scale-95 text-center"
          >
            현재 GVR 랭킹
          </Link>
        </div>

        {/* 하단 요약 정보 */}
        <div className="pt-12 grid grid-cols-3 gap-4 border-t border-slate-800/80 max-w-2xl mx-auto text-slate-400 text-xs sm:text-sm">
          <div>
            <p className="font-bold text-slate-200 text-base sm:text-lg">REAL-TIME</p>
            <p className="text-slate-500 text-xs mt-0.5">실시간 평점 반영</p>
          </div>
          <div>
            <p className="font-bold text-slate-200 text-base sm:text-lg">FAIR</p>
            <p className="text-slate-500 text-xs mt-0.5">객관적 평가 데이터</p>
          </div>
          <div>
            <p className="font-bold text-slate-200 text-base sm:text-lg">SEASON MVP</p>
            <p className="text-slate-500 text-xs mt-0.5">최우수 선수 선정</p>
          </div>
        </div>
      </div>
    </main>
  );
}