// lib/champions.ts
// 💡 역대 우승 기록. Champions 페이지와 팀 이름 옆 우승 별(★)이 함께 씁니다.
// - HALL_OF_FAME: 직접 적어두는 공식 기록 (사진·기수 정보 포함). 새 시즌 우승 팀은 여기에 추가하세요.
// - 여기 없는 시즌이라도 DB에서 결승(round 2) 결과가 나오면 별은 자동으로 붙습니다.
'use client';

import { useEffect, useState } from 'react';
import type { ChampionItem } from './types';
import { supabase } from './supabase';
import { cachedQuery } from './cache';

// 📝 챔피언 데이터 (최신 시즌이 위로 오도록)
export const HALL_OF_FAME: ChampionItem[] = [
  {
    sport: '남자축구',
    emoji: '⚽',
    history: [
      { season: '26 Spring', winner: '김영준에게 축구를 배우다', class: 'Class of 2027', photo: '' },
      { season: '25 Fall', winner: '빵빵이의 축구교실', class: 'Class of 2028', photo: '/champions/남자축구 25F.JPG' },
    ],
  },
  {
    sport: '여자축구',
    emoji: '⚽',
    history: [
      { season: '26 Spring', winner: '옥지의 축구교실', class: 'Class of 2028', photo: '' },
      { season: '25 Fall', winner: '옥지의 축구교실', class: 'Class of 2028', photo: '/champions/여자축구 25F.JPG' },
    ],
  },
  {
    sport: '남자농구',
    emoji: '🏀',
    history: [
      { season: '26 Spring', winner: '빵빵이의 농구교실', class: 'Class of 2028', photo: '' },
      { season: '25 Fall', winner: '머리 큰 조던', class: 'Class of 2026', photo: '/champions/남자농구 25F.JPG' },
    ],
  },
  {
    sport: '여자배구',
    emoji: '🏐',
    history: [
      { season: '26 Spring', winner: '어~시니어야~', class: 'Class of 2027', photo: '' },
      { season: '25 Fall', winner: '개천에서 용 난다', class: '연합팀', photo: '/champions/여자배구 25F.JPG' },
    ],
  },
];

export type ChampionTitle = { season: string; sport: string; label: string };

/**
 * 💡 이름이 바뀌었지만 같은 팀인 경우 — 한 줄에 같은 팀의 이름들을 적으면 우승 별이 함께 붙습니다.
 * 맨 앞 이름이 지금 이름입니다.
 */
export const TEAM_GROUPS: string[][] = [
  ['김영준 레전드 축구단', '김영준에게 축구를 배우다'],
];

/** 같은 팀으로 묶인 이름이면 대표(지금) 이름으로 바꿉니다. */
export function canonicalTeam(name: string) {
  return TEAM_GROUPS.find(g => g.includes(name))?.[0] ?? name;
}

/** '26 Spring' → '2026년 봄학기' / '25 fall' → '2025년 가을학기' */
export function seasonLabel(season: string) {
  const m = season.trim().match(/^(\d{2,4})\s*(spring|fall|autumn|summer|winter)?/i);
  if (!m) return season;
  const year = m[1].length === 2 ? `20${m[1]}` : m[1];
  const term = (m[2] || '').toLowerCase();
  const ko = term === 'spring' ? '봄학기' : term === 'fall' || term === 'autumn' ? '가을학기' : term === 'summer' ? '여름학기' : term === 'winter' ? '겨울학기' : '';
  return `${year}년 ${ko}`.trim();
}

const norm = (s: string) => s.trim().toLowerCase();

function finalWinner(m: any): string | null {
  if (m.winnder_id) return m.winnder_id;
  if (m.score_a !== null && m.score_a !== undefined && m.score_b !== null && m.score_b !== undefined && m.score_a !== m.score_b) {
    return m.score_a > m.score_b ? m.team_a : m.team_b;
  }
  return null;
}

type AutoChampion = { team: string; season: string; sport: string };

