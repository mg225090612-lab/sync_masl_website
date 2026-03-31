'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type SportTab = '남자축구' | '여자축구' | '남자농구' | '여자배구';

export default function Masl26sPage() {
  const sports: SportTab[] = ["남자축구", "여자축구", "남자농구", "여자배구"];
  const [activeTab, setActiveTab] = useState<SportTab>("남자축구");
  const [teams, setTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHubData = async () => {
      setLoading(true);
      
      // players 테이블에서 선택된 종목(category)의 team_name들 가져오기
      const { data, error } = await supabase
        .from('players')
        .select('team_name')
        .eq('category', activeTab);

      if (data) {
        // 중복 제거하여 팀 이름 리스트 생성
        const uniqueTeams = Array.from(new Set(data.map(p => p.team_name)));
        setTeams(uniqueTeams as string[]);
      }
      setLoading(false);
    };
    loadHubData();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-white pb-20 pt-32 px-6 font-sans text-black">
      {/* 제목 섹션 */}
      <div className="max-w-5xl mx-auto mb-16">
        <h1 className="text-7xl font-black italic tracking-tighter mb-4 uppercase leading-none">
          26 <span className="text-blue-600">Spring</span> Hub
        </h1>
        
        {/* 종목 선택 탭 */}
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

      <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-12">
        {/* 왼쪽: Upcoming Match (배너 사진 포함) */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-widest text-gray-300 mb-6">Upcoming Match</h3>
            <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl bg-gray-900 group">
              <img 
                src="/images/match_bg.png" 
                alt="Match Background" 
                className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 flex items-center justify-around px-10">
                <Link href={`/masl/26s/team/${encodeURIComponent("김영준에게 축구를 배우다")}`} className="group/team flex flex-col items-center">
                   <img src="/teams/김영준에게 축구를 배우다.png" className="w-24 h-24 md:w-32 md:h-32 object-contain group-hover/team:scale-110 transition-transform" />
                </Link>
                <span className="text-5xl md:text-7xl font-black italic text-blue-600">VS</span>
                <Link href={`/masl/26s/team/${encodeURIComponent("빵빵이의 축구교실")}`} className="group/team flex flex-col items-center">
                   <img src="/teams/빵빵이의 축구교실.png" className="w-24 h-24 md:w-32 md:h-32 object-contain group-hover/team:scale-110 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* 대진표 섹션 */}
          <div>
            <h3 className="text-xl font-black italic uppercase tracking-widest text-gray-300 mb-6">Tournament Bracket</h3>
            <div className="aspect-video bg-gray-50 rounded-[3rem] border border-gray-100 flex items-center justify-center border-dashed">
               <p className="text-gray-300 font-black italic uppercase tracking-tighter">Bracket Updating...</p>
            </div>
          </div>
        </div>

        {/* 오른쪽: 팀 리스트 */}
        <div className="space-y-4">
          <h3 className="text-xl font-black mb-6 italic uppercase tracking-widest">Participating Teams</h3>
          {loading ? (
            <div className="text-gray-300 font-black animate-pulse py-10 text-center">Loading...</div>
          ) : (
            teams.map(name => (
              <Link href={`/masl/26s/team/${encodeURIComponent(name)}`} key={name} className="block group">
                <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent group-hover:border-blue-600 group-hover:bg-white transition-all shadow-sm">
                  <span className="font-black text-lg tracking-tight italic uppercase">{name}</span>
                  <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs group-hover:bg-blue-600 group-hover:text-white font-black transition-colors shadow-sm">→</span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      <div className="mt-40 text-center opacity-10 font-black text-6xl italic tracking-tighter select-none">
        MASL <span className="text-blue-600">&</span> SYNC
      </div>
    </div>
  );
}