'use client';

const rankings = [
  { name: 'Player 01', score: 4.8 },
  { name: 'Player 02', score: 4.6 },
  { name: 'Player 03', score: 4.4 },
  { name: 'Player 04', score: 4.2 },
];

export default function GvrViewPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-32 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
            GVR Results
          </div>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-5xl font-black italic leading-none tracking-[-0.05em] md:text-8xl">
                <span className="text-white">VIEW </span>
                <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">
                  RESULTS
                </span>
              </h1>
              <div className="mt-5 h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-lime-400 shadow-[0_0_20px_rgba(34,211,238,0.55)]" />
            </div>

            <p className="max-w-md text-sm leading-relaxed text-white/55 md:text-right">
              선수별 평점 결과를 네온 다크 UI로 확인합니다.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-cyan-400/10 bg-white/[0.045] p-6 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-xl">
          <h2 className="mb-6 text-lg font-black italic tracking-[0.12em] text-white/80">
            PLAYER RANKINGS
          </h2>

          <div className="space-y-4">
            {rankings.map((player, index) => (
              <div
                key={player.name}
                className="group relative overflow-hidden rounded-[28px] border border-cyan-400/10 bg-[#0b1730] p-5 transition-all duration-300 hover:border-cyan-300/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.10)]"
              >
                <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b from-cyan-300 via-sky-400 to-lime-300 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 font-black text-cyan-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/75">
                        Ranking
                      </p>
                      <h3 className="mt-1 text-2xl font-black italic text-white">
                        {player.name}
                      </h3>
                    </div>
                  </div>

                  <div className="rounded-full border border-lime-300/20 bg-lime-300/10 px-4 py-2 text-sm font-black text-lime-200">
                    {player.score.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}