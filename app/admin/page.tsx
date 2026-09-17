'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase, getSessionUser } from '@/lib/supabase';
import { invalidateCache, clearPhotoMissing } from '@/lib/cache';
import { isAdminUser } from '@/lib/admin';
import { teamLogoPath } from '@/lib/teamLogo';
import { fetchSeasons } from '@/lib/seasons';
import TeamLogo from '@/app/components/TeamLogo';

const SPORTS = ['남자축구', '여자축구', '남자농구', '여자배구'];

/* ── 공통 스타일 (spec §5) ─────────────────────────────────────── */
const inputCls =
  'h-10 w-full rounded-lg border border-edge bg-surface px-3 text-sm font-medium text-fg transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25';
const selectCls = inputCls + ' appearance-none pr-8';
const btnPrimary =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-canvas transition-colors hover:bg-accent-bright active:opacity-90 disabled:pointer-events-none disabled:opacity-50';
const btnGhost =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-fg-mid transition-colors hover:bg-surface hover:text-fg disabled:pointer-events-none disabled:opacity-50';
const btnSecondary =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-edge-strong px-4 text-sm font-semibold text-fg transition-colors hover:bg-surface disabled:pointer-events-none disabled:opacity-50';
const btnDanger =
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/20 disabled:pointer-events-none disabled:opacity-50';

/* ISO ↔ <input type="datetime-local"> 값 변환 */
function toLocalInput(iso?: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalInput(v: string): string | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

/* 이미지를 최대 1000px PNG로 변환 (실패하면 원본 그대로) — 업로드 용량/트래픽 절약 */
async function fileToPngBlob(file: File, maxSize = 1000): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bmp, 0, 0, w, h);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('변환 실패'))), 'image/png')
    );
  } catch {
    return file;
  }
}

/* ── 시즌별 참가팀 등록부 — Supabase의 teams 테이블 한 행 = "이 팀이 이 시즌·종목에 참가" ──
   운영진 누구든 등록하면 전원의 화면과 자동완성에 공유됩니다. */
type RegTeam = { id: string; name: string; category: string; season: string };

