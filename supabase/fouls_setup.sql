-- =====================================================================
-- 팀 파울 기록 칸 추가 (농구 라이브 중계용)
-- 사용법: Supabase → SQL Editor → 전체 붙여넣기 → [Run]
-- 여러 번 실행해도 안전합니다. 기존 데이터는 바뀌지 않습니다.
-- =====================================================================

-- 지금 쿼터의 팀 파울 수. 쿼터가 끝나면 관리자 화면에서 자동으로 0이 됩니다.
alter table public.matches
  add column if not exists fouls_a integer not null default 0,
  add column if not exists fouls_b integer not null default 0;

-- 확인용: 아래에 fouls_a, fouls_b 두 줄이 나오면 성공!
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'matches'
  and column_name in ('fouls_a', 'fouls_b');
