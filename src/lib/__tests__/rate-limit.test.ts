import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRateLimiter, getIp } from '../rate-limit';

describe('createRateLimiter', () => {
  afterEach(() => { vi.restoreAllMocks(); });

  it('allows requests within limit', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect(limiter('user1').allowed).toBe(true);
    expect(limiter('user1').allowed).toBe(true);
    expect(limiter('user1').allowed).toBe(true);
  });

  it('blocks requests exceeding limit', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });
    limiter('user1');
    limiter('user1');
    expect(limiter('user1').allowed).toBe(false);
    expect(limiter('user1').remaining).toBe(0);
  });

  it('tracks different keys independently', () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 });
    expect(limiter('a').allowed).toBe(true);
    expect(limiter('b').allowed).toBe(true);
    expect(limiter('a').allowed).toBe(false);
    expect(limiter('b').allowed).toBe(false);
  });

  it('resets after window expires', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter('user1').allowed).toBe(true);
    expect(limiter('user1').allowed).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(limiter('user1').allowed).toBe(true);
    vi.useRealTimers();
  });

  it('returns correct remaining count', () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect(limiter('u').remaining).toBe(2);
    expect(limiter('u').remaining).toBe(1);
    expect(limiter('u').remaining).toBe(0);
  });

  it('cleans up store when exceeding 1000 entries', () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ limit: 1, windowMs: 100 });
    for (let i = 0; i < 1002; i++) limiter(`key-${i}`);
    vi.advanceTimersByTime(101);
    expect(limiter('new-key').allowed).toBe(true);
    vi.useRealTimers();
  });
});

describe('getIp', () => {
  it('extracts first IP from x-forwarded-for', () => {
    const req = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getIp(req)).toBe('1.2.3.4');
  });

  it('returns unknown when header is missing', () => {
    const req = new Request('http://localhost');
    expect(getIp(req)).toBe('unknown');
  });
});