export default function AdminPage() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState<'matches' | 'players' | 'teams'>('matches');

  useEffect(() => {
    getSessionUser().then(u => {
      setUser(u);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    const redirectUrl = `${window.location.origin}/auth/callback?next=/admin`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    });
    if (error) alert('로그인 에러: ' + error.message);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 pb-24 sm:px-6 md:pt-14">
      <header className="mb-10 border-b border-edge pb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">
          Control Room
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.1] text-fg md:text-6xl">
          Admin
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-[1.65] text-fg-mid">
          경기와 선수 데이터를 이곳에서 직접 관리합니다. 저장하면 사이트에 바로 반영됩니다.
        </p>
      </header>

      {authLoading ? (
        <div className="h-40 animate-pulse rounded-xl border border-edge bg-surface" />
      ) : !user ? (
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">관리자 로그인이 필요합니다.</p>
          <button onClick={handleLogin} className={`${btnPrimary} mt-5`}>
            Google로 로그인
          </button>
        </div>
      ) : !isAdminUser(user) ? (
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">접근 권한이 없는 계정입니다.</p>
          <p className="mt-1 text-sm text-fg-dim">{user.email}</p>
        </div>
      ) : (
        <>
          {/* 탭 */}
          <div className="mb-8 flex gap-2">
            {([['matches', '경기 관리'], ['players', '선수 관리'], ['teams', '팀 관리']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={
                  tab === key
                    ? 'h-10 rounded-full bg-fg px-5 text-sm font-semibold text-canvas'
                    : 'h-10 rounded-full border border-edge px-5 text-sm font-medium text-fg-mid transition-colors hover:border-edge-strong hover:text-fg'
                }
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'matches' ? <MatchesAdmin /> : tab === 'players' ? <PlayersAdmin /> : <TeamsAdmin />}
        </>
      )}
    </div>
  );
}

/* ═══════════════════════ 경기 관리 ═══════════════════════ */

function MatchesAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<{ team_name: string; category: string }[]>([]);
  const [filterSeason, setFilterSeason] = useState('');
  const [filterSport, setFilterSport] = useState('');
  const [showNew, setShowNew] = useState(false);

  // 팀 관리 탭에서 등록한 시즌별 참가팀 (teams 테이블 — 운영진 전원 공유)
  const [regTeams, setRegTeams] = useState<RegTeam[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ data: matches, error }, { data: playerTeams }, { data: teamRows }] = await Promise.all([
      supabase.from('matches').select('*').order('match_date', { ascending: false }),
      supabase.from('players').select('team_name, category'),
      supabase.from('teams').select('*'),
    ]);
    if (error) alert('경기 목록 로드 실패: ' + error.message);
    setList(matches || []);
    setRegTeams((teamRows as RegTeam[]) || []);
    const seen = new Map<string, { team_name: string; category: string }>();
    (playerTeams || []).forEach(t => {
      if (t.team_name) seen.set(`${t.category}|${t.team_name}`, t);
    });
    setTeams(Array.from(seen.values()));
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // DB의 경기들에서 뽑은 시즌 목록
  const derivedSeasons = useMemo(
    () => Array.from(new Set(list.map(m => m.season).filter(Boolean))) as string[],
    [list]
  );

  // 💡 "+ 새 시즌"으로 추가했지만 아직 경기가 없는 시즌들 (localStorage에 기억)
  const [extraSeasons, setExtraSeasons] = useState<string[]>([]);
  useEffect(() => {
    try {
      setExtraSeasons(JSON.parse(localStorage.getItem('admin_extra_seasons') || '[]'));
    } catch {
      setExtraSeasons([]);
    }
  }, []);

  // 경기가 생겨서 DB에 확정된 시즌은 임시 목록에서 자동 제거
  useEffect(() => {
    const pruned = extraSeasons.filter(s => !derivedSeasons.includes(s));
    if (pruned.length !== extraSeasons.length) {
      setExtraSeasons(pruned);
      try { localStorage.setItem('admin_extra_seasons', JSON.stringify(pruned)); } catch {}
    }
  }, [derivedSeasons, extraSeasons]);

  const seasons = useMemo(() => {
    const merged = [...derivedSeasons];
    extraSeasons.forEach(s => { if (!merged.includes(s)) merged.push(s); });
    return merged;
  }, [derivedSeasons, extraSeasons]);

  // 새 시즌 추가 → 목록에 등록하고, 그 시즌이 기본값으로 잡힌 새 경기 폼을 바로 엽니다.
  const [newFormSeason, setNewFormSeason] = useState<string | null>(null);
  const addSeason = () => {
    const name = prompt('새 시즌 이름을 입력하세요 (예: 26 fall)');
    if (!name) return;
    const season = name.trim();
    if (!season) return;
    if (seasons.includes(season)) return alert('이미 있는 시즌입니다.');
    const next = [...extraSeasons, season];
    setExtraSeasons(next);
    try { localStorage.setItem('admin_extra_seasons', JSON.stringify(next)); } catch {}
    setNewFormSeason(season);
    setShowNew(true);
  };
  // 💡 DB에 score_a/score_b 컬럼이 있으면 자동으로 스코어 입력칸이 나타납니다.
  const hasScoreCols = list.length > 0 && 'score_a' in list[0];

  const filtered = list.filter(
    m => (!filterSeason || m.season === filterSeason) && (!filterSport || m.sport_type === filterSport)
  );

  const afterWrite = async () => {
    invalidateCache(''); // 이 브라우저의 사이트 캐시 전체 비우기 (다른 방문자는 캐시 TTL 후 반영)
    await load();
  };

  return (
    <section className="space-y-6">
      {/* 필터 + 새 경기 */}
      <div className="flex flex-wrap items-center gap-2">
        <select value={filterSeason} onChange={e => setFilterSeason(e.target.value)} className={`${selectCls} w-40`}>
          <option value="">전체 시즌</option>
          {seasons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterSport} onChange={e => setFilterSport(e.target.value)} className={`${selectCls} w-36`}>
          <option value="">전체 종목</option>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm font-medium tabular-nums text-fg-dim">{filtered.length}경기</span>
        <div className="flex-1" />
        <button onClick={addSeason} className={btnSecondary}>+ 새 시즌</button>
        <button onClick={() => setShowNew(v => !v)} className={btnPrimary}>
          {showNew ? '닫기' : '+ 새 경기'}
        </button>
      </div>

      {showNew && (
        <NewMatchForm
          key={newFormSeason || 'default'}
          teams={teams}
          seasons={seasons}
          matches={list}
          regTeams={regTeams}
          defaultSeason={newFormSeason}
          hasScoreCols={hasScoreCols}
          onSaved={async () => { setShowNew(false); setNewFormSeason(null); await afterWrite(); }}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map(i => <div key={i} className="h-[76px] animate-pulse rounded-xl border border-edge bg-surface" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">조건에 맞는 경기가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(m => (
            <MatchRow key={m.id} match={m} hasScoreCols={hasScoreCols} onChanged={afterWrite} />
          ))}
        </div>
      )}
    </section>
  );
}

