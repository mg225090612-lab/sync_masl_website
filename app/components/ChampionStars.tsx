'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { useChampionTitles, type ChampionTitle } from '@/lib/champions';

/**
 * 🏆 우승 별 — 팀 이름 옆에 우승 횟수만큼 ★을 붙입니다.
 * - 마우스를 올리면: "2026년 봄학기 남자축구 우승"
 * - 클릭하면: 별이 커지면서 한 바퀴 돌고, 바탕을 클릭해야 닫힙니다.
 * 카드 전체가 링크인 곳에서도 별을 누를 때 페이지가 넘어가지 않도록 막아둡니다.
 */
export default function ChampionStars({ team, size = 'sm' }: { team: string | null | undefined; size?: 'sm' | 'md' | 'lg' }) {
  const titles = useChampionTitles(team);
  const [tip, setTip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [opened, setOpened] = useState<ChampionTitle | null>(null);

  if (titles.length === 0) return null;

  const px = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';

  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      <span className="inline-flex shrink-0 items-center gap-0.5 align-middle" aria-label={`우승 ${titles.length}회`}>
        {titles.map(t => (
          <button
            key={`${t.sport}-${t.season}`}
            type="button"
            aria-label={t.label}
            onClick={e => {
              stop(e);
              setTip(null);
              setOpened(t);
            }}
            onMouseEnter={e => {
              const r = e.currentTarget.getBoundingClientRect();
              setTip({ text: t.label, x: r.left + r.width / 2, y: r.top });
            }}
            onMouseLeave={() => setTip(null)}
            className="cursor-pointer rounded-sm text-away transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:outline-away"
          >
            <StarIcon className={px} />
          </button>
        ))}
      </span>

      {tip && typeof document !== 'undefined' &&
        createPortal(
          <span
            role="tooltip"
            style={{ left: tip.x, top: tip.y - 8 }}
            className="overlay-pop pointer-events-none fixed z-[120] -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-away/30 bg-raised px-2.5 py-1.5 text-xs font-semibold text-fg shadow-xl shadow-black/40"
          >
            🏆 {tip.text}
          </span>,
          document.body
        )}

      {opened && <StarOverlay title={opened} team={team || ''} onClose={() => setOpened(null)} />}
    </>
  );
}

function StarOverlay({ title, team, onClose }: { title: ChampionTitle; team: string; onClose: () => void }) {
  // Esc 키로도 닫을 수 있게 (키보드 사용자용)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    // 💡 포털 안의 클릭도 React에서는 부모(링크 카드)로 전달되므로 여기서 막습니다.
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title.label}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onClose(); // 바탕 클릭 → 닫기
      }}
      className="fixed inset-0 z-[110] flex cursor-pointer flex-col items-center justify-center bg-canvas/85 px-6 backdrop-blur-sm"
    >
      <div
        onClick={e => {
          e.preventDefault();
          e.stopPropagation(); // 별·글씨를 눌러도 닫히지 않게 (바탕만 닫힘)
        }}
        className="flex cursor-default flex-col items-center text-center"
      >
        <span className="champion-star-spin text-away drop-shadow-[0_0_40px_rgba(251,191,36,0.45)]">
          <StarIcon className="h-48 w-48 md:h-64 md:w-64" />
        </span>
        <p className="overlay-pop mt-8 font-display text-xs font-semibold uppercase tracking-[0.14em] text-away">
          Champion
        </p>
        <p className="overlay-pop mt-2 text-2xl font-extrabold leading-[1.3] text-fg md:text-3xl">{team}</p>
        <p className="overlay-pop mt-2 text-[15px] font-medium text-fg-mid">{title.label}</p>
      </div>
      <p className="absolute bottom-10 text-xs text-fg-dim">바탕을 누르면 돌아갑니다</p>
    </div>,
    document.body
  );
}

function StarIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z" />
    </svg>
  );
}
