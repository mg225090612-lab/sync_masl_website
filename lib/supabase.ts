// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 환경변수(.env.local)에 적어둔 이름표를 불러옵니다. (! 기호는 값이 무조건 있다는 뜻입니다)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 💡 auth.getUser()는 호출할 때마다 Supabase 인증 서버에 네트워크 요청을 보냅니다.
// 반면 getSession()은 브라우저에 저장된 세션을 읽기만 해서 요청이 나가지 않습니다.
// 화면에 로그인 여부/닉네임을 보여주는 용도라면 이 함수로 충분합니다.
export async function getSessionUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.user ?? null;
}