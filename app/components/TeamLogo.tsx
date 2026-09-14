'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { teamLogoPath } from '@/lib/teamLogo';
import { isPhotoMissing, markPhotoMissing } from '@/lib/cache';

/**
 * 팀 로고 공용 컴포넌트.
 * 소스 우선순위: ① Storage(admin에서 업로드한 로고) → ② /public/teams 로컬 파일 → ③ 이니셜 칩
 * Storage에 로고가 없는 팀은 한 번 확인되면 세션 동안 다시 요청하지 않습니다.
 * version: admin에서 새 로고를 올린 직후 썸네일을 강제로 새로고침할 때 씁니다.
 */
export default function TeamLogo({
  name,
  className = '',
  version = 0,
}: {
  name: string;
  className?: string;
  version?: number;
}) {
  // 0 = Storage 시도, 1 = 로컬 파일 시도, 2 = 이니셜 칩
  const [stage, setStage] = useState<0 | 1 | 2>(() =>
    !name ? 2 : isPhotoMissing(`team:${name}`) ? 1 : 0
  );

  useEffect(() => {
    setStage(!name ? 2 : isPhotoMissing(`team:${name}`) ? 1 : 0);
  }, [name, version]);

  if (stage === 2) {
    return (
      <span
        className={`flex items-center justify-center rounded-lg bg-raised text-xs font-bold text-fg-mid ${className}`}
      >
        {name ? name.charAt(0) : '?'}
      </span>
    );
  }

  const { data } = supabase.storage.from('player-photos').getPublicUrl(teamLogoPath(name));
  const src =
    stage === 0 ? `${data.publicUrl}${version ? `?v=${version}` : ''}` : `/teams/${name}.png`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => {
        if (stage === 0) markPhotoMissing(`team:${name}`);
        setStage(s => (s + 1) as 0 | 1 | 2);
      }}
      className={`object-contain ${className}`}
    />
  );
}
