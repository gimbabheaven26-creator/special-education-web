/**
 * Sliding-window in-memory rate limiter.
 *
 * 사용법:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 10 })
 *   const result = limiter.check(userId)
 *   if (!result.allowed) return 429
 *
 * 프로덕션 규모에서는 Redis 기반으로 교체 필요.
 */

interface RateLimiterOptions {
  /** 윈도우 크기 (밀리초). 기본 60 000 (1분) */
  windowMs?: number
  /** 윈도우 내 최대 요청 수. 기본 10 */
  max?: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  /** 윈도우 리셋 시각 (epoch ms) */
  resetAt: number
}

interface RateLimiter {
  check(key: string): RateLimitResult
}

export function createRateLimiter(opts: RateLimiterOptions = {}): RateLimiter {
  const windowMs = opts.windowMs ?? 60_000
  const max = opts.max ?? 10

  // key -> timestamp 배열 (요청 시각 기록)
  const store = new Map<string, number[]>()

  // 5분마다 만료된 엔트리 정리
  const CLEANUP_INTERVAL = 5 * 60 * 1000
  let lastCleanup = Date.now()

  function cleanup(now: number) {
    if (now - lastCleanup < CLEANUP_INTERVAL) return
    lastCleanup = now
    for (const [key, timestamps] of store) {
      const valid = timestamps.filter((t) => t > now - windowMs)
      if (valid.length === 0) {
        store.delete(key)
      } else {
        store.set(key, valid)
      }
    }
  }

  return {
    check(key: string): RateLimitResult {
      const now = Date.now()
      cleanup(now)

      const windowStart = now - windowMs
      const existing = store.get(key) ?? []
      // 윈도우 내 요청만 유지
      const valid = existing.filter((t) => t > windowStart)

      if (valid.length >= max) {
        // 가장 오래된 요청이 만료되는 시점이 resetAt
        const oldest = valid[0]
        return {
          allowed: false,
          remaining: 0,
          resetAt: oldest + windowMs,
        }
      }

      valid.push(now)
      store.set(key, valid)

      return {
        allowed: true,
        remaining: max - valid.length,
        resetAt: valid[0] + windowMs,
      }
    },
  }
}
