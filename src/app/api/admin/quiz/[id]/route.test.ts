import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
  createServiceClient: vi.fn(),
}));
vi.mock('@/lib/db/admin-auth', () => ({
  verifyAdminOrApiKey: vi.fn(),
}));

import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import { PATCH, DELETE } from './route';

const mockedAuth = vi.mocked(verifyAdminOrApiKey);
const mockedServiceClient = vi.mocked(createServiceClient);

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/admin/quiz/q1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeDeleteRequest() {
  return new Request('http://localhost/api/admin/quiz/q1', { method: 'DELETE' });
}

function mockSupabase(opts: { data?: unknown; error?: unknown; count?: number }) {
  const deleteResult = { error: opts.error ?? null, count: opts.count ?? 1 };
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: opts.data ?? null, error: opts.error ?? null }),
    then: vi.fn((resolve: (v: unknown) => unknown) => Promise.resolve(deleteResult).then(resolve)),
  };
  const sb = { from: vi.fn(() => builder), _builder: builder };
  mockedServiceClient.mockReturnValue(sb as never);
  return sb;
}

const params = Promise.resolve({ id: 'q1' });

describe('PATCH /api/admin/quiz/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({ authorized: true, isApiKey: true, userId: 'admin' });
  });

  it('returns 401 when not authorized', async () => {
    mockedAuth.mockResolvedValue({ authorized: false, isApiKey: false });
    const res = await PATCH(makeRequest({ question: 'test' }), { params });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid body (bad type)', async () => {
    const res = await PATCH(makeRequest({ type: 'invalid_type' }), { params });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.details).toBeDefined();
  });

  it('returns 400 for empty update', async () => {
    const res = await PATCH(makeRequest({}), { params });
    expect(res.status).toBe(400);
  });

  it('returns 400 for unknown fields (strict mode)', async () => {
    const res = await PATCH(makeRequest({ unknownField: 'value' }), { params });
    expect(res.status).toBe(400);
  });

  it('returns 400 for difficulty out of range', async () => {
    const res = await PATCH(makeRequest({ difficulty: 10 }), { params });
    expect(res.status).toBe(400);
  });

  it('updates valid question fields', async () => {
    const sb = mockSupabase({ data: { id: 'q1', question: 'updated' } });
    const res = await PATCH(makeRequest({ question: 'updated', difficulty: 3 }), { params });
    expect(res.status).toBe(200);
    expect(sb.from).toHaveBeenCalledWith('quiz_questions');
  });

  it('handles camelCase to snake_case mapping', async () => {
    const sb = mockSupabase({ data: { id: 'q1' } });
    await PATCH(makeRequest({ caseContext: 'some context' }), { params });
    const updateArg = sb._builder.update.mock.calls[0][0];
    expect(updateArg).toHaveProperty('case_context', 'some context');
  });
});

describe('DELETE /api/admin/quiz/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({ authorized: true, isApiKey: true, userId: 'admin' });
  });

  it('returns 401 when not authorized', async () => {
    mockedAuth.mockResolvedValue({ authorized: false, isApiKey: false });
    const res = await DELETE(makeDeleteRequest(), { params });
    expect(res.status).toBe(401);
  });

  it('returns 404 when question not found', async () => {
    mockSupabase({ count: 0 });
    const res = await DELETE(makeDeleteRequest(), { params });
    expect(res.status).toBe(404);
  });

  it('deletes successfully', async () => {
    mockSupabase({ count: 1 });
    const res = await DELETE(makeDeleteRequest(), { params });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});
