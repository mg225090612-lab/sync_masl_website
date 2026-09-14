'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchSeasons } from '@/lib/seasons';

// 💡 /masl 진입 시 가장 최신 시즌 허브로 자동 이동합니다.
export default function MaslIndexPage() {
  const router = useRouter();

  useEffect(() => {
    fetchSeasons()
      .then(list => {
        const latest = list[0] || '26 spring';
        router.replace(`/masl/${encodeURIComponent(latest)}`);
      })
      .catch(() => {
        router.replace(`/masl/${encodeURIComponent('26 spring')}`);
      });
  }, [router]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      <div className="h-40 animate-pulse rounded-xl border border-edge bg-surface" />
    </div>
  );
}
