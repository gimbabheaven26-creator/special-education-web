import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createServiceClient: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({
  wrongReportLimiter: vi.fn(() => ({ allowed: true })),
  getIp: vi.fn(() => '127.0.0.1'),
}));

import { createServiceClient } from '@/lib/supabase/server';
import { wrongReportLimiter } from '@/lib/rate-limit';
import { POST } from './route';

const mockedServiceClient = vi.mocked(createServiceClient);
const mockedLimiter = vi.mocked(wrongReportLimiter);

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/quiz/wrong-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/quiz/wrong-report', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLimiter.mockReturnValue({ allowed: true });
  });

  it('returns 429 when rate limited', async () => {
    mockedLimiter.mockReturnValue({ allowed: false });
    const res = await POST(makeRequest({ questionId: 'q1' }));
    expect(res.status).toBe(429);
  });

  it('returns 400 for missing questionId', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it('returns 400 for empty questionId', async () => {
    const res = await POST(makeRequest({ questionId: '' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for questionId too long', async () => {
    const res = await POST(makeRequest({ questionId: 'x'.repeat(101) }));
    expect(res.status).toBe(400);
  });

  it('calls rpc and returns ok', async () => {
    const sb = {
      rpc: vi.fn().mockResolvedValue({ error: null }),
    };
    mockedServiceClient.mockReturnValue(sb as never);
    const res = await POST(makeRequest({ questionId: 'q1' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ok).toBe(true);
  });

  it('falls back to upsert when rpc fails', async () => {
    const builder = {
      upsert: vi.fn().mockResolvedValue({ error: null }),
    };
    const sb = {
      rpc: vi.fn().mockResolvedValue({ error: { message: 'rpc not found' } }),
      from: vi.fn(() => builder),
    };
    mockedServiceClient.mockReturnValue(sb as never);
    const res = await POST(makeRequest({ questionId: 'q1' }));
    expect(res.status).toBe(200);
    expect(sb.from).toHaveBeenCalledWith('wrong_note_stats');
  });
});
