-- =====================================================================
-- 구간(전반·후반 / 쿼터 / 세트) 점수 기록 칸 추가
-- 사용법: Supabase → SQL Editor → 전체 붙여넣기 → [Run]
-- 여러 번 실행해도 안전합니다. 기존 데이터는 바뀌지 않습니다.
-- =====================================================================

-- 끝난 구간들의 점수를 순서대로 저장합니다. 예: [{"a":25,"b":20},{"a":18,"b":25}]
alter table public.matches
  add column if not exists periods jsonb not null default '[]'::jsonb;

-- 확인용: 아래에 periods 한 줄이 나오면 성공!
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'matches' and column_name = 'periods';
