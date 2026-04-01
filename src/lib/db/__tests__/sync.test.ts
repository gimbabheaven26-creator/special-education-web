import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock('@/lib/supabase/browser', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/browser';
import {
  serializeState,
  pushToServer,
  pullFromServer,
  pushStore,
  pullStore,
  migrateGuestData,
} from '../sync';

const mockedCreateClient = vi.mocked(createClient);

/** Chainable mock Supabase builder with auth support */
function makeBrowserSupabase(opts: {
  queryResult?: { data: unknown; error: unknown };
  user?: { id: string } | null;
}) {
  const queryResult = opts.queryResult ?? { data: null, error: null };
  const builder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnValue(Promise.resolve(queryResult)),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(queryResult),
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

describe('sync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── serializeState ───

  describe('serializeState', () => {
    it('functions are removed, data is kept', () => {
      const state = {
        name: 'test',
        count: 42,
        action: () => 'nope',
        nested: { a: 1 },
      };
      const result = serializeState(state);
      expect(result).toEqual({ name: 'test', count: 42, nested: { a: 1 } });
      expect(result).not.toHaveProperty('action');
    });

    it('empty object returns empty object', () => {
      expect(serializeState({})).toEqual({});
    });

    it('object with only functions returns empty', () => {
      const state = { fn1: () => 1, fn2: () => 2 };
      expect(serializeState(state)).toEqual({});
    });
  });

  // ─── pushToServer ───

  describe('pushToServer', () => {
    it('pushed: upserts data to server', async () => {
      const sb = makeBrowserSupabase({ queryResult: { data: null, error: null } });
      mockedCreateClient.mockReturnValue(sb as never);

      const result = await pushToServer('user-1', 'study', { score: 100 });
      expect(result).toBe('pushed');
      expect(sb.from).toHaveBeenCalledWith('user_data');
    });

    it('skipped: server data is newer than local', async () => {
      const sb = makeBrowserSupabase({
        queryResult: { data: { updated_at: '2026-12-31T00:00:00Z' }, error: null },
      });
      mockedCreateClient.mockReturnValue(sb as never);

      const result = await pushToServer('user-1', 'study', { score: 100 }, '2026-01-01T00:00:00Z');
      expect(result).toBe('skipped');
    });

    it('pushed: local data is newer than server', async () => {
      // First call: maybeSingle returns older timestamp
      // Second call (upsert): returns success
      const sb = makeBrowserSupabase({
        queryResult: { data: { updated_at: '2025-01-01T00:00:00Z' }, error: null },
      });
      // Override upsert to return success
      sb._builder.upsert.mockResolvedValue({ data: null, error: null });
      mockedCreateClient.mockReturnValue(sb as never);

      const result = await pushToServer('user-1', 'study', { score: 100 }, '2026-06-01T00:00:00Z');
      expect(result).toBe('pushed');
    });

    it('error: upsert fails with non-constraint error', async () => {
      const sb = makeBrowserSupabase({ queryResult: { data: null, error: null } });
      sb._builder.upsert.mockResolvedValue({
        data: null,
        error: { code: '42P01', message: 'table not found' },
      });
      mockedCreateClient.mockReturnValue(sb as never);

      // Suppress console.error from the module
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await pushToServer('user-1', 'study', { score: 100 });
      expect(result).toBe('error');
      spy.mockRestore();
    });

    it('error: check constraint violation (23514) returns error silently', async () => {
      const sb = makeBrowserSupabase({ queryResult: { data: null, error: null } });
      sb._builder.upsert.mockResolvedValue({
        data: null,
        error: { code: '23514', message: 'check constraint' },
      });
      mockedCreateClient.mockReturnValue(sb as never);

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await pushToServer('user-1', 'onboarding', { done: true });
      expect(result).toBe('error');
      // 23514 should NOT log
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it('pushed: no localUpdatedAt skips timestamp comparison', async () => {
      const sb = makeBrowserSupabase({ queryResult: { data: null, error: null } });
      sb._builder.upsert.mockResolvedValue({ data: null, error: null });
      mockedCreateClient.mockReturnValue(sb as never);

      const result = await pushToServer('user-1', 'quiz', { total: 10 });
      expect(result).toBe('pushed');
      // maybeSingle should not be called when no localUpdatedAt
      expect(sb._builder.maybeSingle).not.toHaveBeenCalled();
    });
  });

  // ─── pullFromServer ───

  describe('pullFromServer', () => {
    it('returns data on success', async () => {
      const sb = makeBrowserSupabase({
        queryResult: { data: { data: { score: 42 } }, error: null },
      });
      mockedCreateClient.mockReturnValue(sb as never);

      const result = await pullFromServer('user-1', 'study');
      expect(result).toEqual({ score: 42 });
    });

    it('returns null on error', async () => {
      const sb = makeBrowserSupabase({
        queryResult: { data: null, error: { message: 'fail' } },
      });
      mockedCreateClient.mockReturnValue(sb as never);

      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await pullFromServer('user-1', 'study');
      expect(result).toBeNull();
      spy.mockRestore();
    });

    it('returns null when no data row exists', async () => {
      const sb = makeBrowserSupabase({
        queryResult: { data: null, error: null },
      });
      mockedCreateClient.mockReturnValue(sb as never);

      const result = await pullFromServer('user-1', 'leitner');
      expect(result).toBeNull();
    });
  });

  // ─── pushStore (legacy) ───

  describe('pushStore', () => {
    it('no-op when user is not logged in', async () => {
      const sb = makeBrowserSupabase({ user: null, queryResult: { data: null, error: null } });
      mockedCreateClient.mockReturnValue(sb as never);

      await pushStore('study', { x: 1 });
      // from should not be called for upsert if no user
      expect(sb.from).not.toHaveBeenCalled();
    });

    it('calls pushToServer when logged in', async () => {
      const sb = makeBrowserSupabase({
        user: { id: 'user-1' },
        queryResult: { data: null, error: null },
      });
      sb._builder.upsert.mockResolvedValue({ data: null, error: null });
      mockedCreateClient.mockReturnValue(sb as never);

      await pushStore('study', { score: 10 });
      expect(sb.from).toHaveBeenCalled();
    });
  });

  // ─── pullStore (legacy) ───

  describe('pullStore', () => {
    it('returns null when not logged in', async () => {
      const sb = makeBrowserSupabase({ user: null });
      mockedCreateClient.mockReturnValue(sb as never);

      const result = await pullStore('study');
      expect(result).toBeNull();
    });
  });

  // ─── migrateGuestData ───

  describe('migrateGuestData', () => {
    it('reads localStorage and pushes existing stores', async () => {
      const sb = makeBrowserSupabase({
        queryResult: { data: null, error: null },
      });
      sb._builder.upsert.mockResolvedValue({ data: null, error: null });
      mockedCreateClient.mockReturnValue(sb as never);

      // Mock localStorage with valid Zustand persist format
      // Keys must match STORE_LS_KEYS in sync.ts
      const mockStorage: Record<string, string> = {
        'special-edu-study': JSON.stringify({
          state: { subject: 'math', doSomething: 'not a function' },
          version: 1,
        }),
        'quiz-data': JSON.stringify({
          state: { score: 99 },
          version: 1,
        }),
      };
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
        (key: string) => mockStorage[key] ?? null,
      );

      await migrateGuestData('user-1');
      // Should have called from('user_data') at least for study and quiz
      expect(sb.from).toHaveBeenCalled();
    });

    it('skips non-object localStorage values', async () => {
      const sb = makeBrowserSupabase({
        queryResult: { data: null, error: null },
      });
      sb._builder.upsert.mockResolvedValue({ data: null, error: null });
      mockedCreateClient.mockReturnValue(sb as never);

      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
        (key: string) => {
          if (key === 'special-edu-study') return JSON.stringify('just a string');
          return null;
        },
      );

      await migrateGuestData('user-1');
      // No push should happen for invalid data
      expect(sb.from).not.toHaveBeenCalled();
    });

    it('handles invalid JSON gracefully', async () => {
      const sb = makeBrowserSupabase({
        queryResult: { data: null, error: null },
      });
      mockedCreateClient.mockReturnValue(sb as never);

      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
        (key: string) => {
          if (key === 'special-edu-study') return '{invalid json';
          return null;
        },
      );

      // Should not throw
      await expect(migrateGuestData('user-1')).resolves.not.toThrow();
    });

    it('skips entries where state is not an object', async () => {
      const sb = makeBrowserSupabase({
        queryResult: { data: null, error: null },
      });
      sb._builder.upsert.mockResolvedValue({ data: null, error: null });
      mockedCreateClient.mockReturnValue(sb as never);

      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(
        (key: string) => {
          if (key === 'special-edu-study') return JSON.stringify({ state: 'not-object', version: 1 });
          return null;
        },
      );

      await migrateGuestData('user-1');
      expect(sb.from).not.toHaveBeenCalled();
    });
  });
});
