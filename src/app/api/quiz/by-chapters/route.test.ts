import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

vi.mock('@/lib/db/quiz', () => ({
  getQuizzesByChapters: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  defaultLimiter: vi.fn(),
  getIp: vi.fn(),
}));

import { getQuizzesByChapters } from '@/lib/db/quiz';
import { defaultLimiter, getIp } from '@/lib/rate-limit';
import { POST } from './route';

const mockedGetQuizzesByChapters = vi.mocked(getQuizzesByChapters);
const mockedDefaultLimiter = vi.mocked(defaultLimiter);
const mockedGetIp = vi.mocked(getIp);

describe('/api/quiz/by-chapters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedDefaultLimiter.mockReturnValue({ allowed: true, remaining: 10 });
    mockedGetIp.mockReturnValue('127.0.0.1');
    mockedGetQuizzesByChapters.mockResolvedValue([]);
  });

  it('deduplicates chapter pairs before fetching quizzes', async () => {
    const request = new NextRequest('http://localhost/api/quiz/by-chapters', {
      method: 'POST',
      body: JSON.stringify({
        chapters: [
          { subject: 'assessment', chapter: '지능검사' },
          { subject: 'assessment', chapter: '지능검사' },
          { subject: 'laws', chapter: '특수교육법총칙과국가의무' },
        ],
      }),
    });

    const response = await POST(request);
    const body = await response.json() as { quizzes?: unknown[]; error?: string };

    expect(response.status).toBe(200);
    expect(body.error).toBeUndefined();
    expect(body.quizzes).toEqual([]);
    expect(mockedGetQuizzesByChapters).toHaveBeenCalledTimes(1);
    expect(mockedGetQuizzesByChapters).toHaveBeenCalledWith([
      { subject: 'assessment', chapter: '지능검사' },
      { subject: 'laws', chapter: '특수교육법총칙과국가의무' },
    ]);
  });

  it('rejects more than 50 chapter pairs', async () => {
    const request = new NextRequest('http://localhost/api/quiz/by-chapters', {
      method: 'POST',
      body: JSON.stringify({
        chapters: Array.from({ length: 51 }, (_, index) => ({
          subject: 'assessment',
          chapter: `chapter-${index}`,
        })),
      }),
    });

    const response = await POST(request);
    const body = await response.json() as { error?: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe('invalid chapters');
    expect(mockedGetQuizzesByChapters).not.toHaveBeenCalled();
  });

  it('rejects unsafe chapter filter characters', async () => {
    const request = new NextRequest('http://localhost/api/quiz/by-chapters', {
      method: 'POST',
      body: JSON.stringify({
        chapters: [{ subject: 'assessment', chapter: '지능검사),subject.eq.laws' }],
      }),
    });

    const response = await POST(request);
    const body = await response.json() as { error?: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe('invalid chapters');
    expect(mockedGetQuizzesByChapters).not.toHaveBeenCalled();
  });
});
