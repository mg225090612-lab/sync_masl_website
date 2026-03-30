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

  return (
    <div className="relative min-h-screen bg-[#06101f] pt-32 px-6 pb-20 text-white">

      <div className="max-w-5xl mx-auto">

        <Link
          href={`/masl/26s/team/${encodeURIComponent(teamName)}`}
          className="text-xs tracking-[0.3em] text-cyan-300 uppercase mb-6 inline-block"
        >
          ← BACK TO TEAM
        </Link>

        <div className="grid md:grid-cols-2 gap-16">

          {/* IMAGE */}
          <div className="rounded-3xl overflow-hidden border border-cyan-400/10 bg-white/[0.04]">
            {player.photo_url ? (
              <img src={player.photo_url} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-8xl opacity-20 font-black">
                {player.player_number}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="flex flex-col justify-center">

            <h1 className="text-5xl md:text-7xl font-black italic mb-4">
              {player.name}
            </h1>

            <div className="h-[3px] w-20 bg-gradient-to-r from-cyan-400 to-lime-400 mb-8" />

            <div className="space-y-6">

              <div>
                <p className="text-xs text-cyan-300 uppercase tracking-widest">
                  TEAM
                </p>
                <p className="text-xl font-black">{player.team_name}</p>
              </div>

              <div>
                <p className="text-xs text-cyan-300 uppercase tracking-widest">
                  CATEGORY
                </p>
                <p className="text-xl font-black">
                  {player.category || 'PLAYER'}
                </p>
              </div>

              <div>
                <p className="text-xs text-cyan-300 uppercase tracking-widest">
                  NUMBER
                </p>
                <p className="text-xl font-black">
                  #{player.player_number}
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}