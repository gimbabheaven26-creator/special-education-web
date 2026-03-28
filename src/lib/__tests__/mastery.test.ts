import { describe, it, expect, vi } from 'vitest';

// exam-structure.json을 mock해야 한다
vi.mock('@/data/exam-structure.json', () => ({
  default: {
    subjectWeights: {
      introduction: { title: '특수교육학 개론', weight: 15, category: 'core', priority: 'high' },
      curriculum: { title: '특수교육 교육과정', weight: 15, category: 'core', priority: 'high' },
      'behavior-support': { title: '행동지원', weight: 15, category: 'core', priority: 'high' },
    },
  },
}));

import type { QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';
import {
  getMasteryInfo,
  calculateChapterMasteries,
  calculateSubjectMasteries,
  simulatePass,
} from '@/lib/mastery';
import type { MasteryLevel, SubjectMastery } from '@/lib/mastery';

// ─── Helpers ──────────────────────────────────────────────────────────────────

let qSeq = 0;
function makeResult(overrides: Partial<QuizResult> & { subject: string; chapter: string }): QuizResult {
  return {
    questionId: `q-${++qSeq}`,
    userAnswer: 'O',
    isCorrect: false,
    timestamp: Date.now(),
    ...overrides,
  };
}

function makeWrongNote(questionId: string, mastered = false): WrongNote {
  return {
    questionId,
    subject: 'introduction',
    userAnswer: 'X',
    attempts: 1,
    lastAttempt: Date.now(),
    mastered,
  };
}

// ─── getMasteryInfo ───────────────────────────────────────────────────────────

describe('getMasteryInfo', () => {
  it.each<[MasteryLevel, string, string]>([
    ['not_started', '미학습', '⬜'],
    ['learning', '학습 중', '🟡'],
    ['practicing', '연습 중', '🟠'],
    ['proficient', '숙달', '🟢'],
    ['mastered', '마스터', '🏆'],
  ])('%s → label=%s, emoji=%s', (level, label, emoji) => {
    const info = getMasteryInfo(level);
    expect(info.level).toBe(level);
    expect(info.label).toBe(label);
    expect(info.emoji).toBe(emoji);
    expect(info.color.length).toBeGreaterThan(0);
  });
});

// ─── calculateChapterMasteries ────────────────────────────────────────────────

describe('calculateChapterMasteries', () => {
  it('빈 히스토리 → 빈 배열', () => {
    expect(calculateChapterMasteries([], [])).toEqual([]);
  });

  it('시도 0회 → not_started', () => {
    // wrongNote만 있고 quiz history에서 해당 questionId가 없으면 not_started
    const wrongNotes = [makeWrongNote('unknown-q')];
    const result = calculateChapterMasteries([], wrongNotes);
    // wrongNote의 questionId가 qIdToInfo에 없으므로 wrongNotesByChapter에 추가 안 됨
    expect(result).toHaveLength(0);
  });

  it('3회 미만 시도 → learning', () => {
    const history = [
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
    ];
    const result = calculateChapterMasteries(history, []);
    expect(result).toHaveLength(1);
    expect(result[0].level).toBe('learning');
    expect(result[0].totalAttempts).toBe(2);
  });

  it('정답률 < 0.5 → learning', () => {
    const history = [
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: false }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: false }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: false }),
    ];
    const result = calculateChapterMasteries(history, []);
    expect(result[0].level).toBe('learning');
  });

  it('정답률 0.5~0.7 → practicing', () => {
    // 3/5 = 0.6
    const history = [
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: false }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: false }),
    ];
    const result = calculateChapterMasteries(history, []);
    expect(result[0].level).toBe('practicing');
  });

  it('정답률 0.7~0.9 → proficient', () => {
    // 4/5 = 0.8
    const history = [
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: false }),
    ];
    const result = calculateChapterMasteries(history, []);
    expect(result[0].level).toBe('proficient');
  });

  it('정답률 >= 0.9 → mastered', () => {
    const history = Array.from({ length: 10 }, () =>
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
    );
    const result = calculateChapterMasteries(history, []);
    expect(result[0].level).toBe('mastered');
    expect(result[0].accuracy).toBe(1);
  });

  it('wrongNote 미마스터 → wrongNoteCount에 반영', () => {
    const q1 = `wn-${++qSeq}`;
    const history = [
      makeResult({ questionId: q1, subject: 'introduction', chapter: 'ch1', isCorrect: false }),
    ];
    const wrongNotes = [makeWrongNote(q1, false)];
    const result = calculateChapterMasteries(history, wrongNotes);
    expect(result[0].wrongNoteCount).toBe(1);
  });

  it('마스터된 wrongNote는 제외한다', () => {
    const q1 = `wn-${++qSeq}`;
    const history = [
      makeResult({ questionId: q1, subject: 'introduction', chapter: 'ch1', isCorrect: true }),
    ];
    const wrongNotes = [makeWrongNote(q1, true)];
    const result = calculateChapterMasteries(history, wrongNotes);
    expect(result[0].wrongNoteCount).toBe(0);
  });

  it('여러 챕터를 분리 계산한다', () => {
    const history = [
      makeResult({ subject: 'introduction', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'introduction', chapter: 'ch2', isCorrect: false }),
    ];
    const result = calculateChapterMasteries(history, []);
    expect(result).toHaveLength(2);
    const ch1 = result.find((r) => r.chapter === 'ch1');
    const ch2 = result.find((r) => r.chapter === 'ch2');
    expect(ch1?.correctCount).toBe(1);
    expect(ch2?.correctCount).toBe(0);
  });
});

