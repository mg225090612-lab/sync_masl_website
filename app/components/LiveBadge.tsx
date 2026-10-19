// 🔴 깜빡이는 LIVE 배지 — 진행 중인 경기 표시용 (색: --color-danger)
export default function LiveBadge({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-danger/30 bg-danger/10 font-display font-semibold uppercase tracking-[0.08em] text-danger ${
        small ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
      </span>
      Live
    </span>
  );
}
