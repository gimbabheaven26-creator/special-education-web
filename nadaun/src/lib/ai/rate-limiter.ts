/**
 * 메모리 기반 Rate Limiter — 교사당 1일 30회
 * 프로덕션에서는 Redis/Supabase 기반으로 교체 필요
 */

const DAILY_LIMIT = 30;

interface RateEntry {
  count: number;
  resetAt: number; // epoch ms
}

const store = new Map<string, RateEntry>();

function getDateKey(): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.getTime() + 24 * 60 * 60 * 1000; // midnight + 1day
}

export function checkRateLimit(teacherId: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const resetAt = getDateKey();
  const entry = store.get(teacherId);

  if (!entry || entry.resetAt < Date.now()) {
    store.set(teacherId, { count: 1, resetAt });
    return { allowed: true, remaining: DAILY_LIMIT - 1, resetAt };
  }

  if (entry.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: DAILY_LIMIT - entry.count,
    resetAt: entry.resetAt,
  };
}
