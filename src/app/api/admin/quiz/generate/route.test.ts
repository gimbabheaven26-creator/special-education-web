import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(),
}));

vi.mock('@/lib/db/admin-auth', () => ({
  verifyAdminOrApiKey: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  adminGenerateLimiter: vi.fn(),
}));

import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';
import { adminGenerateLimiter } from '@/lib/rate-limit';
import { POST } from './route';

const mockedVerifyAdminOrApiKey = vi.mocked(verifyAdminOrApiKey);
const mockedAdminGenerateLimiter = vi.mocked(adminGenerateLimiter);

describe('/api/admin/quiz/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.GEMINI_API_KEY;
    mockedVerifyAdminOrApiKey.mockResolvedValue({
      authorized: true,
      isAdmin: true,
      isApiKey: true,
      userId: 'admin',
    });
    mockedAdminGenerateLimiter.mockReturnValue({ allowed: true });
  });

  it('accepts isomorphic generation without standard type and subject fields', async () => {
    const request = new Request('http://localhost/api/admin/quiz/generate', {
      method: 'POST',
      body: JSON.stringify({
        mode: 'isomorphic',
        source_kice_ref: '2026/전공A/1',
        source_question: {
          number: 1,
          points: 4,
          type: 'descriptive',
          subjects: ['introduction'],
          chapters: ['law'],
          keywords: ['IEP'],
          context: '개별화교육계획 수립 절차를 묻는 기출 지문',
          answer: '개별화교육지원팀',
        },
        count: 1,
      }),
    });

    const response = await POST(request);
    const body = await response.json() as { drafts?: unknown[]; mock?: boolean; source_kice_ref?: string; error?: string };

    expect(response.status).toBe(200);
    expect(body.error).toBeUndefined();
    expect(body.mock).toBe(true);
    expect(body.source_kice_ref).toBe('2026/전공A/1');
    expect(body.drafts).toHaveLength(1);
  });
});
