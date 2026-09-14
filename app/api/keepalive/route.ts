import { NextResponse } from 'next/server';

// 💡 Supabase 무료 플랜은 7일간 요청이 없으면 자동 일시정지됩니다.
// 이 라우트는 DB에 아주 가벼운 조회 1번을 보내는 "심장박동" 역할입니다.
// vercel.json의 cron이 매일 한 번 호출해서 프로젝트가 잠들지 않게 합니다.
export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  try {
    const res = await fetch(`${url}/rest/v1/matches?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      cache: 'no-store',
    });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ ok: false, status: 0 }, { status: 502 });
  }
}
