import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    // Next.js에서 브라우저 쿠키 저장소를 불러옵니다.
    const cookieStore = await cookies();
    
    // SSR 전용 Supabase 클라이언트를 생성하고 쿠키 관리 규칙을 덮어씌웁니다.
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // 구글에서 받은 코드를 세션으로 교환 (이 과정에서 위 cookies 설정에 의해 브라우저에 쿠키가 저장됨!)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 로그인 성공 시 메인 페이지로 리다이렉트
      return NextResponse.redirect(`${origin}/`);
    } else {
      console.error('인증 에러:', error.message);
    }
  }

  // 로그인 실패 시 (또는 코드가 없을 시) 메인 페이지로 리다이렉트
  return NextResponse.redirect(`${origin}/`);
}