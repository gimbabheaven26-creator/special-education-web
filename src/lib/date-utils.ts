/**
 * KST(한국표준시) 기준 날짜 유틸리티.
 * new Date().toISOString()은 UTC 기준이므로 KST와 최대 9시간 차이가 발생한다.
 * 이 모듈의 함수를 사용하면 서울 시간대 기준의 날짜 문자열을 얻을 수 있다.
 */

/** KST 기준 날짜 문자열 반환. 예: "2026-03-22" */
export function getKSTDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}

/** 오늘의 KST 날짜 문자열 반환. getKSTDate()의 alias. */
export function getToday(): string {
  return getKSTDate();
}

/** KST 기준 날짜에 일수를 더한 날짜 문자열 반환. */
export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + 'T00:00:00+09:00');
  date.setDate(date.getDate() + days);
  return getKSTDate(date);
}

/** KST 기준 어제 날짜인지 확인. */
export function isYesterday(dateStr: string): boolean {
  const today = getKSTDate();
  const todayDate = new Date(today + 'T00:00:00+09:00');
  const yesterday = new Date(todayDate.getTime() - 86400000);
  return dateStr === getKSTDate(yesterday);
}
