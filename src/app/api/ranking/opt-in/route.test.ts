import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/db/profile', () => ({ updateRankingOptIn: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({
  mutationLimiter: vi.fn(() => ({ allowed: true })),
  getIp: vi.fn(() => '127.0.0.1'),
}));

import { updateRankingOptIn } from '@/lib/db/profile';
import { mutationLimiter } from '@/lib/rate-limit';
import { POST } from './route';

const mockedUpdate = vi.mocked(updateRankingOptIn);
const mockedLimiter = vi.mocked(mutationLimiter);

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/ranking/opt-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/ranking/opt-in', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLimiter.mockReturnValue({ allowed: true });
    mockedUpdate.mockResolvedValue({ error: null } as never);
  });

  it('returns 429 when rate limited', async () => {
    mockedLimiter.mockReturnValue({ allowed: false });
    const res = await POST(makeRequest({ show: true }));
    expect(res.status).toBe(429);
  });

  it('opts in successfully', async () => {
    const res = await POST(makeRequest({ show: true }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.show_in_ranking).toBe(true);
    expect(mockedUpdate).toHaveBeenCalledWith(true);
  });

  it('opts out when show is falsy', async () => {
    const res = await POST(makeRequest({ show: false }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.show_in_ranking).toBe(false);
    expect(mockedUpdate).toHaveBeenCalledWith(false);
  });

  it('defaults to false when show is not boolean true', async () => {
    const res = await POST(makeRequest({ show: 'yes' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.show_in_ranking).toBe(false);
  });

  it('returns 400 when update fails', async () => {
    mockedUpdate.mockResolvedValue({ error: '인증이 필요합니다' } as never);
    const res = await POST(makeRequest({ show: true }));
    expect(res.status).toBe(400);
  });
});
