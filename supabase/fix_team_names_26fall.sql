-- =====================================================================
-- 26 fall 팀 이름·선수 명단 바로잡기 (공식 명단 기준)
-- 사용법: Supabase → SQL Editor → 전체 붙여넣기 → [Run]
-- 여러 번 실행해도 안전합니다. 한 번에 모두 바뀌거나, 오류가 나면 하나도 안 바뀝니다.
-- =====================================================================
begin;

-- 1. 여자배구 12학년: "She's so BAD"(배구) / "어-시니어야~" → "어~시니어야~"
--    (여자축구 "She's so BAD"는 그대로 둡니다)
update public.teams   set name = '어~시니어야~'
  where season = '26 fall' and category = '여자배구' and name = 'She''s so BAD';
update public.matches set team_a = '어~시니어야~'
  where season = '26 fall' and sport_type = '여자배구' and team_a = 'She''s so BAD';
update public.matches set team_b = '어~시니어야~'
  where season = '26 fall' and sport_type = '여자배구' and team_b = 'She''s so BAD';
update public.matches set winnder_id = '어~시니어야~'
  where season = '26 fall' and sport_type = '여자배구' and winnder_id = 'She''s so BAD';
-- 선수 명단의 빼기표(-)를 물결표(~)로 — 봄학기 우승 기록·경기 이름과도 맞춥니다.
update public.players set team_name = '어~시니어야~'
  where category = '여자배구' and team_name = '어-시니어야~';

-- 2. 남자농구 11학년: 두 가지로 적힌 이름 → "한민왕자와 공주님 찾아 삼만리"
update public.teams   set name = '한민왕자와 공주님 찾아 삼만리'
  where season = '26 fall' and name in ('한민왕자와 공주민 찾아 삼만리', '한민공주와 왕자님 찾아 삼만리');
update public.matches set team_a = '한민왕자와 공주님 찾아 삼만리'
  where season = '26 fall' and team_a in ('한민왕자와 공주민 찾아 삼만리', '한민공주와 왕자님 찾아 삼만리');
update public.matches set team_b = '한민왕자와 공주님 찾아 삼만리'
  where season = '26 fall' and team_b in ('한민왕자와 공주민 찾아 삼만리', '한민공주와 왕자님 찾아 삼만리');
update public.matches set winnder_id = '한민왕자와 공주님 찾아 삼만리'
  where season = '26 fall' and winnder_id in ('한민왕자와 공주민 찾아 삼만리', '한민공주와 왕자님 찾아 삼만리');
update public.players set team_name = '한민왕자와 공주님 찾아 삼만리'
  where season = '26 fall' and team_name in ('한민왕자와 공주민 찾아 삼만리', '한민공주와 왕자님 찾아 삼만리');

-- 3. 선수 이름·등번호를 공식 명단대로
--    이름이 같은 선수 → 번호를 고침 / 번호가 같은 선수 → 이름을 고침
--    (선수 id는 그대로라 사진·평점 기록은 유지됩니다)

-- 여자축구 · 옥지의 축구교실: 조은서 5 → 17
update public.players set player_number = 17
  where season = '26 fall' and category = '여자축구' and team_name = '옥지의 축구교실' and name = '조은서';

-- 남자농구 · 뛰면 숨참: 김하준 11 → 1, 안우진 71 → 7, 한지원 62 → 9
update public.players set player_number = 1
  where season = '26 fall' and category = '남자농구' and team_name = '뛰면 숨참' and name = '김하준';
update public.players set player_number = 7
  where season = '26 fall' and category = '남자농구' and team_name = '뛰면 숨참' and name = '안우진';
update public.players set player_number = 9
  where season = '26 fall' and category = '남자농구' and team_name = '뛰면 숨참' and name = '한지원';

-- 남자농구 · 조현진의 삼두근: 2번 채태윤 → 채태운, 3번 이에녹 → 이예반
update public.players set name = '채태운'
  where season = '26 fall' and category = '남자농구' and team_name = '조현진의 삼두근' and player_number = 2 and name = '채태윤';
update public.players set name = '이예반'
  where season = '26 fall' and category = '남자농구' and team_name = '조현진의 삼두근' and player_number = 3 and name = '이에녹';

-- 남자농구 · 추승환의 농구교실: 이주원 11 → 1, 김세윤 67 → 4
update public.players set player_number = 1
  where season = '26 fall' and category = '남자농구' and team_name = '추승환의 농구교실' and name = '이주원';
update public.players set player_number = 4
  where season = '26 fall' and category = '남자농구' and team_name = '추승환의 농구교실' and name = '김세윤';

commit;

-- 확인용: 아래 결과에서 두 팀의 이름이 팀 목록·선수 명단·경기에 똑같이 보이면 성공!
select '팀 목록' as 어디, name as 팀이름, count(*) as 개수 from public.teams
  where season = '26 fall' and (name like '%시니어%' or name like '%삼만리%') group by name
union all
select '선수 명단', team_name, count(*) from public.players
  where season = '26 fall' and (team_name like '%시니어%' or team_name like '%삼만리%') group by team_name
union all
select '경기', t, count(*) from (
  select team_a as t from public.matches where season = '26 fall'
  union all select team_b from public.matches where season = '26 fall'
) x where t like '%시니어%' or t like '%삼만리%' group by t;
