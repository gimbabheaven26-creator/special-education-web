import type { DailyQuestion } from '@/types/daily';

export function seededRandom(seed: number, index: number): number {
  const s = (seed * 1664525 + 1013904223 + index * 22695477) & 0x7fffffff;
  return s / 0x7fffffff;
}

export function seededSample<T>(arr: T[], n: number, seed: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed, i) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

/** 틀린 챕터를 우선으로 채우되 부족하면 랜덤으로 채움 */
export function selectWithWrongPriority(
  pool: DailyQuestion[],
  wrongChapters: string[],
  n: number,
  seed: number,
): DailyQuestion[] {
  const wrongFirst = pool.filter((q) => wrongChapters.includes(q.chapter));
  const rest = pool.filter((q) => !wrongChapters.includes(q.chapter));
  const selected = seededSample(wrongFirst, n, seed);
  if (selected.length < n) {
    selected.push(...seededSample(rest, n - selected.length, seed + 99));
  }
  return selected.slice(0, n);
}
