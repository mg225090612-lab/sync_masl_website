'use client';

import { useMemo, useState } from 'react';

type SportTab = '남자축구' | '여자축구' | '남자농구' | '여자배구';

interface TeamData {
  sport: SportTab;
  status: string;
  teams: string[];
}

export default function MaslSeasonPage() {
  const tabs: SportTab[] = ['남자축구', '여자축구', '남자농구', '여자배구'];
  const [activeTab, setActiveTab] = useState<SportTab>('남자축구');

  const data: TeamData[] = [
    { sport: '남자축구', status: 'Bracket updating...', teams: [] },
    { sport: '여자축구', status: 'Bracket updating...', teams: [] },
    { sport: '남자농구', status: 'Bracket updating...', teams: [] },
    { sport: '여자배구', status: 'Bracket updating...', teams: [] },
  ];

  const current = useMemo(
    () => data.find((item) => item.sport === activeTab)!,
    [activeTab]
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-32 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
      <div className="absolute left-1/2 top-24 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-[120px]" />
      <div className="absolute bottom-16 right-10 -z-10 h-60 w-60 rounded-full bg-lime-400/10 blur-[120px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.15)]">
            Season Hub
          </div>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-5xl font-black italic leading-none tracking-[-0.05em] md:text-8xl">
                <span className="text-white">26 </span>
                <span className="bg-gradient-to-r from-cyan-300 to-lime-300 bg-clip-text text-transparent">
                  SPRING
                </span>{' '}
                <span className="text-white">HUB</span>
              </h1>
              <div className="mt-5 h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-lime-400 shadow-[0_0_20px_rgba(34,211,238,0.55)]" />
            </div>

            <p className="max-w-md text-sm leading-relaxed text-white/55 md:text-right">
              MASL tournament center with a unified navy and neon interface.
            </p>
          </div>
        </div>

        <div className="mb-14 flex gap-3 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap rounded-full border px-5 py-3 text-sm font-bold transition-all duration-300 ${
                  active
                    ? 'scale-105 border-cyan-300/60 bg-gradient-to-r from-cyan-300 to-lime-300 text-[#04111d] shadow-[0_0_20px_rgba(103,232,249,0.45)]'
                    : 'border-white/10 bg-white/[0.04] text-white/65 hover:border-cyan-400/30 hover:bg-cyan-400/[0.06] hover:text-white'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.8fr_0.82fr]">
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black italic tracking-[0.15em] text-white/75">
                TOURNAMENT BRACKET
              </h2>
              <span className="rounded-full border border-cyan-300/15 bg-cyan-300/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300">
                Coming Soon
              </span>
            </div>

            <div className="flex min-h-[420px] items-center justify-center rounded-[32px] border border-cyan-400/10 bg-white/[0.045] p-8 text-center shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-xl">
              <div>
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-300/20 bg-[#0a1b31] text-4xl shadow-inner shadow-cyan-400/10">
                  🏟️
                </div>
                <p className="text-lg font-black italic tracking-wide text-white/80">
                  {current.status}
                </p>
                <p className="mt-3 text-sm text-white/40">
                  경기 대진표와 결과가 이곳에 표시됩니다.
                </p>
              </div>
            </div>
          </section>

          <aside>
            <div className="mb-5">
              <h2 className="text-xl font-black italic tracking-[0.15em] text-white/85">
                PARTICIPATING TEAMS
              </h2>
            </div>

            <div className="rounded-[32px] border border-cyan-400/10 bg-white/[0.045] p-6 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-xl">
              {current.teams.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center text-center">
                  <div>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-2xl">
                      👥
                    </div>
                    <p className="font-black italic text-white/60">
                      NO TEAMS REGISTERED
                    </p>
                    <p className="mt-2 text-sm text-white/35">
                      참가 팀이 등록되면 이 영역에 표시됩니다.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {current.teams.map((team) => (
                    <div
                      key={team}
                      className="rounded-2xl border border-white/10 bg-[#0b1730] px-4 py-4 text-sm font-bold text-white/85"
                    >
                      {team}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}