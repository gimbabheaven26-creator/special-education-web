/**
 * YYYY-MM-DD → "DAY-MMDD" 형식 고유번호 생성
 * 예: "2026-03-19" → "DAY-0319"
 */
export function makeSheetCode(dateRaw: string): string {
  const parts = dateRaw.split('-');
  return `DAY-${parts[1]}${parts[2]}`;
}

/** 한국 표준시 기준 오늘 날짜 (YYYY-MM-DD) */
export function getKSTDateRaw(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}