/** 공식 기록(HALL_OF_FAME)에 아직 없는 시즌의 우승 팀을 DB 결승(round 2) 결과에서 찾습니다. */
async function fetchAutoChampions(): Promise<AutoChampion[]> {
  const finals = await cachedQuery('champion-finals', 10 * 60 * 1000, async () => {
    const { data } = await supabase
      .from('matches')
      .select('season, sport_type, team_a, team_b, score_a, score_b, winnder_id, status')
      .eq('round', 2);
    return data || [];
  });

  const seen = new Set<string>();
  HALL_OF_FAME.forEach(item => item.history.forEach(h => seen.add(`${item.sport}|${norm(h.season)}`)));
  const auto: AutoChampion[] = [];
  // 진행 중인 결승은 제외
  finals.forEach((m: any) => {
    const key = `${m.sport_type}|${norm(m.season || '')}`;
    const winner = m.status === 'live' ? null : finalWinner(m);
    if (!winner || !m.season || seen.has(key)) return;
    seen.add(key);
    auto.push({ team: winner, season: m.season, sport: m.sport_type });
  });
  return auto;
}

/** '26 fall' → '26 Fall' (Champions 페이지 표기에 맞춤) */
function prettySeason(season: string) {
  return season.replace(/\b([a-z])/g, c => c.toUpperCase());
}

/** 시즌 정렬용 숫자 (최신이 큼) */
function seasonOrder(s: string) {
  const m = s.match(/^(\d{2,4})\s*(\w+)?/);
  const y = m ? Number(m[1]) : 0;
  const t = m?.[2]?.toLowerCase() === 'fall' ? 1 : 0; // 같은 해면 가을이 봄보다 나중
  return y * 10 + t;
}

/** 팀 이름 → 우승 기록 목록 (최신순). 페이지마다 한 번만 불러오도록 10분 캐시합니다. */
async function fetchTitles(): Promise<Record<string, ChampionTitle[]>> {
  const rows: AutoChampion[] = [];
  HALL_OF_FAME.forEach(item => item.history.forEach(h => rows.push({ team: h.winner, season: h.season, sport: item.sport })));
  rows.push(...(await fetchAutoChampions()));

  const order = seasonOrder;
  const map: Record<string, ChampionTitle[]> = {};
  rows
    .sort((a, b) => order(b.season) - order(a.season))
    .forEach(r => {
      const key = canonicalTeam(r.team);
      // 예전 이름으로 우승했으면 그 이름도 함께 보여줍니다.
      const oldName = key !== r.team ? ` (당시 ${r.team})` : '';
      (map[key] ||= []).push({ season: r.season, sport: r.sport, label: `${seasonLabel(r.season)} ${r.sport} 우승${oldName}` });
    });
  return map;
}

let titlesPromise: Promise<Record<string, ChampionTitle[]>> | null = null;

/** 이 팀의 우승 기록. 여러 컴포넌트가 불러도 요청은 한 번만 나갑니다. */
export function useChampionTitles(team: string | null | undefined): ChampionTitle[] {
  const [titles, setTitles] = useState<ChampionTitle[]>([]);
  useEffect(() => {
    if (!team) return;
    let alive = true;
    titlesPromise ||= fetchTitles().catch(() => {
      titlesPromise = null;
      return {};
    });
    titlesPromise.then(map => {
      if (alive) setTitles(map[canonicalTeam(team)] || []);
    });
    return () => { alive = false; };
  }, [team]);
  return titles;
}

/**
 * Champions 페이지용 — 공식 기록 + DB 결승 결과로 자동 추가된 우승 팀 (최신 시즌이 위로).
 * 자동 추가된 기록은 사진·기수 정보가 없으니, 필요하면 HALL_OF_FAME 에 옮겨 적어주세요.
 */
export function useHallOfFame(): ChampionItem[] {
  const [items, setItems] = useState<ChampionItem[]>(HALL_OF_FAME);
  useEffect(() => {
    let alive = true;
    fetchAutoChampions()
      .then(auto => {
        if (!alive || auto.length === 0) return;
        setItems(
          HALL_OF_FAME.map(item => ({
            ...item,
            history: [
              ...auto
                .filter(c => c.sport === item.sport)
                .map(c => ({ season: prettySeason(c.season), winner: c.team, class: '', photo: '' })),
              ...item.history,
            ].sort((x, y) => seasonOrder(y.season) - seasonOrder(x.season)),
          }))
        );
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return items;
}
