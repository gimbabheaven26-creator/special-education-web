import { describe, it, expect } from 'vitest';
import type { QuizQuestion } from '@/types/quiz';
import {
  getChapterProficiency,
  getSubjectProficiency,
  sortByAdaptiveDifficulty,
  getProficiencyLabel,
  getProficiencyColor,
} from '@/lib/adaptive-difficulty';
import type { Proficiency } from '@/lib/adaptive-difficulty';

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface QuizHistoryEntry {
  questionId: string;
  isCorrect: boolean;
  chapter: string;
  subject?: string;
}

let qId = 0;
function entry(chapter: string, isCorrect: boolean, subject?: string): QuizHistoryEntry {
  return { questionId: `q-${++qId}`, isCorrect, chapter, subject };
}

function makeQuestion(
  overrides: Partial<QuizQuestion> & { chapter: string; difficulty: 1 | 2 | 3 },
): QuizQuestion {
  return {
    id: `q-${++qId}`,
    subject: 'introduction',
    type: 'ox',
    question: 'test?',
    answer: 'O',
    explanation: '',
    ...overrides,
  };
}

// ─── getChapterProficiency ────────────────────────────────────────────────────

describe('getChapterProficiency', () => {
  it('빈 히스토리 → beginner, accuracy 0', () => {
    const info = getChapterProficiency('ch1', []);
    expect(info.level).toBe('beginner');
    expect(info.accuracy).toBe(0);
    expect(info.totalAttempts).toBe(0);
    expect(info.recommendedDifficulty).toBe(1);
  });

  it('3회 미만 시도 → beginner (정답률 무관)', () => {
    const history = [entry('ch1', true), entry('ch1', true)];
    const info = getChapterProficiency('ch1', history);
    expect(info.level).toBe('beginner');
    expect(info.totalAttempts).toBe(2);
  });

  it('정답률 < 0.5 → beginner', () => {
    const history = [
      entry('ch1', true),
      entry('ch1', false),
      entry('ch1', false),
      entry('ch1', false),
    ];
    const info = getChapterProficiency('ch1', history);
    expect(info.level).toBe('beginner');
    expect(info.accuracy).toBe(0.25);
  });

  it('정답률 0.5~0.7 → developing', () => {
    // 3/5 = 0.6
    const history = [
      entry('ch1', true),
      entry('ch1', true),
      entry('ch1', true),
      entry('ch1', false),
      entry('ch1', false),
    ];
    const info = getChapterProficiency('ch1', history);
    expect(info.level).toBe('developing');
    expect(info.accuracy).toBeCloseTo(0.6);
  });

  it('정답률 0.7~0.9 → proficient', () => {
    // 4/5 = 0.8
    const history = [
      entry('ch1', true),
      entry('ch1', true),
      entry('ch1', true),
      entry('ch1', true),
      entry('ch1', false),
    ];
    const info = getChapterProficiency('ch1', history);
    expect(info.level).toBe('proficient');
    expect(info.recommendedDifficulty).toBe(2);
  });

  it('정답률 >= 0.9 → mastered', () => {
    // 10/10 = 1.0
    const history = Array.from({ length: 10 }, () => entry('ch1', true));
    const info = getChapterProficiency('ch1', history);
    expect(info.level).toBe('mastered');
    expect(info.recommendedDifficulty).toBe(3);
    expect(info.label).toBe('마스터');
    expect(info.color).toBe('text-green-500');
  });

  it('다른 챕터 결과는 무시한다', () => {
    const history = [
      entry('ch1', true),
      entry('ch2', false),
      entry('ch2', false),
      entry('ch2', false),
    ];
    const info = getChapterProficiency('ch1', history);
    expect(info.totalAttempts).toBe(1);
  });
});

// ─── getSubjectProficiency ────────────────────────────────────────────────────

describe('getSubjectProficiency', () => {
  it('빈 히스토리 → beginner', () => {
    const info = getSubjectProficiency('math', []);
    expect(info.level).toBe('beginner');
    expect(info.accuracy).toBe(0);
  });

  it('subject 기준으로 필터링한다', () => {
    const history = [
      entry('ch1', true, 'math'),
      entry('ch1', true, 'math'),
      entry('ch1', true, 'math'),
      entry('ch1', false, 'science'),
    ];
    const info = getSubjectProficiency('math', history);
    expect(info.totalAttempts).toBe(3);
    expect(info.accuracy).toBe(1);
  });

  it('mastered 레벨 확인', () => {
    const history = Array.from({ length: 10 }, () => entry('ch1', true, 'math'));
    const info = getSubjectProficiency('math', history);
    expect(info.level).toBe('mastered');
  });
});

// ─── sortByAdaptiveDifficulty ─────────────────────────────────────────────────

describe('sortByAdaptiveDifficulty', () => {
  it('빈 배열 → 빈 배열', () => {
    const result = sortByAdaptiveDifficulty([], []);
    expect(result).toEqual([]);
  });

  it('히스토리 없으면 difficulty 1이 우선', () => {
    const questions = [
      makeQuestion({ chapter: 'ch1', difficulty: 3 }),
      makeQuestion({ chapter: 'ch1', difficulty: 1 }),
      makeQuestion({ chapter: 'ch1', difficulty: 2 }),
    ];
    const sorted = sortByAdaptiveDifficulty(questions, []);
    expect(sorted[0].difficulty).toBe(1);
  });

  it('mastered 챕터 → difficulty 3 우선', () => {
    const history = Array.from({ length: 20 }, () => entry('ch1', true));
    const questions = [
      makeQuestion({ chapter: 'ch1', difficulty: 1 }),
      makeQuestion({ chapter: 'ch1', difficulty: 3 }),
      makeQuestion({ chapter: 'ch1', difficulty: 2 }),
    ];
    const sorted = sortByAdaptiveDifficulty(questions, history);
    expect(sorted[0].difficulty).toBe(3);
  });

  it('원본 배열을 변경하지 않는다 (immutability)', () => {
    const questions = [
      makeQuestion({ chapter: 'ch1', difficulty: 3 }),
      makeQuestion({ chapter: 'ch1', difficulty: 1 }),
    ];
    const original = [...questions];
    sortByAdaptiveDifficulty(questions, []);
    expect(questions[0].id).toBe(original[0].id);
    expect(questions[1].id).toBe(original[1].id);
  });
});

// ─── getProficiencyLabel / getProficiencyColor ────────────────────────────────

describe('getProficiencyLabel', () => {
  it.each<[Proficiency, string]>([
    ['beginner', '입문'],
    ['developing', '발전 중'],
    ['proficient', '숙련'],
    ['mastered', '마스터'],
  ])('%s → %s', (level, expected) => {
    expect(getProficiencyLabel(level)).toBe(expected);
  });
});

describe('getProficiencyColor', () => {
  it.each<[Proficiency, string]>([
    ['beginner', 'text-red-500'],
    ['developing', 'text-amber-500'],
    ['proficient', 'text-blue-500'],
    ['mastered', 'text-green-500'],
  ])('%s → %s', (level, expected) => {
    expect(getProficiencyColor(level)).toBe(expected);
  });
});
