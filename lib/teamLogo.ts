// lib/teamLogo.ts
// 💡 팀 로고 Storage 경로 헬퍼.
// Supabase Storage는 한글 파일명을 허용하지 않으므로, 팀 이름을 base64url로 변환해
// 'player-photos' 버킷의 teams/ 폴더 아래에 저장합니다. (예: teams/7Lm07JmA....png)
// 같은 팀 이름이면 항상 같은 경로가 나오므로, 업로드/조회 양쪽에서 이 함수만 쓰면 됩니다.

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

export function teamLogoPath(teamName: string): string {
  const b64 = toBase64Utf8(teamName).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return `teams/${b64}.png`;
}
