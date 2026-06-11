import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/db/quiz', () => ({ getQuizzesByIds: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({
  defaultLimiter: vi.fn(() => ({ allowed: true })),
  getIp: vi.fn(() => '127.0.0.1'),
}));

import { getQuizzesByIds } from '@/lib/db/quiz';
import { defaultLimiter } from '@/lib/rate-limit';
import { POST } from './route';

const mockedGetQuizzes = vi.mocked(getQuizzesByIds);
const mockedLimiter = vi.mocked(defaultLimiter);

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/quiz/by-ids', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/quiz/by-ids', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLimiter.mockReturnValue({ allowed: true, remaining: 10 });
    mockedGetQuizzes.mockResolvedValue([]);
  });

  it('returns 429 when rate limited', async () => {
    mockedLimiter.mockReturnValue({ allowed: false, remaining: 0 });
    const res = await POST(makeRequest({ ids: ['q1'] }));
    expect(res.status).toBe(429);
  });

  it('returns 400 for empty ids', async () => {
    const res = await POST(makeRequest({ ids: [] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-array ids', async () => {
    const res = await POST(makeRequest({ ids: 'not-array' }));
    expect(res.status).toBe(400);
  });

  it('returns quizzes for valid ids', async () => {
    mockedGetQuizzes.mockResolvedValue([{ id: 'q1', question: 'test' }] as never);
    const res = await POST(makeRequest({ ids: ['q1'] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.quizzes).toHaveLength(1);
  });

  it('deduplicates ids', async () => {
    mockedGetQuizzes.mockResolvedValue([]);
    await POST(makeRequest({ ids: ['q1', 'q1', 'q2'] }));
    expect(mockedGetQuizzes).toHaveBeenCalledWith(['q1', 'q2']);
  });
});
