-- =====================================================================
-- 실시간 라이브 점수 기능 준비 SQL
-- 사용법: Supabase → SQL Editor → 전체 붙여넣기 → [Run]
-- 여러 번 실행해도 안전합니다. (이미 있는 것은 건너뜁니다)
-- 기존 경기·점수 데이터는 지우거나 바꾸지 않습니다.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. 경기 표(matches)에 "경기 상태" 칸 추가
--    scheduled = 예정 / live = 진행 중 / finished = 종료
-- ---------------------------------------------------------------------
alter table public.matches
  add column if not exists status text not null default 'scheduled';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'matches_status_check'
  ) then
    alter table public.matches
      add constraint matches_status_check
      check (status in ('scheduled', 'live', 'finished'));
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 2. 타임라인 글을 모아두는 표(match_events) 만들기
-- ---------------------------------------------------------------------
create table if not exists public.match_events (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches(id) on delete cascade,
  minute     integer,                         -- 몇 분 (비워도 됨)
  content    text not null,                   -- 내용 예: "김민준 선수 골!"
  created_at timestamptz not null default now()
);

create index if not exists match_events_match_id_idx
  on public.match_events (match_id, created_at);


-- ---------------------------------------------------------------------
-- 3. 보안 규칙: 누구나 볼 수 있고, 관리자만 쓰기/수정/삭제
--    관리자 이메일은 lib/admin.ts 의 ADMIN_EMAILS 와 똑같이 맞춰야 합니다.
-- ---------------------------------------------------------------------
alter table public.match_events enable row level security;

drop policy if exists "match_events 누구나 읽기" on public.match_events;
create policy "match_events 누구나 읽기"
  on public.match_events for select
  to anon, authenticated
  using (true);

drop policy if exists "match_events 관리자만 쓰기" on public.match_events;
create policy "match_events 관리자만 쓰기"
  on public.match_events for all
  to authenticated
  using (
    (auth.jwt() ->> 'email') in (
      'mg225090612@gvcs-mg.org',
      'mg223100071@gvcs-mg.org',
      'mg223100141@gvcs-mg.org',
      'mg224081322@gvcs-mg.org',
      'mg225100342@gvcs-mg.org',
      'mg223080612@gvcs-mg.org',
      'mg225090451@gvcs-mg.org',
      'mg224101122@gvcs-mg.org'
    )
  )
  with check (
    (auth.jwt() ->> 'email') in (
      'mg225090612@gvcs-mg.org',
      'mg223100071@gvcs-mg.org',
      'mg223100141@gvcs-mg.org',
      'mg224081322@gvcs-mg.org',
      'mg225100342@gvcs-mg.org',
      'mg223080612@gvcs-mg.org',
      'mg225090451@gvcs-mg.org',
      'mg224101122@gvcs-mg.org'
    )
  );


-- ---------------------------------------------------------------------
-- 4. 실시간(Realtime) 켜기: 두 표가 바뀌면 바로 화면에 송출
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'matches'
  ) then
    alter publication supabase_realtime add table public.matches;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'match_events'
  ) then
    alter publication supabase_realtime add table public.match_events;
  end if;
end $$;


-- ---------------------------------------------------------------------
-- 5. 확인용: 아래 결과에 matches, match_events 두 줄이 나오면 성공!
-- ---------------------------------------------------------------------
select tablename as "실시간 켜진 표"
from pg_publication_tables
where pubname = 'supabase_realtime' and schemaname = 'public'
  and tablename in ('matches', 'match_events');
