import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/browser', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/db/sync', () => ({
  pushToServer: vi.fn(),
  serializeState: (state: Record<string, unknown>) =>
    Object.fromEntries(Object.entries(state).filter(([, value]) => typeof value !== 'function')),
}));

import { createClient } from '@/lib/supabase/browser';
import { pushToServer } from '@/lib/db/sync';
import { pushSewNextSessionSnapshot } from '../session-sync';

const mockedCreateClient = vi.mocked(createClient);
const mockedPushToServer = vi.mocked(pushToServer);

function mockSupabaseUser(user: { id: string } | null) {
  mockedCreateClient.mockReturnValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
  } as never);
}

describe('pushSewNextSessionSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps guest sessions local without trying a server write', async () => {
    mockSupabaseUser(null);

    const result = await pushSewNextSessionSnapshot({
      studyState: { totalQuizzes: 2 },
      quizState: { quizHistory: [] },
    });

    expect(result.status).toBe('guest');
    expect(mockedPushToServer).not.toHaveBeenCalled();
  });

  it('pushes study and quiz stores immediately for signed-in users', async () => {
    mockSupabaseUser({ id: 'user-1' });
    mockedPushToServer.mockResolvedValue('pushed');

    const result = await pushSewNextSessionSnapshot({
      studyState: { totalQuizzes: 2, recordQuizResult: () => undefined },
      quizState: { quizHistory: [{ questionId: 'q1' }], addQuizResult: () => undefined },
    });

    expect(result.status).toBe('synced');
    expect(mockedPushToServer).toHaveBeenCalledWith('user-1', 'study', { totalQuizzes: 2 });
    expect(mockedPushToServer).toHaveBeenCalledWith('user-1', 'quiz', { quizHistory: [{ questionId: 'q1' }] });
  });

  it('reports partial sync when only one store write succeeds', async () => {
    mockSupabaseUser({ id: 'user-1' });
    mockedPushToServer
      .mockResolvedValueOnce('pushed')
      .mockResolvedValueOnce('error');

    const result = await pushSewNextSessionSnapshot({
      studyState: { totalQuizzes: 2 },
      quizState: { quizHistory: [] },
    });

    expect(result.status).toBe('partial');
  });
});
