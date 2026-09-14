// lib/admin.ts
// 💡 관리자 계정 목록입니다. 관리자를 추가하려면 이메일을 이 배열에 넣으세요.
// 주의: 화면 접근만 막는 1차 방어입니다. 실제 데이터 보호는 Supabase RLS 정책이 담당합니다.
export const ADMIN_EMAILS = ['mg225090612@gvcs-mg.org'];

export function isAdminUser(user: { email?: string | null } | null | undefined): boolean {
  return !!user?.email && ADMIN_EMAILS.includes(user.email);
}
