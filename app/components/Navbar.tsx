'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabase'; // 💡 로그인 기능을 위해 supabase 추가

export default function Navbar() {
  
  // 🔐 구글 로그인 핸들러 (사진에 보여주신 /auth/callback 으로 정확히 연결됨!)
  const handleGoogleLogin = async () => {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) alert('로그인 에러: ' + error.message);
  };

  return (
    <nav className="fixed top-0 w-full z-[100] border-b border-cyan-300/10 bg-[#06101f]/72 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        
        {/* 왼쪽: 로고 */}
        <Link
          href="/"
          className="text-2xl font-black tracking-[-0.04em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-lime-300 hover:opacity-90 transition"
        >
          MASL / GVR
        </Link>

        {/* 오른쪽: 메뉴 및 로그인 버튼 */}
        <div className="flex items-center gap-8 text-sm font-bold">
          <div className="group relative">
            <span className="cursor-pointer text-white/70 transition hover:text-cyan-300">
              MASL
            </span>
            <div className="absolute left-0 top-full h-4 w-full bg-transparent" />
            <div className="absolute -left-8 mt-4 hidden w-52 rounded-2xl border border-cyan-300/10 bg-[#081426]/95 p-2 shadow-[0_0_30px_rgba(34,211,238,0.14)] backdrop-blur-xl group-hover:block">
              <p className="px-4 pb-2 pt-3 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300/45">
                Active Season
              </p>
              <Link
                href="/masl/26s"
                className="block rounded-xl border border-cyan-300/10 bg-cyan-300/10 px-4 py-3 font-black text-cyan-200 transition hover:bg-cyan-300/18"
              >
                26 Spring
              </Link>
            </div>
          </div>

          <div className="group relative">
            <span className="cursor-pointer text-white/70 transition hover:text-lime-300">
              GVR
            </span>
            <div className="absolute left-0 top-full h-4 w-full bg-transparent" />
            <div className="absolute -left-8 mt-4 hidden w-52 rounded-2xl border border-cyan-300/10 bg-[#081426]/95 p-2 shadow-[0_0_30px_rgba(34,211,238,0.14)] backdrop-blur-xl group-hover:block">
              <Link
                href="/gvr/rate"
                className="block rounded-xl px-4 py-3 font-bold text-white/75 transition hover:bg-cyan-300/10 hover:text-cyan-200"
              >
                Rate
              </Link>
              <Link
                href="/gvr/view"
                className="block rounded-xl px-4 py-3 font-bold text-white/75 transition hover:bg-cyan-300/10 hover:text-cyan-200"
              >
                View
              </Link>
            </div>
          </div>

          <Link
            href="/champions"
            className="text-white/80 transition hover:text-cyan-300"
          >
            Champions
          </Link>

          {/* 💡 회색으로 죽어있던 Predictions를 완전히 살려냈습니다! */}
          <Link
            href="/predictions"
            className="text-white/80 transition hover:text-cyan-300"
          >
            Predictions
          </Link>

          {/* 💡 로그인 버튼 추가 */}
          <button 
            onClick={handleGoogleLogin}
            className="ml-2 rounded-full border border-cyan-400/50 bg-cyan-400/10 px-5 py-2 text-[11px] font-black tracking-widest text-cyan-300 transition-all hover:bg-cyan-400 hover:text-black uppercase shadow-[0_0_15px_rgba(34,211,238,0.2)] active:scale-95"
          >
            Sign In
          </button>
        </div>
      </div>

      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-cyan-300/20 to-lime-300/20" />
    </nav>
  );
}