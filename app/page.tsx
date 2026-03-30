'use client';

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-32 text-white">
      
      {/* 🔥 배경 */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl">

        {/* 🔥 HEADER */}
        <div className="mb-16">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
            MASL HUB
          </div>

          <div className="mt-6">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-[-0.05em] leading-none">
              <span className="text-white">SPORTS </span>
              <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">
                PLATFORM
              </span>
            </h1>

            <div className="mt-5 h-[3px] w-28 bg-gradient-to-r from-cyan-400 to-lime-400 shadow-[0_0_20px_rgba(34,211,238,0.55)]" />
          </div>
        </div>

        {/* 🔥 UPCOMING MATCH */}
        <div className="mb-16">
          <p className="mb-4 text-xs tracking-[0.3em] text-cyan-300 uppercase">
            UPCOMING MATCH
          </p>

          <div className="flex min-h-[180px] items-center justify-center rounded-[32px] border border-cyan-400/10 bg-white/[0.045] backdrop-blur-xl text-center">
            <div>
              <p className="text-lg font-black italic text-white/70">
                NO UPCOMING MATCHES
              </p>
              <p className="text-sm text-white/40 mt-2">
                현재 예정된 공식 경기가 없습니다.
              </p>
            </div>
          </div>
        </div>

        {/* 🔥 TOURNAMENT */}
        <div>
          <h2 className="text-xl font-black italic mb-6 tracking-[0.1em]">
            남자축구 <span className="text-cyan-300">토너먼트</span>
          </h2>

          <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-cyan-400/10 bg-white/[0.045] backdrop-blur-xl">
            <div className="text-center">
              <div className="mb-4 text-5xl">🏟️</div>
              <p className="font-black italic text-white/70">
                BRACKET UPDATE NEEDED
              </p>
              <p className="text-sm text-white/40 mt-2">
                대진표 사전 업데이트 예정
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}