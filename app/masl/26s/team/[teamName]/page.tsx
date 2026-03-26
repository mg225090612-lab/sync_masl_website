'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Next.js 최신 버전의 가이드에 따라 params를 처리합니다.
export default function TeamPage({ params }: { params: Promise<{ teamName: string }> }) {
  // params를 안전하게 가져옵니다.
  const resolvedParams = use(params);
  const teamName = decodeURIComponent(resolvedParams.teamName);
  
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamName) return;

    const fetchSquad = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_name', teamName)
        .order('player_number', { ascending: true });
      
      if (data) setPlayers(data);
      setLoading(false);
    };

    fetchSquad();
  }, [teamName]);

  return (
    <div className="min-h-screen bg-white pb-20 pt-32 px-6 text-black font-sans">
      <div className="max-w-6xl mx-auto">
        {/* 뒤로가기 버튼 */}
        <Link href="/masl/26s" className="text-[0.6rem] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 inline-block hover:opacity-50 transition-opacity">
          ← Back to Hub
        </Link>
        
        {/* 팀 이름 제목 */}
        <h1 className="text-8xl font-black italic tracking-tighter uppercase mb-20 break-all leading-none">
          {teamName}
        </h1>

        {/* 선수 명단 그리드 */}
        {loading ? (
          <div className="py-20 text-center font-black text-gray-200 animate-pulse uppercase tracking-widest text-4xl italic">Loading Squad...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {players.map(p => (
              <Link 
                href={`/masl/26s/team/${encodeURIComponent(teamName)}/player/${p.id}`} 
                key={p.id} 
                className="group"
              >
                <div className="aspect-[3/4] rounded-[2.5rem] bg-gray-50 overflow-hidden mb-4 relative border border-gray-100 group-hover:shadow-2xl transition-all group-hover:-translate-y-2">
                  {p.photo_url ? (
                    <img src={p.photo_url} className="w-full h-full object-cover" alt={p.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl opacity-10 font-black italic text-gray-400">
                      {p.player_number}
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[0.6rem] font-black italic shadow-sm border border-gray-100">
                    No.{p.player_number}
                  </div>
                </div>
                <h3 className="text-center font-black text-xl tracking-tight group-hover:text-blue-600 transition-colors">
                  {p.name}
                </h3>
              </Link>
            ))}
          </div>
        )}

        {/* 데이터가 없을 때 표시 */}
        {!loading && players.length === 0 && (
          <div className="py-32 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
            <p className="text-gray-300 font-black italic tracking-widest uppercase">No Players Registered</p>
          </div>
        )}
      </div>

      {/* 하단 푸터 디자인 */}
      <div className="mt-40 text-center opacity-10 font-black text-7xl italic tracking-tighter select-none pointer-events-none">
        MASL <span className="text-blue-600">&</span> SYNC
      </div>
    </div>
  );
}