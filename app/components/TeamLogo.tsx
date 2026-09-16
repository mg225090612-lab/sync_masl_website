'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { teamLogoPath } from '@/lib/teamLogo';
import { isPhotoMissing, markPhotoMissing } from '@/lib/cache';

/**
 * 팀 로고 공용 컴포넌트.
 * 같은 팀 이름이 시즌마다 다른 팀일 수 있으므로, season을 주면 그 시즌 로고를 우선 사용합니다.
 * 소스 우선순위: ① 시즌별 Storage 로고 → ② 공통 Storage 로고 → ③ /public/teams 로컬 파일 → ④ 이니셜 칩
 * 없는 로고는 한 번 확인되면 세션 동안 다시 요청하지 않습니다.
 * version: admin에서 새 로고를 올린 직후 썸네일을 강제로 새로고침할 때 씁니다.
 */
export default function TeamLogo({
  name,
  season,
  className = '',
  version = 0,
}: {
  name: string;
  season?: string | null;
  className?: string;
  version?: number;
}) {
  // 0 = 시즌 Storage, 1 = 공통 Storage, 2 = 로컬 파일, 3 = 이니셜 칩
  const initialStage = (): 0 | 1 | 2 | 3 => {
    if (!name) return 3;
    if (season && !isPhotoMissing(`team:${season}:${name}`)) return 0;
    if (!isPhotoMissing(`team:${name}`)) return 1;
    return 2;
  };
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(initialStage);

  useEffect(() => {
    setStage(initialStage());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, season, version]);

  if (stage === 3) {
    return (
      <span
        className={`flex items-center justify-center rounded-lg bg-raised text-xs font-bold text-fg-mid ${className}`}
      >
        {name ? name.charAt(0) : '?'}
      </span>
    );
  }

  let src: string;
  if (stage === 0) {
    src = `${supabase.storage.from('player-photos').getPublicUrl(teamLogoPath(name, season)).data.publicUrl}${version ? `?v=${version}` : ''}`;
  } else if (stage === 1) {
    src = `${supabase.storage.from('player-photos').getPublicUrl(teamLogoPath(name)).data.publicUrl}${version ? `?v=${version}` : ''}`;
  } else {
    src = `/teams/${name}.png`;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      onError={() => {
        if (stage === 0) markPhotoMissing(`team:${season}:${name}`);
        if (stage === 1) markPhotoMissing(`team:${name}`);
        setStage(s => (s + 1) as 0 | 1 | 2 | 3);
      }}
      className={`object-contain ${className}`}
    />
  );
}
