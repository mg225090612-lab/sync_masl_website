import { colorSwatches, type TeamInfo } from '@/lib/teamInfo';

/** 팀 학년 · 팀 색깔 칩 (예: [12학년] [● 검정색]) */
export default function TeamInfoChips({ info, small = false }: { info: Pick<TeamInfo, 'grade' | 'color'> | null; small?: boolean }) {
  if (!info || (!info.grade && !info.color)) return null;
  const chip = `inline-flex items-center gap-1.5 rounded-full border border-edge bg-raised font-semibold text-fg-mid ${
    small ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs'
  }`;
  const swatches = colorSwatches(info.color);
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {info.grade && <span className={chip}>{info.grade}</span>}
      {info.color && (
        <span className={chip}>
          {swatches.map((c, i) => (
            <span key={i} aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full border border-white/20" style={{ backgroundColor: c }} />
          ))}
          {info.color}
        </span>
      )}
    </span>
  );
}
