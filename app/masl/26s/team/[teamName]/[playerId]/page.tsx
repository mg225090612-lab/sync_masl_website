'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface PlayerPageProps {
  params: Promise<{ teamName: string; playerId: string }>;
}

export default function PlayerDetailPage({ params }: PlayerPageProps) {
  const resolvedParams = use(params);
  const teamName = decodeURIComponent(resolvedParams.teamName);
  const playerId = resolvedParams.playerId;

  const [player, setPlayer] = useState<any>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single();

      if (data) setPlayer(data);
    };

    fetch();
  }, [playerId]);

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06101f] text-white">
        <p className="text-4xl font-black italic animate-pulse">
          LOADING PLAYER...
        </p>
      </div>
    );
  }

  // 💡 무조건 스토리지의 .png 파일을 불러오도록 설정
  const { data: imgData } = supabase.storage.from('player-photos').getPublicUrl(`${player.id}.png`);
  const imageUrl = imgData.publicUrl;

  return (
    // 💡 전체 폰트를 망치던 font-sans를 제거하고, 위쪽 공백만 pt-24로 줄였습니다. (원래는 pt-32)
    <div className="relative min-h-screen bg-[#06101f] pt-18 px-6 pb-20 text-white">
      
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.08),transparent_50%)]" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* 💡 유저님이 작성하신 "원래 코드 100% 그대로" 복구했습니다. (폰트 유지, mb-6 간격 복구) */}
        <Link
          href={`/masl/26s/team/${encodeURIComponent(teamName)}`}
          className="text-xs tracking-[0.3em] text-cyan-300 uppercase mb-6 inline-block"
        >
          ← BACK TO TEAM
        </Link>

        <div className="grid md:grid-cols-12 gap-12 md:gap-20 items-center">

          {/* 📸 LEFT: PHOTO CARD */}
          <div className="md:col-span-5">
            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden border border-cyan-400/20 bg-white/[0.02] shadow-[0_0_50px_rgba(34,211,238,0.1)] group">
              {!imgError ? (
                <img 
                  src={imageUrl} 
                  alt={player.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <span className="text-[10rem] leading-none font-black italic opacity-20">
                    {player.player_number}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06101f] via-transparent to-transparent opacity-60" />
            </div>
          </div>

          {/* 📝 RIGHT: PLAYER INFO */}
          <div className="md:col-span-7 flex flex-col justify-center">
            
            <div className="inline-flex items-center gap-4 mb-4">
              <div className="h-[2px] w-12 bg-cyan-400/50"></div>
              <p className="text-sm md:text-lg font-black tracking-[0.4em] text-cyan-400 uppercase italic">
                {player.team_name}
              </p>
            </div>

            <h1 className="text-6xl md:text-[7rem] font-black italic uppercase tracking-tighter leading-[0.85] mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              {player.name}
            </h1>

            <div className="flex items-end gap-3 mb-10">
              <span className="text-3xl font-black tracking-widest text-white/30 uppercase mb-4 md:mb-6">NO.</span>
              {/* 💡 숫자 꼬리 잘림 방지를 위한 pb-6 pr-4 여백 유지 */}
              <span className="text-8xl md:text-[9.5rem] font-black italic text-transparent bg-clip-text bg-gradient-to-br from-lime-300 to-cyan-400 drop-shadow-[0_0_40px_rgba(163,230,53,0.3)] pb-6 pr-4">
                {player.player_number}
              </span>
            </div>

            <div className="h-[1px] w-full max-w-md bg-gradient-to-r from-cyan-400/30 to-transparent mb-10" />

            <div className="grid grid-cols-2 gap-8 max-w-md">
              <div>
                <p className="text-[10px] text-cyan-300 uppercase tracking-[0.3em] mb-2 font-black opacity-70">
                  CATEGORY
                </p>
                <p className="text-2xl font-black italic uppercase">
                  {player.category || 'PLAYER'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-cyan-300 uppercase tracking-[0.3em] mb-2 font-black opacity-70">
                  STATUS
                </p>
                <p className="text-2xl font-black italic uppercase text-lime-400 drop-shadow-[0_0_10px_rgba(163,230,53,0.5)]">
                  ACTIVE
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}