type Entry = { count: number; resetAt: number };

export function createRateLimiter(opts: { limit: number; windowMs: number }) {
  const store = new Map<string, Entry>();

  return function check(key: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    if (store.size > 1000) {
      store.forEach((v, k) => {
        if (v.resetAt < now) store.delete(k);
      });
    }
    const entry = store.get(key);
    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + opts.windowMs });
      return { allowed: true, remaining: opts.limit - 1 };
    }
    if (entry.count >= opts.limit) {
      return { allowed: false, remaining: 0 };
    }
    entry.count++;
    return { allowed: true, remaining: opts.limit - entry.count };
  };
}

export function getIp(request: Request): string {
  return (request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()) ?? 'unknown';
}

export const feedbackLimiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
export const wrongReportLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
export const communityGenerateLimiter = createRateLimiter({ limit: 5, windowMs: 60_000 });
export const adminGenerateLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
export const aiLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
export const defaultLimiter = createRateLimiter({ limit: 30, windowMs: 60_000 });
export const mutationLimiter = createRateLimiter({ limit: 10, windowMs: 60_000 });
