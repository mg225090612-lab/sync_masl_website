'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
// 경로가 꼬인다면 '../../../../../../../lib/supabase'로 수정해 보세요!
import { supabase } from '@/lib/supabase';

interface PlayerPageProps {
  params: Promise<{ 
    teamName: string; 
    playerId: string; 
  }>;
}

export default function PlayerDetailPage({ params }: PlayerPageProps) {
  // team 페이지에서 해결했던 방식 그대로 use()를 사용합니다.
  const resolvedParams = use(params);
  const teamName = decodeURIComponent(resolvedParams.teamName);
  const playerId = resolvedParams.playerId;

  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;

    const fetchPlayer = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();
      
      if (data) setPlayer(data);
      setLoading(false);
    };

    fetchPlayer();
  }, [playerId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="font-black italic text-gray-200 animate-pulse text-4xl uppercase tracking-widest">
          Loading Player...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 pt-32 px-6 text-black font-sans">
      <div className="max-w-4xl mx-auto">
        {/* 뒤로가기: 팀 페이지로 이동 */}
        <Link 
          href={`/masl/26s/team/${encodeURIComponent(teamName)}`} 
          className="text-[0.6rem] font-black text-blue-600 uppercase tracking-[0.3em] mb-8 inline-block hover:opacity-50 transition-opacity"
        >
          ← Back to Team
        </Link>

        {player ? (
          <div className="grid md:grid-cols-2 gap-16 mt-10">
            {/* 왼쪽: 선수 사진 섹션 */}
            <div className="aspect-[3/4] rounded-[3.5rem] bg-gray-50 overflow-hidden border border-gray-100 shadow-2xl relative">
              {player.photo_url ? (
                <img src={player.photo_url} className="w-full h-full object-cover" alt={player.name} />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-9xl opacity-10 font-black italic text-gray-400">
                  {player.player_number}
                </div>
              )}
              <div className="absolute top-8 left-8 bg-black text-white px-6 py-2 rounded-full font-black italic text-xl shadow-xl">
                NO.{player.player_number}
              </div>
            </div>

            {/* 오른쪽: 선수 프로필 정보 */}
            <div className="flex flex-col justify-center">
              <h1 className="text-8xl font-black italic tracking-tighter uppercase mb-2 leading-none break-all">
                {player.name}
              </h1>
              <div className="h-2 w-24 bg-blue-600 mb-10"></div>
              
              <div className="space-y-6">
                <div>
                  <p className="text-[0.6rem] font-black text-gray-300 uppercase tracking-widest mb-1">Affiliation</p>
                  <p className="text-2xl font-black italic uppercase tracking-tight">{player.team_name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[0.6rem] font-black text-gray-300 uppercase tracking-widest mb-1">Position</p>
                    <p className="text-xl font-black italic uppercase">{player.position || 'PLAYER'}</p>
                  </div>
                  <div>
                    <p className="text-[0.6rem] font-black text-gray-300 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-xl font-black italic uppercase text-blue-600 animate-pulse">On Field</p>
                  </div>
                </div>
              </div>

              {/* 하단 장식 요소 */}
              <div className="mt-20 opacity-20 font-black text-4xl italic tracking-tighter select-none pointer-events-none">
                MASL <span className="text-blue-600">&</span> SYNC
              </div>
            </div>
          </div>
        ) : (
          <div className="py-40 text-center">
            <p className="text-gray-200 font-black italic text-2xl uppercase">Player Not Found</p>
          </div>
        )}
      </div>
    </div>
  );
}