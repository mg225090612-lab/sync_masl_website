'use client';

import { useState } from 'react';

const players = [
  'Player 01',
  'Player 02',
  'Player 03',
  'Player 04',
  'Player 05',
  'Player 06',
];

export default function GvrRatePage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#06101f] px-6 pb-20 pt-32 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top_left,rgba(0,255,255,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(57,255,20,0.10),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,140,255,0.12),transparent_30%),linear-gradient(180deg,#040b16_0%,#06101f_45%,#081426_100%)]" />
      <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16">
          <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
            GVR System
          </div>

          <div className="mt-6 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-5xl font-black italic leading-none tracking-[-0.05em] md:text-8xl">
                <span className="bg-gradient-to-r from-cyan-300 via-white to-lime-300 bg-clip-text text-transparent">
                  RATE
                </span>{' '}
                <span className="text-white">PLAYERS</span>
              </h1>
              <div className="mt-5 h-[3px] w-28 rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-lime-400 shadow-[0_0_20px_rgba(34,211,238,0.55)]" />
            </div>

            <p className="max-w-md text-sm leading-relaxed text-white/55 md:text-right">
              평가할 선수를 선택하고 평점을 남기세요.
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-cyan-400/10 bg-white/[0.045] p-6 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            <h2 className="mb-5 text-lg font-black italic tracking-[0.12em] text-white/80">
              PLAYER LIST
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {players.map((player) => {
                const active = selected === player;
                return (
                  <button
                    key={player}
                    onClick={() => setSelected(player)}
                    className={`rounded-2xl border px-4 py-4 text-left text-sm font-bold transition ${
                      active
                        ? 'border-cyan-300/60 bg-gradient-to-r from-cyan-300 to-lime-300 text-[#04111d] shadow-[0_0_18px_rgba(103,232,249,0.35)]'
                        : 'border-white/10 bg-[#0b1730] text-white/75 hover:border-cyan-300/25 hover:text-white'
                    }`}
                  >
                    {player}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-[32px] border border-cyan-400/10 bg-white/[0.045] p-6 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-xl">
            <h2 className="mb-5 text-lg font-black italic tracking-[0.12em] text-white/80">
              RATE PANEL
            </h2>

            <div className="rounded-[28px] border border-white/10 bg-[#0b1730] p-6">
              <p className="text-sm text-white/45">Selected Player</p>
              <p className="mt-2 text-2xl font-black italic text-white">
                {selected ?? '선수를 먼저 선택하세요'}
              </p>

              <div className="mt-8 flex gap-3">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 font-black text-cyan-200 transition hover:scale-105 hover:bg-cyan-300/20"
                  >
                    {score}
                  </button>
                ))}
              </div>

              <button className="mt-8 w-full rounded-2xl bg-gradient-to-r from-cyan-300 to-lime-300 py-4 text-sm font-black tracking-[0.18em] text-[#03101b] shadow-[0_0_24px_rgba(132,255,212,0.25)] transition hover:scale-[0.99]">
                SUBMIT
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}