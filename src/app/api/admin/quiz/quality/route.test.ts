import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({ createServiceClient: vi.fn() }));
vi.mock('@/lib/db/admin-auth', () => ({ verifyAdminOrApiKey: vi.fn() }));

import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';
import { createServiceClient } from '@/lib/supabase/server';
import { GET } from './route';

const mockedAuth = vi.mocked(verifyAdminOrApiKey);
const mockedServiceClient = vi.mocked(createServiceClient);

function makeRequest(params = '') {
  return new Request(`http://localhost/api/admin/quiz/quality${params}`);
}

function mockSupabase(questions: unknown[]) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue({ data: questions, error: null }),
  };
  mockedServiceClient.mockReturnValue({ from: vi.fn(() => builder) } as never);
}

describe('GET /api/admin/quiz/quality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAuth.mockResolvedValue({ authorized: true, isApiKey: true, userId: 'admin' });
  });

  it('returns 401 when not authorized', async () => {
    mockedAuth.mockResolvedValue({ authorized: false, isApiKey: false });
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it('returns quality metrics', async () => {
    mockSupabase([
      { id: 'q1', subject: 'introduction', chapter: 'ch1', type: 'ox', question: '특수교육 질문입니다.', answer: 'O', explanation: '충분한 설명입니다. 특수교육은 장애 학생을 위한 교육 체계입니다.', difficulty: 2, options: null, case_context: null, sub_questions: null },
      { id: 'q2', subject: 'introduction', chapter: 'ch1', type: 'ox', question: '다른 질문입니다.', answer: 'invalid', explanation: '', difficulty: 1, options: null, case_context: null, sub_questions: null },
    ]);

    const res = await GET(makeRequest());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(2);
    expect(json.byType.ox).toBe(2);
    expect(json.bySubject.introduction).toBe(2);
    expect(json.qualityIssues.invalidOxAnswer).toBeGreaterThan(0);
    expect(json.validation.invalid).toBeGreaterThan(0);
  });

  it('includes duplicate detection when requested', async () => {
    mockSupabase([
      { id: 'q1', subject: 'introduction', chapter: 'ch1', type: 'ox', question: '특수교육 대상자 선정 기준에 대해 설명하시오.', answer: 'O', explanation: '충분한 설명입니다.', difficulty: 2, options: null, case_context: null, sub_questions: null },
      { id: 'q2', subject: 'introduction', chapter: 'ch1', type: 'ox', question: '특수교육 대상자의 선정 기준에 대해 설명하시오.', answer: 'O', explanation: '충분한 설명입니다.', difficulty: 2, options: null, case_context: null, sub_questions: null },
    ]);

    const res = await GET(makeRequest('?duplicates=true'));
    const json = await res.json();
    expect(json.qualityIssues.duplicatePairs).toBeGreaterThan(0);
    expect(json.samples.duplicatePairs.length).toBeGreaterThan(0);
  });

  it('skips duplicates by default', async () => {
    mockSupabase([
      { id: 'q1', subject: 'introduction', chapter: 'ch1', type: 'ox', question: '같은 질문', answer: 'O', explanation: '설명', difficulty: 2, options: null, case_context: null, sub_questions: null },
      { id: 'q2', subject: 'introduction', chapter: 'ch1', type: 'ox', question: '같은 질문', answer: 'O', explanation: '설명', difficulty: 2, options: null, case_context: null, sub_questions: null },
    ]);

    const res = await GET(makeRequest());
    const json = await res.json();
    expect(json.qualityIssues.duplicatePairs).toBe(0);
  });
});
