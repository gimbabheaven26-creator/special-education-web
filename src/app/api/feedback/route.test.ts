import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/rate-limit', () => ({
  feedbackLimiter: vi.fn(() => ({ allowed: true })),
  getIp: vi.fn(() => '127.0.0.1'),
}));

import { feedbackLimiter } from '@/lib/rate-limit';
import { POST } from './route';

const mockedLimiter = vi.mocked(feedbackLimiter);

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
    body: JSON.stringify(body),
  }) as never;
}

describe('POST /api/feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedLimiter.mockReturnValue({ allowed: true, remaining: 10 });
    delete process.env.DISCORD_WEBHOOK_URL;
  });

  it('returns 429 when rate limited', async () => {
    mockedLimiter.mockReturnValue({ allowed: false, remaining: 0 });
    const res = await POST(makeRequest({ type: 'bug', message: 'test bug report' }));
    expect(res.status).toBe(429);
  });

  it('returns 400 for invalid type', async () => {
    const res = await POST(makeRequest({ type: 'invalid', message: 'test message' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for message too short', async () => {
    const res = await POST(makeRequest({ type: 'bug', message: 'hi' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for message too long', async () => {
    const res = await POST(makeRequest({ type: 'bug', message: 'x'.repeat(501) }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for invalid JSON', async () => {
    const req = new Request('http://localhost/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '127.0.0.1' },
      body: '{bad',
    });
    const res = await POST(req as never);
    expect(res.status).toBe(400);
  });

  it('accepts valid feedback without webhook', async () => {
    const res = await POST(makeRequest({ type: 'suggestion', message: 'great app feature' }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('accepts all valid types', async () => {
    for (const type of ['bug', 'suggestion', 'compliment']) {
      const res = await POST(makeRequest({ type, message: 'valid message here' }));
      expect(res.status).toBe(200);
    }
  });
});
