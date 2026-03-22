import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase browser client before importing analytics
const mockInsert = vi.fn().mockResolvedValue({ error: null });
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/browser', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: () => ({ insert: mockInsert }),
  }),
}));

import { logEvent, logQuizCompleted, logWrongNoteMastered, logDailyStreak } from '../analytics';

describe('analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
  });

  describe('logEvent', () => {
    it('비로그인 사용자는 insert를 호출하지 않는다', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      await logEvent({ type: 'quiz_completed', subject: 's', chapter: 'c', score: 5, total: 10 });

      expect(mockInsert).not.toHaveBeenCalled();
    });

    it('로그인 사용자는 이벤트를 insert한다', async () => {
      await logEvent({ type: 'quiz_completed', subject: 's', chapter: 'c', score: 5, total: 10 });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'user-1',
          event_type: 'quiz_completed',
          payload: { type: 'quiz_completed', subject: 's', chapter: 'c', score: 5, total: 10 },
        }),
      );
    });

    it('insert 실패해도 예외를 던지지 않는다', async () => {
      mockInsert.mockRejectedValueOnce(new Error('DB error'));

      await expect(
        logEvent({ type: 'daily_streak', streak: 7, date: '2026-03-22' }),
      ).resolves.toBeUndefined();
    });

    it('getUser 실패해도 예외를 던지지 않는다', async () => {
      mockGetUser.mockRejectedValueOnce(new Error('Auth error'));

      await expect(
        logEvent({ type: 'wrong_note_mastered', questionId: 'q1', attempts: 3 }),
      ).resolves.toBeUndefined();
    });
  });

  describe('convenience helpers', () => {
    it('logQuizCompleted는 quiz_completed 이벤트를 전달한다', async () => {
      await logQuizCompleted('행동수정', '기본이론', 8, 10);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'quiz_completed',
          payload: expect.objectContaining({ subject: '행동수정', chapter: '기본이론', score: 8, total: 10 }),
        }),
      );
    });

    it('logWrongNoteMastered는 wrong_note_mastered 이벤트를 전달한다', async () => {
      await logWrongNoteMastered('q-42', 5);

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'wrong_note_mastered',
          payload: expect.objectContaining({ questionId: 'q-42', attempts: 5 }),
        }),
      );
    });

    it('logDailyStreak는 daily_streak 이벤트를 전달한다', async () => {
      await logDailyStreak(14, '2026-03-22');

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'daily_streak',
          payload: expect.objectContaining({ streak: 14, date: '2026-03-22' }),
        }),
      );
    });
  });
});
