import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function HomePage() {
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .eq('is_active', true)
    .order('match_date', { ascending: true });

  const sports = ['남자축구', '여자축구', '남자농구', '여자배구'];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 pb-20 pt-20 font-sans text-white">
      {/* 배경 효과 */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute right-[-10rem] top-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_30%)]" />
      </div>

      {/* 1. 상단 하이라이트 */}
      <section className="relative mx-auto max-w-5xl px-6 py-12 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 backdrop-blur-xl">
          <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.8)]" />
          <h2 className="text-xs font-black uppercase tracking-[0.28em] text-cyan-200">
            Upcoming Match
          </h2>
        </div>

        {matches && matches.length > 0 ? (
          <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(0,0,0,0.55)] md:p-12">
            {/* 배경 장식 */}
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl transition-all duration-300 group-hover:bg-cyan-300/20" />
            <div className="absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-indigo-400/10 blur-3xl" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),transparent_40%)]" />

            <div className="relative z-10">
              <p className="text-[0.65rem] font-black uppercase tracking-[0.35em] text-cyan-200/80">
                Official Match Highlight
              </p>

              <div className="mt-8 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-6 py-6 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Team A
                  </p>
                  <p className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
                    {matches[0].team_a}
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-black uppercase tracking-[0.4em] text-cyan-300">
                    VS
                  </p>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-6 py-6 backdrop-blur-xl">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                    Team B
                  </p>
                  <p className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
                    {matches[0].team_b}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm font-bold text-cyan-100/80 md:text-base">
                {new Date(matches[0].match_date).toLocaleString('ko-KR')}
              </p>

              <Link
                href="/gvr/rate"
                className="inline-flex items-center justify-center mt-8 rounded-full bg-white px-8 py-3 text-sm font-black text-blue-700 shadow-xl transition-all hover:scale-[1.03] hover:bg-cyan-50"
              >
                평점 남기러 가기
              </Link>
            </div>
          </div>
        ) : (
          <div className="rounded-[2.5rem] border border-dashed border-white/10 bg-white/5 p-14 text-center shadow-inner backdrop-blur-xl">
            <p className="mb-2 text-lg font-black tracking-[0.18em] text-slate-300">
              NO UPCOMING MATCHES
            </p>
            <p className="text-sm text-slate-400">
              현재 예정된 공식 경기가 없습니다.
            </p>
          </div>
        )}
      </section>

      {/* 2. 종목별 토너먼트 */}
      <section className="relative mx-auto max-w-5xl space-y-16 px-6 py-10">
        {sports.map((sport, index) => (
          <div key={sport} className="group">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-2xl font-black tracking-tight md:text-3xl">
                <span className="text-white">{sport}</span>{' '}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  토너먼트
                </span>
              </h3>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold tracking-[0.22em] text-slate-400">
                0{index + 1}
              </span>
            </div>

            <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_10px_40px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/20 group-hover:bg-white/[0.07]">
              {/* 배경 패턴 */}
              <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px] opacity-40" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(56,189,248,0.08),transparent_35%,rgba(99,102,241,0.08))]" />
              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

              <div className="relative z-10 text-center">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-200/80">
                  Bracket Update Needed
                </p>
                <p className="text-sm italic font-medium text-slate-400">
                  [ 대진표 사진 업데이트 예정 ]
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. 하단 문구 */}
      <div className="relative mt-28 mb-10 text-center select-none">
        <div className="inline-block rounded-full border border-white/10 bg-white/5 px-8 py-2 shadow-inner backdrop-blur-xl">
          <p className="text-[0.62rem] font-black uppercase tracking-[0.4em] text-slate-400">
            Official Sports Platform
          </p>
        </div>

        <div className="mt-6 text-5xl font-black italic leading-none tracking-tighter text-white/10 md:text-8xl">
          MASL <span className="text-cyan-400/30">&</span> SYNC
        </div>
      </div>
    </div>
  );
}