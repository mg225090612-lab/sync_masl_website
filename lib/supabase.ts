// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 환경변수(.env.local)에 적어둔 이름표를 불러옵니다. (! 기호는 값이 무조건 있다는 뜻입니다)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);