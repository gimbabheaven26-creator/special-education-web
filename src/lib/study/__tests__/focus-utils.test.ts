import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/date-utils', () => ({
  getKSTDate: () => '2026-03-30',
}));

import { pickWeakestSubject, generateDailyMission } from '../focus-utils';

describe('pickWeakestSubject', () => {
  const allSlugs = ['diagnosis', 'behavior', 'inclusive'];

  it('아직 시도하지 않은 과목을 우선 반환한다', () => {
    const stats = [
      { slug: 'diagnosis', attempted: 10, correct: 8, totalQuestions: 50 },
    ];
    const result = pickWeakestSubject(stats, allSlugs);
    expect(result).toBe('behavior'); // 첫 번째 untouched
  });

  it('모두 시도했으면 정답률×커버리지 최하위 반환', () => {
    const stats = [
      { slug: 'diagnosis', attempted: 10, correct: 9, totalQuestions: 50 },
      { slug: 'behavior', attempted: 5, correct: 1, totalQuestions: 50 },
      { slug: 'inclusive', attempted: 20, correct: 15, totalQuestions: 50 },
    ];
    const result = pickWeakestSubject(stats, allSlugs);
    expect(result).toBe('behavior'); // 가장 낮은 score
  });

  it('빈 slug 목록이면 null 반환', () => {
    expect(pickWeakestSubject([], [])).toBeNull();
  });

  it('stats가 비어있으면 첫 slug 반환', () => {
    expect(pickWeakestSubject([], allSlugs)).toBe('diagnosis');
  });
});

describe('generateDailyMission', () => {
  it('오답이 있으면 오답 복습 블록 생성', () => {
    const mission = generateDailyMission({
      focusSubject: 'diagnosis',
      wrongNoteCount: 10,
      dueFlashcardCount: 0,
      todayQuizCount: 0,
    });

    const wrongBlock = mission.blocks.find((b) => b.type === 'wrong-review');
    expect(wrongBlock).toBeDefined();
    expect(wrongBlock!.count).toBe(5); // min(10, 5)
    expect(wrongBlock!.href).toBe('/wrong-notes');
  });

  it('플래시카드 블록 href가 /flashcards/review이다', () => {
    const mission = generateDailyMission({
      focusSubject: null,
      wrongNoteCount: 0,
      dueFlashcardCount: 3,
      todayQuizCount: 0,
    });

    const fcBlock = mission.blocks.find((b) => b.type === 'flashcard');
    expect(fcBlock).toBeDefined();
    expect(fcBlock!.href).toBe('/flashcards/review');
  });

  it('퀴즈 블록에 집중 과목 쿼리 파라미터 포함', () => {
    const mission = generateDailyMission({
      focusSubject: 'behavior',
      wrongNoteCount: 0,
      dueFlashcardCount: 0,
      todayQuizCount: 0,
    });

    const quizBlock = mission.blocks.find((b) => b.type === 'quiz');
    expect(quizBlock).toBeDefined();
    expect(quizBlock!.href).toBe('/quiz/ox?subject=behavior');
  });

  it('블록 2개 미만이면 용어 블록 추가 (최소 3개)', () => {
    const mission = generateDailyMission({
      focusSubject: null,
      wrongNoteCount: 0,
      dueFlashcardCount: 0,
      todayQuizCount: 10,
    });

    // quiz + term = 2개 (quiz는 항상 추가됨)
    expect(mission.blocks.length).toBeGreaterThanOrEqual(2);
    const termBlock = mission.blocks.find((b) => b.type === 'term');
    expect(termBlock).toBeDefined();
  });

  it('오답+플래시카드+퀴즈+개념 = 4개 이상이면 용어 블록 없음', () => {
    const mission = generateDailyMission({
      focusSubject: 'diagnosis',
      wrongNoteCount: 5,
      dueFlashcardCount: 3,
      todayQuizCount: 0,
    });

    expect(mission.blocks.length).toBe(4);
    expect(mission.blocks.find((b) => b.type === 'concept')).toBeDefined();
    expect(mission.blocks.find((b) => b.type === 'term')).toBeUndefined();
  });

  it('todayQuizCount < 5이면 10문제, 아니면 5문제', () => {
    const fresh = generateDailyMission({
      focusSubject: null,
      wrongNoteCount: 0,
      dueFlashcardCount: 0,
      todayQuizCount: 2,
    });
    expect(fresh.blocks.find((b) => b.type === 'quiz')!.count).toBe(10);

    const done = generateDailyMission({
      focusSubject: null,
      wrongNoteCount: 0,
      dueFlashcardCount: 0,
      todayQuizCount: 8,
    });
    expect(done.blocks.find((b) => b.type === 'quiz')!.count).toBe(5);
  });

  it('date와 focusSubject가 정확하다', () => {
    const mission = generateDailyMission({
      focusSubject: 'behavior',
      wrongNoteCount: 0,
      dueFlashcardCount: 0,
      todayQuizCount: 0,
    });

    expect(mission.date).toBe('2026-03-30');
    expect(mission.focusSubject).toBe('behavior');
  });
});
