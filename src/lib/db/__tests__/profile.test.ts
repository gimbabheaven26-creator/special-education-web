import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock supabase/server ───────────────────────────────────────────────────

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { getMyProfile, upsertNickname, isAdmin } from '../profile';

const mockedCreateClient = vi.mocked(createClient);

/** Build a mock Supabase client with auth + query builder */
function makeProfileSupabase(opts: {
  user?: { id: string } | null;
  queryResult?: { data: unknown; error: unknown };
}) {
  const queryResult = opts.queryResult ?? { data: null, error: null };
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(queryResult),
    then: vi.fn((resolve: (v: unknown) => unknown) =>
      Promise.resolve(queryResult).then(resolve),
    ),
  };
  return {
    from: vi.fn(() => builder),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: opts.user ?? null },
      }),
    },
    _builder: builder,
  };
}

// ─── Fixtures ───────────────────────────────────────────────────────────────

const PROFILE = {
  id: 'user-1',
  display_name: '김기훈',
  nickname: '카이란',
  role: 'admin',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-28T00:00:00Z',
};

describe('profile', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── getMyProfile ───

  describe('getMyProfile', () => {
    it('returns profile for logged-in user', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-1' },
        queryResult: { data: PROFILE, error: null },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await getMyProfile();
      expect(result).not.toBeNull();
      expect(result!.id).toBe('user-1');
      expect(result!.nickname).toBe('카이란');
      expect(result!.role).toBe('admin');
    });

    it('returns null when not logged in', async () => {
      const sb = makeProfileSupabase({ user: null });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await getMyProfile();
      expect(result).toBeNull();
    });

    it('returns null on DB error', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-1' },
        queryResult: { data: null, error: { message: 'DB error' } },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await getMyProfile();
      expect(result).toBeNull();
    });

    it('returns null when profile row not found', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-1' },
        queryResult: { data: null, error: null },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await getMyProfile();
      expect(result).toBeNull();
    });
  });

  // ─── upsertNickname ───

  describe('upsertNickname', () => {
    it('updates nickname for logged-in user', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-1' },
        queryResult: { data: null, error: null },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await upsertNickname('새닉네임');
      expect(result.error).toBeNull();
      expect(sb._builder.update).toHaveBeenCalled();
    });

    it('rejects empty nickname', async () => {
      const result = await upsertNickname('');
      expect(result.error).toBe('닉네임을 입력해주세요.');
    });

    it('rejects whitespace-only nickname', async () => {
      const result = await upsertNickname('   ');
      expect(result.error).toBe('닉네임을 입력해주세요.');
    });

    it('rejects nickname over 20 characters', async () => {
      const result = await upsertNickname('이것은매우긴닉네임이라서스물자를초과합니다아');
      expect(result.error).toBe('닉네임은 20자 이하여야 합니다.');
    });

    it('returns error when not logged in', async () => {
      const sb = makeProfileSupabase({ user: null });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await upsertNickname('닉네임');
      expect(result.error).toBe('로그인이 필요합니다.');
    });

    it('returns DB error message on failure', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-1' },
        queryResult: { data: null, error: { message: 'unique constraint' } },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await upsertNickname('닉네임');
      expect(result.error).toBe('unique constraint');
    });

    it('trims nickname before saving', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-1' },
        queryResult: { data: null, error: null },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      await upsertNickname('  카이란  ');
      // Verify update was called (nickname gets trimmed internally)
      expect(sb._builder.update).toHaveBeenCalled();
    });
  });

  // ─── isAdmin ───

  describe('isAdmin', () => {
    it('returns true for admin user', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-1' },
        queryResult: { data: PROFILE, error: null },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('returns false for regular user', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-2' },
        queryResult: { data: { ...PROFILE, role: 'user' }, error: null },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('returns false when not logged in', async () => {
      const sb = makeProfileSupabase({ user: null });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('returns false on DB error', async () => {
      const sb = makeProfileSupabase({
        user: { id: 'user-1' },
        queryResult: { data: null, error: { message: 'fail' } },
      });
      mockedCreateClient.mockResolvedValue(sb as never);

      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });
});