function NewMatchForm({
  teams, seasons, matches, regTeams, defaultSeason, hasScoreCols, onSaved,
}: {
  teams: { team_name: string; category: string }[];
  seasons: string[];
  matches: any[];
  regTeams: RegTeam[];
  defaultSeason?: string | null;
  hasScoreCols: boolean;
  onSaved: () => Promise<void>;
}) {
  const [f, setF] = useState({
    sport_type: SPORTS[0],
    season: defaultSeason || seasons[0] || '26 spring',
    round: 4,
    match_order: 1,
    team_a: '',
    team_b: '',
    date: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  // 💡 팀 자동완성: "선택한 시즌 + 종목"의 참가팀만 보여줍니다.
  //    = 그 시즌 경기에 이미 나온 팀 + [팀 로고] 탭에서 미리 등록해둔 팀.
  //    아직 아무 팀도 없으면(시즌 첫 경기) 그 종목의 전체 팀을 대신 제안합니다.
  const seasonTeams = Array.from(
    new Set(
      matches
        .filter(m => m.season === f.season && m.sport_type === f.sport_type)
        .flatMap(m => [m.team_a, m.team_b])
        .filter(Boolean)
    )
  ) as string[];
  regTeams
    .filter(t => t.season === f.season && t.category === f.sport_type)
    .forEach(t => {
      if (!seasonTeams.includes(t.name)) seasonTeams.push(t.name);
    });
  const sportTeams =
    seasonTeams.length > 0
      ? seasonTeams
      : teams.filter(t => t.category === f.sport_type).map(t => t.team_name);

  const save = async () => {
    if (!f.team_a || !f.team_b) return alert('두 팀 이름을 입력해주세요.');
    if (!f.date) return alert('경기 일시를 입력해주세요.');
    setSaving(true);
    const row: any = {
      sport_type: f.sport_type,
      season: f.season,
      round: f.round,
      match_order: f.match_order,
      team_a: f.team_a,
      team_b: f.team_b,
      match_date: fromLocalInput(f.date),
      is_active: f.is_active,
    };
    const { error } = await supabase.from('matches').insert(row);
    setSaving(false);
    if (error) return alert('저장 실패: ' + error.message);
    await onSaved();
  };

  return (
    <div className="rounded-xl border border-accent/30 bg-surface p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">새 경기 등록</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">종목</span>
          <select value={f.sport_type} onChange={e => setF({ ...f, sport_type: e.target.value })} className={selectCls}>
            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">시즌</span>
          <input value={f.season} onChange={e => setF({ ...f, season: e.target.value })} list="admin-seasons" className={inputCls} placeholder="26 spring" />
          <datalist id="admin-seasons">{seasons.map(s => <option key={s} value={s} />)}</datalist>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">라운드</span>
          <select value={f.round} onChange={e => setF({ ...f, round: Number(e.target.value) })} className={selectCls}>
            <option value={8}>8강</option>
            <option value={4}>4강</option>
            <option value={2}>결승</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">경기 순서</span>
          <input type="number" min={1} value={f.match_order} onChange={e => setF({ ...f, match_order: Number(e.target.value) })} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">팀 A</span>
          <input value={f.team_a} onChange={e => setF({ ...f, team_a: e.target.value })} list="admin-teams" className={inputCls} placeholder="팀 이름 입력 또는 선택" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">팀 B</span>
          <input value={f.team_b} onChange={e => setF({ ...f, team_b: e.target.value })} list="admin-teams" className={inputCls} placeholder="팀 이름 입력 또는 선택" />
        </label>
        <datalist id="admin-teams">{sportTeams.map(t => <option key={t} value={t} />)}</datalist>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">경기 일시</span>
          <input type="datetime-local" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className={inputCls} />
        </label>
        <label className="flex items-end gap-2 pb-1">
          <input type="checkbox" checked={f.is_active} onChange={e => setF({ ...f, is_active: e.target.checked })} className="h-4 w-4 accent-[#0EA5E9]" />
          <span className="text-sm font-medium text-fg-mid">활성 경기</span>
        </label>
      </div>
      <div className="mt-5 flex justify-end">
        <button onClick={save} disabled={saving} className={btnPrimary}>
          {saving ? '저장 중...' : '경기 등록'}
        </button>
      </div>
      <p className="mt-3 text-xs text-fg-dim">
        💡 팀 자동완성은 선택한 시즌·종목의 참가팀 기준입니다. 시즌에 처음 나가는 팀은
        [팀 관리] 탭의 [+ 새 팀]으로 먼저 등록하면 여기 나타납니다.
      </p>
      {!hasScoreCols && (
        <p className="mt-1 text-xs text-fg-dim">
          💡 스코어 입력칸은 DB에 score_a / score_b 컬럼을 추가하면 자동으로 나타납니다.
        </p>
      )}
    </div>
  );
}

function MatchRow({ match, hasScoreCols, onChanged }: { match: any; hasScoreCols: boolean; onChanged: () => Promise<void> }) {
  const [f, setF] = useState({
    date: toLocalInput(match.match_date),
    match_order: match.match_order ?? 1,
    winner: match.winnder_id || '',
    score_a: match.score_a ?? '',
    score_b: match.score_b ?? '',
    is_active: !!match.is_active,
  });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    const row: any = {
      match_date: fromLocalInput(f.date),
      match_order: Number(f.match_order) || 1,
      winnder_id: f.winner || null,
      is_active: f.is_active,
    };
    if (hasScoreCols) {
      row.score_a = f.score_a === '' ? null : Number(f.score_a);
      row.score_b = f.score_b === '' ? null : Number(f.score_b);
    }
    const { error } = await supabase.from('matches').update(row).eq('id', match.id);
    setBusy(false);
    if (error) return alert('저장 실패: ' + error.message);
    await onChanged();
  };

  const remove = async () => {
    if (!confirm(`[${match.team_a} vs ${match.team_b}] 경기를 삭제할까요?\n이 경기의 평점/예측 데이터도 함께 삭제됩니다.`)) return;
    setBusy(true);
    // 참조 데이터부터 정리한 뒤 경기 삭제
    await supabase.from('ratings').delete().eq('match_id', match.id);
    await supabase.from('predictions').delete().eq('match_id', match.id);
    const { error } = await supabase.from('matches').delete().eq('id', match.id);
    setBusy(false);
    if (error) return alert('삭제 실패: ' + error.message);
    await onChanged();
  };

  return (
    <article className="rounded-xl border border-edge bg-surface p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="inline-flex items-center rounded-full border border-edge bg-raised px-2.5 py-0.5 text-xs font-semibold text-fg-mid">
          {match.sport_type}
        </span>
        <span className="text-xs font-medium text-fg-dim">
          {match.season} · {match.round === 2 ? '결승' : match.round === 4 ? '4강' : match.round === 8 ? '8강' : `라운드 ${match.round}`}
        </span>
        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-fg">
          {match.team_a} <span className="font-medium text-fg-dim">vs</span> {match.team_b}
        </p>
      </div>

      <div className="mt-3 grid items-end gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_100px_1fr_auto_auto]">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">일시</span>
          <input type="datetime-local" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">순서</span>
          <input type="number" min={1} value={f.match_order} onChange={e => setF({ ...f, match_order: Number(e.target.value) })} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">승리 팀</span>
          <select value={f.winner} onChange={e => setF({ ...f, winner: e.target.value })} className={selectCls}>
            <option value="">미정</option>
            <option value={match.team_a}>{match.team_a}</option>
            <option value={match.team_b}>{match.team_b}</option>
          </select>
        </label>
        {hasScoreCols && (
          <div className="flex items-end gap-1.5">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-fg-dim">스코어</span>
              <input type="number" min={0} value={f.score_a} onChange={e => setF({ ...f, score_a: e.target.value })} className={`${inputCls} w-16 text-center tabular-nums`} placeholder="A" />
            </label>
            <span className="pb-2.5 text-fg-dim">:</span>
            <input type="number" min={0} value={f.score_b} onChange={e => setF({ ...f, score_b: e.target.value })} className={`${inputCls} w-16 text-center tabular-nums`} placeholder="B" />
          </div>
        )}
        <div className="flex items-center gap-2">
          <label className="flex h-10 items-center gap-2">
            <input type="checkbox" checked={f.is_active} onChange={e => setF({ ...f, is_active: e.target.checked })} className="h-4 w-4 accent-[#0EA5E9]" />
            <span className="text-sm font-medium text-fg-mid">활성</span>
          </label>
          <button onClick={save} disabled={busy} className={btnPrimary}>저장</button>
          <button onClick={remove} disabled={busy} className={btnDanger}>삭제</button>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════ 선수 관리 ═══════════════════════ */

function PlayersAdmin() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('category')
      .order('team_name')
      .order('player_number');
    if (error) alert('선수 목록 로드 실패: ' + error.message);
    setList(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // 팀 관리 탭에서 등록한 참가팀(teams 테이블)도 자동완성에 포함합니다.
  const [regTeams, setRegTeams] = useState<RegTeam[]>([]);
  useEffect(() => {
    supabase.from('teams').select('*').then(({ data }) => setRegTeams((data as RegTeam[]) || []));
  }, []);

  // 시즌 선택지: 경기 시즌 + 팀 등록부 시즌 + 선수들이 이미 갖고 있는 시즌
  const [filterSeason, setFilterSeason] = useState('');
  const [seasonBase, setSeasonBase] = useState<string[]>([]);
  useEffect(() => {
    fetchSeasons().then(setSeasonBase).catch(() => {});
  }, []);
  const seasonOptions = useMemo(() => {
    const opts = [...seasonBase];
    regTeams.forEach(t => { if (t.season && !opts.includes(t.season)) opts.push(t.season); });
    list.forEach(pl => { if (pl.season && !opts.includes(pl.season)) opts.push(pl.season); });
    return opts;
  }, [seasonBase, regTeams, list]);

  const teamsOfSport = useMemo(() => {
    const names = Array.from(
      new Set(list.filter(p => !filterSport || p.category === filterSport).map(p => p.team_name).filter(Boolean))
    ) as string[];
    regTeams
      .filter(t => !filterSport || t.category === filterSport)
      .forEach(t => { if (!names.includes(t.name)) names.push(t.name); });
    return names;
  }, [list, filterSport, regTeams]);

  const allTeams = useMemo(() => {
    const names = Array.from(new Set(list.map(p => p.team_name).filter(Boolean))) as string[];
    regTeams.forEach(t => { if (!names.includes(t.name)) names.push(t.name); });
    return names;
  }, [list, regTeams]);

  const filtered = list.filter(
    p =>
      (!filterSport || p.category === filterSport) &&
      (!filterTeam || p.team_name === filterTeam) &&
      (!filterSeason || p.season === filterSeason)
  );

  const afterWrite = async () => {
    invalidateCache('');
    await load();
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filterSport}
          onChange={e => { setFilterSport(e.target.value); setFilterTeam(''); }}
          className={`${selectCls} w-36`}
        >
          <option value="">전체 종목</option>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className={`${selectCls} w-52`}>
          <option value="">전체 팀</option>
          {teamsOfSport.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filterSeason} onChange={e => setFilterSeason(e.target.value)} className={`${selectCls} w-36`}>
          <option value="">전체 시즌</option>
          {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm font-medium tabular-nums text-fg-dim">{filtered.length}명</span>
        <div className="flex-1" />
        <button onClick={() => setShowNew(v => !v)} className={btnPrimary}>
          {showNew ? '닫기' : '+ 새 선수'}
        </button>
      </div>

      {showNew && (
        <NewPlayerForm
          teams={allTeams}
          seasons={seasonOptions}
          defaultSport={filterSport || SPORTS[0]}
          defaultTeam={filterTeam}
          defaultSeason={filterSeason || seasonOptions[0] || ''}
          onSaved={async () => { await afterWrite(); }}
        />
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-[72px] animate-pulse rounded-xl border border-edge bg-surface" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">조건에 맞는 선수가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <PlayerRow key={p.id} player={p} teams={allTeams} seasons={seasonOptions} onChanged={afterWrite} />
          ))}
        </div>
      )}
      <datalist id="admin-player-teams">{allTeams.map(t => <option key={t} value={t} />)}</datalist>
    </section>
  );
}

