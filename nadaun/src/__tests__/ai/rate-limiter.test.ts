import { describe, it, expect } from 'vitest';
import { createRateLimiter } from '@/lib/rate-limit';

describe('createRateLimiter (AI 일일 한도)', () => {
  // 테스트용으로 짧은 윈도우 사용
  const SHORT_WINDOW = 100; // 100ms

  it('첫 요청은 허용된다', () => {
    const limiter = createRateLimiter({ windowMs: SHORT_WINDOW, max: 30 });
    const result = limiter.check('teacher-1');
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it('max 횟수까지 허용된다', () => {
    const limiter = createRateLimiter({ windowMs: SHORT_WINDOW, max: 5 });
    for (let i = 0; i < 5; i++) {
      const result = limiter.check('teacher-limit');
      expect(result.allowed).toBe(true);
    }
  });

  it('max+1번째 요청은 거부된다', () => {
    const limiter = createRateLimiter({ windowMs: SHORT_WINDOW, max: 5 });
    for (let i = 0; i < 5; i++) {
      limiter.check('teacher-over');
    }
    const result = limiter.check('teacher-over');
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('다른 교사는 독립적으로 카운트된다', () => {
    const limiter = createRateLimiter({ windowMs: SHORT_WINDOW, max: 3 });
    for (let i = 0; i < 3; i++) {
      limiter.check('teacher-A');
    }
    const resultA = limiter.check('teacher-A');
    const resultB = limiter.check('teacher-B');
    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
    expect(resultB.remaining).toBe(2);
  });

  it('resetAt은 미래 시점이다', () => {
    const limiter = createRateLimiter({ windowMs: SHORT_WINDOW, max: 30 });
    const result = limiter.check('teacher-time');
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});
