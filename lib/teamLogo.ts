// lib/teamLogo.ts
// 💡 팀 로고 Storage 경로 헬퍼.
// Supabase Storage는 한글 파일명을 허용하지 않으므로 base64url로 변환해 저장합니다.
//
// 같은 팀 이름이 시즌마다 다른 팀일 수 있으므로(예: 학년이 바뀌며 이름을 물려받는 경우)
// 시즌을 주면 시즌별 경로(teams/{시즌}/{팀}.png)를, 없으면 공통 경로(teams/{팀}.png)를 씁니다.
// 화면에서는 시즌별 로고 → 공통 로고 순으로 폴백합니다.

function toBase64Utf8(s: string): string {
  if (typeof window === 'undefined') {
    return Buffer.from(s, 'utf8').toString('base64');
  }
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  bytes.forEach(b => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function b64url(s: string): string {
  return toBase64Utf8(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function teamLogoPath(teamName: string, season?: string | null): string {
  if (season) return `teams/${b64url(season)}/${b64url(teamName)}.png`;
  return `teams/${b64url(teamName)}.png`;
}
