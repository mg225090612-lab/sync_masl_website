'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase'; 

interface PageProps {
  params: Promise<{ teamName: string }>;
}

export default function TeamPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const teamName = decodeURIComponent(resolvedParams.teamName);
  
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teamName) return;
    const fetchSquad = async () => {
      setLoading(true);
      const { data } = await supabase
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
        <Link href="/masl/26s" className="text-[0.6rem] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 inline-block hover:opacity-50">
          ← Back to Hub
        </Link>
        <h1 className="text-8xl font-black italic tracking-tighter uppercase mb-20 break-all leading-none">
          {teamName}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {players.map(p => (
            /* 기존 카드 디자인 그대로 유지하면서 Link만 추가 */
            <Link key={p.id} href={`/masl/26s/team/${encodeURIComponent(teamName)}/${p.id}`} className="group">
              <div className="aspect-[3/4] rounded-[2.5rem] bg-gray-50 overflow-hidden mb-4 relative border border-gray-100 group-hover:shadow-2xl transition-all">
                {p.photo_url ? (
                  <img src={p.photo_url} className="w-full h-full object-cover" alt={p.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl opacity-10 font-black italic text-gray-400">
                    {p.player_number}
                  </div>
                )}
              </div>
              <h3 className="text-center font-black text-xl tracking-tight uppercase leading-none">{p.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}