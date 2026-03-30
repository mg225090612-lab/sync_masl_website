'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

export default function Masl26sPage() {
  const sports = ["남자축구", "여자축구", "남자농구", "여자배구"];
  const [activeTab, setActiveTab] = useState("남자축구");
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
          </div>
          <div className="aspect-video bg-gray-50 rounded-[3rem] border border-gray-100 flex items-center justify-center border-dashed">
             <p className="text-gray-300 font-black italic uppercase tracking-tighter">Bracket Updating...</p>
          </div>
        </div>

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
            </div>
          )}
        </div>
      </div>

      <div className="mt-40 text-center opacity-10 font-black text-6xl italic tracking-tighter select-none">
        MASL <span className="text-blue-600">&</span> SYNC
      </div>
    </div>
  );
}