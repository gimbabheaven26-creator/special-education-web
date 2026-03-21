/**
 * next 리다이렉트 파라미터 검증 — Open Redirect 방지
 * 앱 내부 경로(/)만 허용, 외부 URL 차단
 */
export function safeRedirectPath(next: string | undefined | null): string {
  if (!next) return '/';
  // 외부 URL (http://, https://, //) 차단
  if (/^https?:\/\//i.test(next) || next.startsWith('//')) return '/';
  // 반드시 /로 시작하는 내부 경로만 허용
  if (!next.startsWith('/')) return '/';
  return next;
}
