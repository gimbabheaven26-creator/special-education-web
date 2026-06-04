import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));
vi.mock('@/lib/db/admin-auth', () => ({
  verifyAdminOrApiKey: vi.fn(),
}));

import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';
import { createClient } from '@/lib/supabase/server';
import { POST } from './route';

const mockedAuth = vi.mocked(verifyAdminOrApiKey);
const mockedCreateClient = vi.mocked(createClient);

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/admin/quiz/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function validQuestion(overrides?: Record<string, unknown>) {
  return {
    subject: 'math',
    chapter: 'ch1',
    type: 'ox',
    question: '1+1=2?',
    answer: 'O',
    ...overrides,
  };
}

function mockSupabase() {
  const builder = {
    select: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    then: vi.fn((resolve: (v: unknown) => unknown) =>
      Promise.resolve({ data: [{ id: 'q1' }], error: null }).then(resolve),
    ),
  };
  const sb = { from: vi.fn(() => builder), _builder: builder };
  mockedCreateClient.mockResolvedValue(sb as never);
  return sb;
}

describe('POST /api/admin/quiz/bulk', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({ authorized: true, isAdmin: true, isApiKey: true, userId: 'admin' });
  });

  it('returns 401 when not authorized', async () => {
    mockedAuth.mockResolvedValue({ authorized: false, isAdmin: false, isApiKey: false, userId: null });
    const res = await POST(makeRequest({ questions: [validQuestion()] }));
    expect(res.status).toBe(401);
  });

  it('returns 400 for empty questions array', async () => {
    const res = await POST(makeRequest({ questions: [] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({ questions: [{ subject: 'math' }] }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details).toBeDefined();
  });

  it('returns 400 for invalid type', async () => {
    const res = await POST(makeRequest({ questions: [validQuestion({ type: 'invalid' })] }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for non-array questions', async () => {
    const res = await POST(makeRequest({ questions: 'not-array' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 for malformed JSON', async () => {
    const req = new Request('http://localhost/api/admin/quiz/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('processes valid questions', async () => {
    mockSupabase();
    const res = await POST(makeRequest({ questions: [validQuestion()] }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.processed).toBe(1);
  });

  it('includes item-level validation details', async () => {
    const res = await POST(makeRequest({
      questions: [
        validQuestion(),
        { subject: '', chapter: '', type: 'ox', question: '', answer: 'O' },
      ],
    }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.issuesByIndex).toBeDefined();
  });
});
