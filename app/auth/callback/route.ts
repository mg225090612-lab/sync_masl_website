import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookie = cookieStore.get(name);
            if (!cookie) return undefined;
            // 💡 꺼낼 때는 다시 원래 한글로 번역해서 읽기
            try {
              return decodeURIComponent(cookie.value);
            } catch {
              return cookie.value;
            }
          },
          set(name: string, value: string, options: CookieOptions) {
            // 💡 한글 이름 때문에 터지는 ByteString 에러 방지 (안전한 기호로 번역해서 저장)
            cookieStore.set({ name, value: encodeURIComponent(value), ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/`);
    } else {
      console.error('Auth Error:', error.message);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}