function NewPlayerForm({
  teams, seasons, defaultSport, defaultTeam, defaultSeason, onSaved,
}: {
  teams: string[];
  seasons: string[];
  defaultSport: string;
  defaultTeam: string;
  defaultSeason: string;
  onSaved: () => Promise<void>;
}) {
  const [f, setF] = useState({
    name: '', player_number: '', team_name: defaultTeam, category: defaultSport, season: defaultSeason,
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!f.name) return alert('선수 이름을 입력해주세요.');
    if (!f.team_name) return alert('팀 이름을 입력해주세요.');
    setSaving(true);
    // 💡 같은 팀 이름이 시즌마다 다른 팀일 수 있으므로, 선수는 시즌 소속으로 저장합니다.
    const { error } = await supabase.from('players').insert({
      name: f.name,
      player_number: f.player_number === '' ? null : Number(f.player_number),
      team_name: f.team_name,
      category: f.category,
      season: f.season || null,
    });
    setSaving(false);
    if (error) return alert('저장 실패: ' + error.message);
    setF({ ...f, name: '', player_number: '' }); // 같은 팀에 연속 등록하기 편하게 팀은 유지
    await onSaved();
  };

  return (
    <div className="rounded-xl border border-accent/30 bg-surface p-5">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">새 선수 등록</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">이름</span>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className={inputCls} placeholder="홍길동" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">등번호</span>
          <input type="number" min={0} value={f.player_number} onChange={e => setF({ ...f, player_number: e.target.value })} className={inputCls} placeholder="10" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">팀</span>
          <input value={f.team_name} onChange={e => setF({ ...f, team_name: e.target.value })} list="admin-player-teams" className={inputCls} placeholder="팀 이름 입력 또는 선택" />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">종목</span>
          <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className={selectCls}>
            {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-fg-dim">시즌</span>
          <select value={f.season} onChange={e => setF({ ...f, season: e.target.value })} className={selectCls}>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>
      <div className="mt-5 flex justify-end">
        <button onClick={save} disabled={saving} className={btnPrimary}>
          {saving ? '저장 중...' : '선수 등록'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════ 팀 관리 (로고 + 시즌별 참가팀 등록부) ═══════════════════════ */

function TeamsAdmin() {
  const [dbRows, setDbRows] = useState<{ name: string; categories: string[] }[]>([]);
  const [regTeams, setRegTeams] = useState<RegTeam[]>([]);
  const [seasonOptions, setSeasonOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nf, setNf] = useState({ name: '', category: SPORTS[0], season: '' });

  const load = useCallback(async () => {
    setLoading(true);
    // 선수 명단·경기 기록·팀 등록부(teams 테이블)에서 팀 정보를 모읍니다.
    const [{ data: players }, { data: matches }, { data: teamRows }] = await Promise.all([
      supabase.from('players').select('team_name, category'),
      supabase
        .from('matches')
        .select('team_a, team_b, sport_type, season, match_date')
        .order('match_date', { ascending: false }),
      supabase.from('teams').select('*').order('created_at', { ascending: false }),
    ]);
    const map = new Map<string, Set<string>>();
    const add = (name?: string | null, cat?: string | null) => {
      if (!name) return;
      if (!map.has(name)) map.set(name, new Set());
      if (cat) map.get(name)!.add(cat);
    };
    (players || []).forEach(p => add(p.team_name, p.category));
    (matches || []).forEach(m => {
      add(m.team_a, m.sport_type);
      add(m.team_b, m.sport_type);
    });
    setDbRows(
      Array.from(map.entries())
        .map(([name, cats]) => ({ name, categories: Array.from(cats) }))
        .sort((a, b) => a.name.localeCompare(b.name, 'ko'))
    );
    setRegTeams((teamRows as RegTeam[]) || []);

    // 새 팀 등록 폼의 시즌 선택지: DB 시즌(최신순) + [+ 새 시즌]으로 만들어둔 임시 시즌
    const seen: string[] = [];
    (matches || []).forEach(m => {
      if (m.season && !seen.includes(m.season)) seen.push(m.season);
    });
    (teamRows || []).forEach((t: any) => {
      if (t.season && !seen.includes(t.season)) seen.push(t.season);
    });
    try {
      (JSON.parse(localStorage.getItem('admin_extra_seasons') || '[]') as string[]).forEach(s => {
        if (!seen.includes(s)) seen.push(s);
      });
    } catch {}
    setSeasonOptions(seen);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!nf.season && seasonOptions.length > 0) {
      setNf(n => ({ ...n, season: seasonOptions[0] }));
    }
  }, [seasonOptions, nf.season]);

  const rows = useMemo(() => {
    const map = new Map<string, { name: string; categories: string[]; seasons: string[] }>();
    dbRows.forEach(r => map.set(r.name, { name: r.name, categories: [...r.categories], seasons: [] }));
    regTeams.forEach(t => {
      if (!map.has(t.name)) map.set(t.name, { name: t.name, categories: [], seasons: [] });
      const row = map.get(t.name)!;
      if (t.category && !row.categories.includes(t.category)) row.categories.push(t.category);
      if (t.season && !row.seasons.includes(t.season)) row.seasons.push(t.season);
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [dbRows, regTeams]);

  // 💡 팀 등록 → teams 테이블에 저장되므로 운영진 전원의 화면·자동완성에 바로 공유됩니다.
  const addTeam = async () => {
    const name = nf.name.trim();
    if (!name) return alert('팀 이름을 입력해주세요.');
    if (!nf.season) return alert('시즌을 선택해주세요.');
    if (regTeams.some(t => t.name === name && t.season === nf.season && t.category === nf.category))
      return alert('이미 등록된 팀입니다.');
    setSaving(true);
    const { error } = await supabase
      .from('teams')
      .insert({ name, category: nf.category, season: nf.season });
    setSaving(false);
    if (error)
      return alert(
        '팀 등록 실패: ' + error.message + '\n(teams 테이블 생성 SQL을 아직 실행하지 않았다면 먼저 실행해주세요.)'
      );
    setNf(n => ({ ...n, name: '' }));
    setShowNew(false);
    invalidateCache('');
    await load();
  };

  const removeReg = async (name: string, seasons: string[]) => {
    if (
      !confirm(
        `[${name}] 팀의 시즌 등록(${seasons.join(', ')})을 해제할까요?\n로고와 이미 저장된 경기·선수 데이터는 그대로 유지됩니다.`
      )
    )
      return;
    const { error } = await supabase.from('teams').delete().eq('name', name);
    if (error) return alert('해제 실패: ' + error.message);
    await load();
  };

  const filtered = rows.filter(r => !filterSport || r.categories.includes(filterSport));

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <select value={filterSport} onChange={e => setFilterSport(e.target.value)} className={`${selectCls} w-36`}>
          <option value="">전체 종목</option>
          {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="text-sm font-medium tabular-nums text-fg-dim">{filtered.length}팀</span>
        <div className="flex-1" />
        <button onClick={() => setShowNew(v => !v)} className={btnPrimary}>
          {showNew ? '닫기' : '+ 새 팀'}
        </button>
      </div>

      {showNew && (
        <div className="rounded-xl border border-accent/30 bg-surface p-5">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.08em] text-accent-bright">새 팀 등록</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-fg-dim">팀 이름</span>
              <input value={nf.name} onChange={e => setNf({ ...nf, name: e.target.value })} className={inputCls} placeholder="예: 빵빵이의 축구교실" />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-fg-dim">종목</span>
              <select value={nf.category} onChange={e => setNf({ ...nf, category: e.target.value })} className={selectCls}>
                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-fg-dim">참가 시즌</span>
              <select value={nf.season} onChange={e => setNf({ ...nf, season: e.target.value })} className={selectCls}>
                {seasonOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end">
            <button onClick={addTeam} disabled={saving} className={btnPrimary}>
              {saving ? '등록 중...' : '팀 추가'}
            </button>
          </div>
        </div>
      )}

      <p className="max-w-2xl text-sm leading-[1.6] text-fg-dim">
        시즌에 나가는 팀은 <b className="text-fg-mid">[+ 새 팀]</b>으로 등록하세요 — 등록하면 <b className="text-fg-mid">모든 운영진</b>의
        새 경기 폼 자동완성에 바로 나타납니다. 파란 배지는 등록된 참가 시즌입니다. 썸네일이나 로고 업로드 버튼으로
        팀 대표 이미지를 올리면 홈 · 대진표 · 예측 페이지에 바로 적용됩니다.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-[84px] animate-pulse rounded-xl border border-edge bg-surface" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-edge bg-surface/50 px-6 py-14 text-center">
          <p className="text-[15px] font-semibold text-fg-mid">등록된 팀이 없습니다.</p>
          <p className="mt-1 text-sm text-fg-dim">[+ 새 팀]으로 팀을 먼저 등록해 보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(t => (
            <TeamLogoRow
              key={t.name}
              team={{ name: t.name, categories: t.categories }}
              regSeasons={t.seasons}
              onRemoveReg={() => removeReg(t.name, t.seasons)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TeamLogoRow({
  team, regSeasons = [], onRemoveReg,
}: {
  team: { name: string; categories: string[] };
  regSeasons?: string[];
  onRemoveReg?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [ver, setVer] = useState(0); // 업로드/삭제 직후 썸네일 강제 새로고침용
  const fileRef = useRef<HTMLInputElement>(null);

  // 💡 같은 팀 이름이 시즌마다 다른 팀일 수 있어서, 로고를 "어느 시즌"에 올릴지 선택합니다.
  // 공통(기본)에 올리면 시즌별 로고가 없는 모든 시즌에서 그 로고를 씁니다.
  const [logoSeason, setLogoSeason] = useState<string>(regSeasons[0] || '');

  // 💡 로고 업로드: 아무 이미지나 고르면 자동 리사이즈 후 고정 경로로 저장됩니다.
  const upload = async (file: File) => {
    setUploading(true);
    try {
      const blob = await fileToPngBlob(file, 800);
      const { error } = await supabase.storage
        .from('player-photos')
        .upload(teamLogoPath(team.name, logoSeason || undefined), blob, {
          upsert: true,
          contentType: blob.type || 'image/png',
          cacheControl: '3600',
        });
      if (error) return alert('로고 업로드 실패: ' + error.message);
      // "로고 없음" 기록 해제 → 즉시 다시 로드
      clearPhotoMissing(logoSeason ? `team:${logoSeason}:${team.name}` : `team:${team.name}`);
      invalidateCache('');
      setVer(v => v + 1);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const removeLogo = async () => {
    const target = logoSeason ? `${logoSeason} 시즌` : '공통(기본)';
    if (!confirm(`[${team.name}] ${target} 로고를 삭제할까요?`)) return;
    const { error } = await supabase.storage
      .from('player-photos')
      .remove([teamLogoPath(team.name, logoSeason || undefined)]);
    if (error) return alert('삭제 실패: ' + error.message);
    setVer(v => v + 1);
  };

  return (
    <article className="rounded-xl border border-edge bg-surface p-3.5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="로고 업로드/교체"
          className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-edge bg-raised p-1.5 transition-colors hover:border-accent/50"
        >
          <TeamLogo name={team.name} season={logoSeason || undefined} version={ver} className="h-full w-full" />
          {uploading && <span className="absolute inset-0 animate-pulse bg-canvas/70" />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => { const file = e.target.files?.[0]; if (file) upload(file); }}
        />

        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-fg">{team.name}</p>

        <div className="flex shrink-0 flex-wrap gap-1.5">
          {/* 파란 배지 = 등록된 참가 시즌 */}
          {regSeasons.map(s => (
            <span key={s} className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent-bright">
              {s}
            </span>
          ))}
          {team.categories.map(c => (
            <span key={c} className="inline-flex items-center rounded-full border border-edge bg-raised px-2.5 py-0.5 text-xs font-semibold text-fg-mid">
              {c}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {regSeasons.length > 0 && (
            <select
              value={logoSeason}
              onChange={e => setLogoSeason(e.target.value)}
              className={`${selectCls} w-32`}
              title="로고를 올릴 시즌"
            >
              {regSeasons.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="">공통(기본)</option>
            </select>
          )}
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className={btnPrimary}>
            {uploading ? '업로드 중...' : '📷 로고 업로드'}
          </button>
          {regSeasons.length > 0 && (
            <button onClick={onRemoveReg} disabled={uploading} className={btnGhost}>등록 해제</button>
          )}
          <button onClick={removeLogo} disabled={uploading} className={btnGhost}>로고 삭제</button>
        </div>
      </div>
    </article>
  );
}

function PlayerRow({
  player, teams, seasons, onChanged,
}: {
  player: any;
  teams: string[];
  seasons: string[];
  onChanged: () => Promise<void>;
}) {
  const [f, setF] = useState({
    name: player.name || '',
    player_number: player.player_number ?? '',
    team_name: player.team_name || '',
    season: player.season || '',
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photoVer, setPhotoVer] = useState(0); // 업로드 후 썸네일 캐시 무력화용
  const fileRef = useRef<HTMLInputElement>(null);

  const { data } = supabase.storage.from('player-photos').getPublicUrl(`${player.id}.png`);
  const photoUrl = `${data.publicUrl}?v=${photoVer}`;
  const [imgError, setImgError] = useState(false);

  const save = async () => {
    setBusy(true);
    const { error } = await supabase
      .from('players')
      .update({
        name: f.name,
        player_number: f.player_number === '' ? null : Number(f.player_number),
        team_name: f.team_name,
        season: f.season || null,
      })
      .eq('id', player.id);
    setBusy(false);
    if (error) return alert('저장 실패: ' + error.message);
    await onChanged();
  };

  const remove = async () => {
    if (!confirm(`[${player.name}] 선수를 삭제할까요?\n이 선수의 평점 데이터도 함께 삭제됩니다.`)) return;
    setBusy(true);
    await supabase.from('ratings').delete().eq('player_id', player.id);
    const { error } = await supabase.from('players').delete().eq('id', player.id);
    if (!error) {
      // 사진도 정리 (없으면 조용히 무시됨)
      await supabase.storage.from('player-photos').remove([`${player.id}.png`]);
    }
    setBusy(false);
    if (error) return alert('삭제 실패: ' + error.message);
    await onChanged();
  };

  // 💡 사진 업로드: 아무 이미지나 고르면 자동으로 리사이즈 → {선수ID}.png 이름으로 저장됩니다.
  // 파일명을 수동으로 바꿀 필요가 전혀 없습니다.
  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const blob = await fileToPngBlob(file);
      const { error } = await supabase.storage
        .from('player-photos')
        .upload(`${player.id}.png`, blob, {
          upsert: true,
          contentType: blob.type || 'image/png',
          cacheControl: '3600',
        });
      if (error) return alert('사진 업로드 실패: ' + error.message);
      setImgError(false);
      setPhotoVer(v => v + 1); // 새 썸네일 즉시 표시
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <article className="rounded-xl border border-edge bg-surface p-3.5">
      <div className="flex flex-wrap items-center gap-3">
        {/* 사진 썸네일 — 클릭해도 업로드 */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          title="사진 업로드/교체"
          className="relative h-14 w-11 shrink-0 overflow-hidden rounded-lg border border-edge bg-raised transition-colors hover:border-accent/50"
        >
          {!imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" onError={() => setImgError(true)} className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-sm font-bold text-fg-dim">
              {f.player_number || '?'}
            </span>
          )}
          {uploading && <span className="absolute inset-0 animate-pulse bg-canvas/70" />}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={e => { const file = e.target.files?.[0]; if (file) uploadPhoto(file); }}
        />

        <span className="inline-flex items-center rounded-full border border-edge bg-raised px-2.5 py-0.5 text-xs font-semibold text-fg-mid">
          {player.category}
        </span>

        <input
          value={f.name}
          onChange={e => setF({ ...f, name: e.target.value })}
          className={`${inputCls} w-32 sm:w-40`}
          placeholder="이름"
        />
        <input
          type="number"
          min={0}
          value={f.player_number}
          onChange={e => setF({ ...f, player_number: e.target.value })}
          className={`${inputCls} w-20 text-center tabular-nums`}
          placeholder="번호"
        />
        <input
          value={f.team_name}
          onChange={e => setF({ ...f, team_name: e.target.value })}
          list="admin-player-teams"
          className={`${inputCls} min-w-40 flex-1`}
          placeholder="팀"
        />
        <select
          value={f.season}
          onChange={e => setF({ ...f, season: e.target.value })}
          className={`${selectCls} w-32`}
          title="소속 시즌"
        >
          <option value="">시즌 없음</option>
          {seasons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className={btnGhost}>
            {uploading ? '업로드 중...' : '📷 사진'}
          </button>
          <button onClick={save} disabled={busy} className={btnPrimary}>저장</button>
          <button onClick={remove} disabled={busy} className={btnDanger}>삭제</button>
        </div>
      </div>
    </article>
  );
}
