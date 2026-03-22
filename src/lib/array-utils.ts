/** Fisher-Yates 셔플. 원본 배열 불변. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 날짜 기반 시드 난수 생성 (같은 날 같은 값). */
export function dateSeed(dateStr: string): number {
  return dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

/** 시드 기반 셔플 (같은 날 같은 순서). */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
