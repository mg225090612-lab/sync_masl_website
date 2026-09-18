import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14 flex flex-col gap-6">
      {/* 티커 애니메이션을 위한 CSS */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}</style>

      {/* 1. 상단: 무한 스크롤 텍스트 티커 */}
      <div className="w-full overflow-hidden flex whitespace-nowrap border-y border-edge py-3 bg-surface">
        <div className="flex animate-marquee text-sm sm:text-base font-display font-semibold uppercase tracking-widest text-fg-dim">
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
          <span>MASL 2026 SEASON /// SYNC THE MOMENT /// GIVE YOUR ALL IN THE GAME. ///&nbsp;</span>
        </div>
      </div>

      {/* 메인 화면 분할 영역 (Grid Layout) */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* 2. 왼쪽: 메인 타이틀 및 GVR 버튼 */}
        <div className="flex-[1.2] flex flex-col justify-center rounded-2xl border border-edge bg-surface p-8 lg:p-12 relative overflow-hidden">
          <div className="space-y-2 mb-8">
            <h1 className="font-display text-5xl sm:text-6xl font-semibold uppercase leading-[1.1] text-fg">
              Assess the Field, Validate the Grade.
            </h1>
            <h2 className="font-display text-4xl sm:text-5xl font-semibold uppercase text-fg-dim">
              MASL 2026
            </h2>
          </div>
          <p className="max-w-lg text-[15px] leading-[1.65] text-fg-mid mb-10">
            경기 후 선수의 퍼포먼스를 내 손으로 직접 평가하세요.<br/>
            당신의 한 표가 이번 시즌 최고의 선수를 결정합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* 수정된 GVR 평점 남기기 버튼 (오른쪽 버튼과 동일한 배경, 흰색 글씨) */}
            <Link 
              href="/gvr/rate" 
              className="flex items-center justify-center rounded-full border border-edge bg-surface px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-raised"
            >
              GVR 평점 남기기
            </Link>
            <Link 
              href="/gvr/view" 
              className="flex items-center justify-center rounded-full border border-edge bg-surface px-8 py-3.5 text-sm font-semibold text-fg transition-colors hover:bg-raised"
            >
              현재 GVR 랭킹
            </Link>
          </div>
        </div>

        {/* 3. 오른쪽: 정보 영역 (위/아래 분할) */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* 오른쪽 위: 매니페스토 (Isaiah 43:19) */}
          <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-edge bg-surface p-8 relative overflow-hidden group">
            {/* 배경 워터마크 효과 */}
            <h2 className="absolute top-1/2 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 text-center font-display text-[15vw] lg:text-[7vw] font-bold uppercase tracking-tighter text-edge opacity-30 select-none pointer-events-none transition-transform duration-700 group-hover:scale-110">
              ISAIAH
            </h2>
            <div className="relative z-10 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
                ISAIAH 43:19
              </p>
              <h3 className="font-display text-3xl sm:text-4xl font-semibold uppercase leading-[1.1] text-fg">
                DOING A NEW THING
              </h3>
            </div>
          </div>

          {/* 오른쪽 아래: 남/여 결승전 날짜 */}
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Men's Soccer */}
            <div className="flex-1 rounded-2xl border border-edge bg-surface p-6 text-center transition-colors hover:bg-raised group">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-fg-mid">
                MEN'S SOCCER
              </p>
              <h3 className="mb-5 font-display text-xl font-semibold uppercase text-fg">
                THE GRAND FINAL
              </h3>
              <div className="inline-block rounded-md border border-edge bg-canvas px-4 py-2 font-display text-lg font-medium text-fg transition-transform group-hover:scale-105">
                2026. 9. 21.
              </div>
            </div>
            
            {/* Women's Soccer */}
            <div className="flex-1 rounded-2xl border border-edge bg-surface p-6 text-center transition-colors hover:bg-raised group">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-fg-mid">
                WOMEN'S SOCCER
              </p>
              <h3 className="mb-5 font-display text-xl font-semibold uppercase text-fg">
                THE GRAND FINAL
              </h3>
              <div className="inline-block rounded-md border border-edge bg-canvas px-4 py-2 font-display text-lg font-medium text-fg transition-transform group-hover:scale-105">
                2026. 9. 21.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}