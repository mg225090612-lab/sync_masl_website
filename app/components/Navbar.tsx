'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase, getSessionUser } from '@/lib/supabase';
import { isAdminUser } from '@/lib/admin';
import { fetchSeasons } from '@/lib/seasons';

// spec §5.1 — top-level link recipes
const linkIdle =
  'relative flex h-16 shrink-0 items-center px-3 text-sm font-medium text-fg-mid transition-colors hover:text-fg';
const linkActive =
  'relative flex h-16 shrink-0 items-center px-3 text-sm font-semibold text-fg';

// spec §5.2 — dropdown item recipes
const itemIdle =
  'block rounded-lg px-3 py-2.5 text-sm font-medium text-fg-mid transition-colors hover:bg-surface hover:text-fg';
const itemActive =
  'block rounded-lg bg-accent/10 px-3 py-2.5 text-sm font-semibold text-accent-bright';

const dropdownPanel =
  'overlay-pop absolute left-0 top-[calc(100%+8px)] hidden w-56 rounded-xl border border-edge bg-raised p-1.5 shadow-xl shadow-black/40 group-hover:block';

// 활성 링크 하단 바 (spec §5.1: full-height link + bottom-anchored bar)
function ActiveBar() {
  return (
    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-accent" />
  );
}

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [seasons, setSeasons] = useState<string[]>([]);
  const pathname = usePathname();

  // 💡 시즌 목록을 불러와 MASL 드롭다운을 자동 구성합니다. (새 시즌 경기가 생기면 메뉴도 자동 생성)
  useEffect(() => {
    fetchSeasons().then(setSeasons).catch(() => setSeasons([]));
  }, []);

  // 💡 컴포넌트가 마운트될 때 현재 로그인한 유저 정보를 가져옵니다.
  useEffect(() => {
    // 1. 첫 로딩 시 현재 세션 확인
    // 💡 getUser()는 매번 서버에 요청을 보내므로, 네트워크 요청이 없는 세션 조회로 교체했습니다.
    getSessionUser().then(setUser);

    // 2. 로그인/로그아웃 상태가 변할 때마다 실시간으로 감지해서 버튼을 바꿔줍니다.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🔐 구글 로그인 핸들러
  const handleGoogleLogin = async () => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) alert('로그인 에러: ' + error.message);
  };

  // 🔓 로그아웃 핸들러
  const handleLogout = async () => {
    if (confirm('로그아웃 하시겠습니까?')) {
      await supabase.auth.signOut();
    }
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  // 시즌 경로 비교용 (한글/공백이 URL 인코딩돼 있을 수 있어서 디코드 후 비교)
  const decodedPath = (() => {
    try {
      return decodeURIComponent(pathname);
    } catch {
      return pathname;
    }
  })();
  const isSeasonActive = (s: string) => decodedPath === `/masl/${s}`;

  return (
    <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b border-edge bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-full w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* 왼쪽: 로고 */}
        <Link
          href="/"
          className="shrink-0 font-display text-lg font-semibold uppercase tracking-[0.04em] text-fg transition-colors hover:text-accent-bright"
        >
          MASL / GVR
        </Link>

        {/* 오른쪽: 링크 스트립 — 모바일에서는 가로 스크롤 (spec §5.1) */}
        <div className="no-scrollbar flex min-w-0 items-center gap-3 overflow-x-auto md:gap-5 md:overflow-visible">
          {/* MASL 드롭다운 */}
          <div className="group relative shrink-0">
            {/* 💡 모바일(터치/키보드)에서도 진입 가능하도록 실제 링크로 만듭니다. 데스크톱 hover 드롭다운은 그대로.
                /masl은 최신 시즌 허브로 자동 이동합니다. */}
            <Link href="/masl" className={isActive('/masl') ? linkActive : linkIdle}>
              MASL
              {isActive('/masl') && <ActiveBar />}
            </Link>
            {/* hover bridge */}
            <div className="absolute left-0 top-full h-3 w-full" />
            <div className={dropdownPanel}>
              <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-[0.08em] text-fg-dim">
                Seasons
              </p>
              {/* 💡 DB의 시즌 목록으로 자동 생성 — admin에서 새 시즌 경기를 저장하면 여기 자동 추가됩니다. */}
              {(seasons.length > 0 ? seasons : ['26 spring']).map(s => (
                <Link
                  key={s}
                  href={`/masl/${encodeURIComponent(s)}`}
                  className={isSeasonActive(s) ? itemActive : itemIdle}
                >
                  {s}
                </Link>
              ))}
            </div>
          </div>

          {/* GVR 드롭다운 */}
          <div className="group relative shrink-0">
            <Link href="/gvr/rate" className={isActive('/gvr') ? linkActive : linkIdle}>
              GVR
              {isActive('/gvr') && <ActiveBar />}
            </Link>
            {/* hover bridge */}
            <div className="absolute left-0 top-full h-3 w-full" />
            <div className={dropdownPanel}>
              <Link href="/gvr/rate" className={isActive('/gvr/rate') ? itemActive : itemIdle}>
                Rate
              </Link>
              <Link href="/gvr/view" className={isActive('/gvr/view') ? itemActive : itemIdle}>
                View
              </Link>
            </div>
          </div>

          <Link href="/champions" className={isActive('/champions') ? linkActive : linkIdle}>
            Champions
            {isActive('/champions') && <ActiveBar />}
          </Link>

          <Link href="/predictions" className={isActive('/predictions') ? linkActive : linkIdle}>
            Predictions
            {isActive('/predictions') && <ActiveBar />}
          </Link>

          {/* 💡 관리자 계정으로 로그인했을 때만 보입니다. */}
          {isAdminUser(user) && (
            <Link href="/admin" className={isActive('/admin') ? linkActive : linkIdle}>
              Admin
              {isActive('/admin') && <ActiveBar />}
            </Link>
          )}

          {/* 💡 유저 정보 유무에 따라 버튼이 바뀝니다! */}
          {user ? (
            <button
              onClick={handleLogout}
              title="클릭 시 로그아웃"
              className="ml-1 inline-flex h-9 max-w-40 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium text-fg-mid transition-colors hover:bg-surface hover:text-fg"
            >
              {/* 구글 닉네임을 보여주거나, 없다면 이메일의 @ 앞부분을 보여줍니다. */}
              <span className="truncate">
                {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="ml-1 inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-edge-strong bg-transparent px-4 text-sm font-semibold text-fg transition-colors hover:bg-surface active:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
