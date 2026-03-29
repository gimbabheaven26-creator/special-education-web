/**
 * 클라이언트 이벤트 로깅 유틸리티.
 *
 * 현재는 Supabase user_data 테이블에 이벤트를 기록한다.
 * 향후 Mixpanel/Amplitude 등 외부 서비스로 교체 가능하도록
 * 단일 진입점(logEvent)을 제공한다.
 */

import { createClient } from '@/lib/supabase/browser';

// ─── Event types ───

export type AnalyticsEvent =
  | { type: 'quiz_completed'; subject: string; chapter: string; score: number; total: number }
  | { type: 'wrong_note_mastered'; questionId: string; attempts: number }
  | { type: 'daily_streak'; streak: number; date: string };

// ─── Core ───

/**
 * 이벤트를 로깅한다. 실패해도 사용자 흐름을 차단하지 않는다.
 */
export async function logEvent(event: AnalyticsEvent): Promise<void> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // 비로그인 사용자는 로깅 스킵

    await supabase.from('analytics_events').insert({
      user_id: user.id,
      event_type: event.type,
      payload: event,
      created_at: new Date().toISOString(),
    });
  } catch {
    // 로깅 실패는 무시 — 사용자 경험에 영향 없음
  }
}

// ─── Convenience helpers ───

export function logQuizCompleted(
  subject: string,
  chapter: string,
  score: number,
  total: number,
): Promise<void> {
  return logEvent({ type: 'quiz_completed', subject, chapter, score, total });
}

export function logWrongNoteMastered(questionId: string, attempts: number): Promise<void> {
  return logEvent({ type: 'wrong_note_mastered', questionId, attempts });
}

export function logDailyStreak(streak: number, date: string): Promise<void> {
  return logEvent({ type: 'daily_streak', streak, date });
}
