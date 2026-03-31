import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    // 이미 lib/supabase.ts 등에 설정하신 것과 동일한 정보로 클라이언트를 생성합니다.
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 구글에서 받은 코드를 세션으로 교환 (이 과정에서 로그인이 완료됨)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 로그인 성공 시 메인 페이지로 리다이렉트
      return NextResponse.redirect(`${origin}/`);
    }
  }

  // 로그인 실패 시 메인 페이지로 리다이렉트 (또는 에러 페이지)
  return NextResponse.redirect(`${origin}/`);
}