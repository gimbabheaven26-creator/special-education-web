import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('checkRateLimit', () => {
  beforeEach(() => {
    // 모듈 캐시를 초기화하여 store를 리셋
    vi.resetModules();
  });

  it('첫 요청은 허용된다', async () => {
    const { checkRateLimit: fresh } = await import('@/lib/ai/rate-limiter');
    const result = fresh('teacher-1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it('30회까지 허용된다', async () => {
    const { checkRateLimit: fresh } = await import('@/lib/ai/rate-limiter');
    for (let i = 0; i < 30; i++) {
      const result = fresh('teacher-limit');
      if (i < 30) {
        expect(result.allowed).toBe(true);
      }
    }
  });

  it('31번째 요청은 거부된다', async () => {
    const { checkRateLimit: fresh } = await import('@/lib/ai/rate-limiter');
    for (let i = 0; i < 30; i++) {
      fresh('teacher-over');
    }
    const result = fresh('teacher-over');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('다른 교사는 독립적으로 카운트된다', async () => {
    const { checkRateLimit: fresh } = await import('@/lib/ai/rate-limiter');
    for (let i = 0; i < 30; i++) {
      fresh('teacher-A');
    }
    const resultA = fresh('teacher-A');
    const resultB = fresh('teacher-B');
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(29);
  });

  it('resetAt은 미래 시점이다', async () => {
    const { checkRateLimit: fresh } = await import('@/lib/ai/rate-limiter');
    const result = fresh('teacher-time');
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});
