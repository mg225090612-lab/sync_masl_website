'use client';

<<<<<<< HEAD
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 
=======
import { useMemo, useState } from 'react';
>>>>>>> 403b07adad19b689afddc8c45536662106595b6d

type SportTab = '남자축구' | '여자축구' | '남자농구' | '여자배구';

<<<<<<< HEAD
  useEffect(() => {
    const loadHubData = async () => {
      setLoading(true);
      // DB 컬럼명 확인: sport_type 혹은 category
      const { data } = await supabase
        .from('players')
        .select('team_name')
        .eq('sport_type', activeTab);

      if (data) {
        const uniqueTeams = Array.from(new Set(data.map(p => p.team_name)));
        setTeams(uniqueTeams as string[]);
      }
      setLoading(false);
    };
    loadHubData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white pb-20 pt-32 px-6 font-sans text-black">
      <div className="max-w-5xl mx-auto mb-16">
        <h1 className="text-7xl font-black italic tracking-tighter mb-4 uppercase leading-none">
          26 <span className="text-blue-600">Spring</span> Hub
        </h1>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-4 border-b border-gray-100">
          {sports.map(s => (
            <button 
              key={s} 
              onClick={() => setActiveTab(s)}
              className={`px-8 py-3 rounded-full font-black text-sm transition-all whitespace-nowrap ${
                activeTab === s ? 'bg-black text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 🔥 Upcoming Match 섹션 추가 */}
      <div className="max-w-5xl mx-auto mb-16">
        <h3 className="text-xl font-black italic uppercase tracking-widest text-gray-300 mb-6">Upcoming Match</h3>
        <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl bg-gray-900 group">
          {/* 배너 배경 사진 */}
          <img 
            src="/images/match_260404_1.png" 
            alt="Match Background" 
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
          
          <div className="absolute inset-0 flex items-center justify-around px-10">
            {/* 왼쪽 팀 (클릭 시 이동) */}
            <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="flex flex-col items-center group/team">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 group-hover/team:border-blue-600 transition-all shadow-xl mb-4">
                <img src="/teams/김영준에게 축구를 배우다.jpg" alt="Home Team" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-black italic text-xl md:text-2xl uppercase tracking-tighter">Barsat</span>
            </Link>

            {/* 중간 VS 표시 */}
            <div className="flex flex-col items-center">
              <span className="text-5xl md:text-7xl font-black italic text-blue-600 drop-shadow-2xl">VS</span>
              <div className="mt-4 px-4 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <p className="text-[0.6rem] text-white font-black uppercase tracking-widest text-center">March 31 / 18:00</p>
              </div>
            </div>

            {/* 오른쪽 팀 (클릭 시 이동) */}
            <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="flex flex-col items-center group/team">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/20 group-hover/team:border-blue-600 transition-all shadow-xl mb-4">
                <img src="/teams/빵빵이의 축구교실.jpg" alt="Away Team" className="w-full h-full object-cover" />
              </div>
              <span className="text-white font-black italic text-xl md:text-2xl uppercase tracking-tighter">Okji FC</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black italic uppercase tracking-widest text-gray-300">Tournament Bracket</h3>
            <span className="text-[0.6rem] bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-black uppercase">Coming Soon</span>
=======
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
>>>>>>> 403b07adad19b689afddc8c45536662106595b6d
          </div>

<<<<<<< HEAD
        <div className="space-y-4">
          <h3 className="text-xl font-black mb-6 italic uppercase tracking-widest">Participating Teams</h3>
          {loading ? (
            <div className="text-gray-300 font-black animate-pulse py-10 text-center bg-gray-50 rounded-2xl uppercase italic">Loading...</div>
          ) : teams.length > 0 ? (
            teams.map(name => (
              <Link href={`/masl/26s/team/${encodeURIComponent(name)}`} key={name} className="block group">
                <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent group-hover:border-blue-600 group-hover:bg-white transition-all shadow-sm">
                  <span className="font-black text-lg tracking-tight italic uppercase">{name}</span>
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs group-hover:bg-blue-600 group-hover:text-white font-black transition-colors shadow-sm">→</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="py-20 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
              <p className="text-gray-300 text-xs font-black uppercase italic">No teams registered</p>
=======
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
>>>>>>> 403b07adad19b689afddc8c45536662106595b6d
            </div>

<<<<<<< HEAD
      <div className="mt-40 text-center opacity-10 font-black text-6xl italic tracking-tighter select-none">
        MASL <span className="text-blue-600">&</span> SYNC
=======
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
>>>>>>> 403b07adad19b689afddc8c45536662106595b6d
      </div>
    </div>
  );
}