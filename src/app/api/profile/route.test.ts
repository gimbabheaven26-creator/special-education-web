import { beforeEach, describe, expect, it, vi } from 'vitest';

const sentry = vi.hoisted(() => ({
  captureException: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: sentry.captureException,
}));

vi.mock('@/lib/db/profile', () => ({
  getMyProfile: vi.fn(),
  getMyProfileResult: vi.fn(),
  upsertNickname: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  mutationLimiter: vi.fn(),
  getIp: vi.fn(),
}));

import { getMyProfile, getMyProfileResult, upsertNickname } from '@/lib/db/profile';
import { getIp, mutationLimiter } from '@/lib/rate-limit';
import { GET, PATCH } from './route';

const mockedGetMyProfile = vi.mocked(getMyProfile);
const mockedGetMyProfileResult = vi.mocked(getMyProfileResult);
const mockedUpsertNickname = vi.mocked(upsertNickname);
const mockedMutationLimiter = vi.mocked(mutationLimiter);
const mockedGetIp = vi.mocked(getIp);

describe('/api/profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedMutationLimiter.mockReturnValue({ allowed: true, remaining: 10 });
    mockedGetIp.mockReturnValue('127.0.0.1');
  });

  it('captures profile DB lookup failures in Sentry', async () => {
    const cause = new Error('profiles select failed');
    mockedGetMyProfileResult.mockResolvedValue({
      profile: null,
      status: 'db_error',
      error: cause,
    });
    mockedGetMyProfile.mockResolvedValue(null);

    const response = await GET();
    const body = await response.json() as { error?: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe('프로필 조회 중 오류가 발생했습니다.');
    expect(sentry.captureException).toHaveBeenCalledWith(cause);
  });

  it('captures nickname DB update failures in Sentry', async () => {
    const cause = new Error('profiles update failed');
    mockedUpsertNickname.mockResolvedValue({
      error: 'profiles update failed',
      errorSource: 'db',
      cause,
    });

    const request = new Request('http://localhost/api/profile', {
      method: 'PATCH',
      body: JSON.stringify({ nickname: '카이란' }),
    });

    const response = await PATCH(request);
    const body = await response.json() as { error?: string };

    expect(response.status).toBe(400);
    expect(body.error).toBe('profiles update failed');
    expect(sentry.captureException).toHaveBeenCalledWith(cause);
  });
});
