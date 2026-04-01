'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // 💡 useRouter 추가
import { supabase } from '@/lib/supabase';

interface PageProps {
  params: Promise<{ teamName: string }>;
}

export default function TeamPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const teamName = decodeURIComponent(resolvedParams.teamName);
  const router = useRouter(); // 💡 라우터 초기화

  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('players')
        .select('*')
        .eq('team_name', teamName)
        .order('player_number');

      if (data) setPlayers(data);
      setLoading(false);
    };

    fetch();
  }, [teamName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06101f] text-white">
        <p className="animate-pulse text-4xl font-black italic">
          LOADING TEAM...
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#06101f] pt-32 px-6 pb-20 text-white">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.12),transparent_30%)]" />

      <div className="max-w-6xl mx-auto">

        {/* 💡 수정된 BACK 버튼: 클릭 시 바로 직전 페이지로 이동 */}
        <button
          onClick={() => router.back()}
          className="text-xs tracking-[0.3em] text-cyan-300 uppercase mb-6 inline-block hover:text-white transition-colors"
        >
          ← BACK
        </button>

        {/* TITLE */}
        <h1 className="text-5xl md:text-8xl font-black italic tracking-[-0.05em] mb-16">
          {teamName}
        </h1>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {players.map((p) => (
            <PlayerCard key={p.id} p={p} teamName={teamName} />
          ))}
        </div>
      </div>
    </div>
  );
}

// PlayerCard 컴포넌트는 그대로 유지하시면 됩니다!
function PlayerCard({ p, teamName }: { p: any; teamName: string }) {
  const [imgError, setImgError] = useState(false);
  const { data } = supabase.storage.from('player-photos').getPublicUrl(`${p.id}.png`);
  const imageUrl = data.publicUrl;

  return (
    <Link
      href={`/masl/26s/team/${encodeURIComponent(teamName)}/${p.id}`}
      className="group"
    >
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-white/[0.04] backdrop-blur-xl transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]">
        <div className="aspect-[3/4] flex items-center justify-center relative bg-black/20">
          {!imgError ? (
            <img 
              src={imageUrl} 
              alt={p.name}
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              onError={() => setImgError(true)} 
            />
          ) : (
            <div className="text-5xl opacity-20 font-black italic">
              {p.player_number}
            </div>
          )}
        </div>
        <div className="p-3 text-center">
          <p className="font-black text-sm">{p.name}</p>
        </div>
      </div>
    </Link>
  );
}