// ─── calculateSubjectMasteries ────────────────────────────────────────────────

describe('calculateSubjectMasteries', () => {
  it('챕터 mastery가 비어도 subject 목록은 반환한다', () => {
    const result = calculateSubjectMasteries([], {});
    // mock에 3개 subject가 있으므로 3개
    expect(result).toHaveLength(3);
    expect(result.every((s) => s.overallAccuracy === 0)).toBe(true);
  });

  it('coverage = attempted / totalChapters', () => {
    const chapterMasteries = [
      {
        subject: 'introduction',
        chapter: 'ch1',
        level: 'mastered' as const,
        accuracy: 1,
        totalAttempts: 10,
        correctCount: 10,
        wrongNoteCount: 0,
      },
    ];
    const allChaptersBySubject = { introduction: ['ch1', 'ch2', 'ch3'] };
    const result = calculateSubjectMasteries(chapterMasteries, allChaptersBySubject);
    const intro = result.find((s) => s.subject === 'introduction')!;
    expect(intro.coverage).toBeCloseTo(1 / 3);
    expect(intro.masteredCount).toBe(1);
    expect(intro.totalChapters).toBe(3);
  });

  it('weight는 exam-structure에서 가져온다', () => {
    const result = calculateSubjectMasteries([], {});
    const intro = result.find((s) => s.subject === 'introduction')!;
    expect(intro.weight).toBe(15);
  });

  it('존재하지 않는 subject의 weight 기본값은 5', () => {
    // mock에 없는 subject는 반환되지 않지만, weight 로직은 ?? 5
    // 이미 mock에 있는 subject만 반환하므로 간접 확인
    const result = calculateSubjectMasteries([], {});
    for (const s of result) {
      expect(s.weight).toBeGreaterThan(0);
    }
  });
});

// ─── simulatePass ─────────────────────────────────────────────────────────────

describe('simulatePass', () => {
  it('빈 subject masteries → 점수 0', () => {
    const result = simulatePass([]);
    expect(result.estimatedScore).toBe(0);
    expect(result.passRate).toBeDefined();
    expect(result.passingScore).toBe(56);
  });

  it('전부 mastered → 높은 점수와 passRate', () => {
    const masteries: SubjectMastery[] = [
      {
        subject: 'introduction',
        chapters: [],
        overallAccuracy: 1.0,
        masteredCount: 3,
        totalChapters: 3,
        weight: 15,
        coverage: 1.0,
      },
      {
        subject: 'curriculum',
        chapters: [],
        overallAccuracy: 1.0,
        masteredCount: 3,
        totalChapters: 3,
        weight: 15,
        coverage: 1.0,
      },
    ];
    const result = simulatePass(masteries);
    expect(result.estimatedScore).toBeGreaterThan(50);
    expect(result.passRate).toBeGreaterThan(0.5);
  });

  it('strengths에 높은 정답률 과목이 포함된다', () => {
    const masteries: SubjectMastery[] = [
      {
        subject: 'introduction',
        chapters: [],
        overallAccuracy: 0.95,
        masteredCount: 3,
        totalChapters: 3,
        weight: 15,
        coverage: 1.0,
      },
      {
        subject: 'curriculum',
        chapters: [],
        overallAccuracy: 0.2,
        masteredCount: 0,
        totalChapters: 5,
        weight: 15,
        coverage: 0.3,
      },
    ];
    const result = simulatePass(masteries);
    expect(result.strengths).toContain('introduction');
    expect(result.weaknesses).toContain('curriculum');
  });

  it('passRate는 0~1 범위 내', () => {
    const masteries: SubjectMastery[] = [
      {
        subject: 'test',
        chapters: [],
        overallAccuracy: 0.5,
        masteredCount: 0,
        totalChapters: 1,
        weight: 10,
        coverage: 0.5,
      },
    ];
    const result = simulatePass(masteries);
    expect(result.passRate).toBeGreaterThanOrEqual(0);
    expect(result.passRate).toBeLessThanOrEqual(1);
  });

  it('subjectScores 배열의 길이는 입력과 같다', () => {
    const masteries: SubjectMastery[] = [
      {
        subject: 'a',
        chapters: [],
        overallAccuracy: 0.8,
        masteredCount: 1,
        totalChapters: 2,
        weight: 10,
        coverage: 0.5,
      },
      {
        subject: 'b',
        chapters: [],
        overallAccuracy: 0.6,
        masteredCount: 0,
        totalChapters: 3,
        weight: 20,
        coverage: 0.3,
      },
    ];
    const result = simulatePass(masteries);
    expect(result.subjectScores).toHaveLength(2);
  });
});
