import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { KiceExam } from '@/types/kice';

// Mock kice module
vi.mock('../kice', () => ({
  getAvailableExams: vi.fn(),
  getExam: vi.fn(),
}));

import { computeAnalytics } from '../kice-analytics';
import { getAvailableExams, getExam } from '../kice';

const mockedGetAvailableExams = vi.mocked(getAvailableExams);
const mockedGetExam = vi.mocked(getExam);

// ─── Test fixtures ───

function makeExam(questions: Array<{
  subjects: string[];
  keywords?: string[];
  type?: string;
  points?: number;
}>): KiceExam {
  return {
    exam: { year: 2024, title: 'test', subject: 'test', session: '전공A', period: 'test', total_questions: questions.length, total_points: 0, duration_minutes: 0, question_types: {} },
    questions: questions.map((q, i) => ({
      number: i + 1,
      type: q.type ?? '서술형',
      points: q.points ?? 4,
      question: `문제 ${i + 1}`,
      answer: `답 ${i + 1}`,
      subjects: q.subjects,
      keywords: q.keywords ?? [],
      analysis: '',
      difficulty: 'medium' as const,
    })),
  } as unknown as KiceExam;
}

describe('kice-analytics: computeAnalytics', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('시험 데이터 없으면 빈 결과 반환', () => {
    mockedGetAvailableExams.mockReturnValue([]);

    const result = computeAnalytics();
    expect(result.subjectFrequencies).toEqual([]);
    expect(result.topKeywords).toEqual([]);
    expect(result.yearSummaries).toEqual([]);
    expect(result.allYears).toEqual([]);
  });

  it('과목별 출제 빈도 집계', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2024 전공A.json' },
    ]);
    mockedGetExam.mockReturnValue(
      makeExam([
        { subjects: ['행동지원', '교육과정'] },
        { subjects: ['행동지원'] },
        { subjects: ['통합교육'] },
      ])
    );

    const result = computeAnalytics();
    const behaviorSupport = result.subjectFrequencies.find((s) => s.subject === '행동지원');
    expect(behaviorSupport).toBeTruthy();
    expect(behaviorSupport!.total).toBe(2);
    expect(behaviorSupport!.yearCounts[2024]).toBe(2);
  });

  it('키워드 빈도 + 최근 연속 출제 계산', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2022, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2022.json' },
      { year: 2023, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2023.json' },
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2024.json' },
    ]);
    mockedGetExam.mockImplementation((year) => {
      if (year === 2022) return makeExam([{ subjects: ['행동지원'], keywords: ['PBS', 'ABA'] }]);
      if (year === 2023) return makeExam([{ subjects: ['행동지원'], keywords: ['PBS'] }]);
      if (year === 2024) return makeExam([{ subjects: ['행동지원'], keywords: ['PBS', 'FBA'] }]);
      return null;
    });

    const result = computeAnalytics();

    // PBS: 3년 연속 (2022, 2023, 2024)
    const pbs = result.topKeywords.find((kw) => kw.keyword === 'PBS');
    expect(pbs).toBeTruthy();
    expect(pbs!.count).toBe(3);
    expect(pbs!.recentStreak).toBe(3);
    expect(pbs!.lastYear).toBe(2024);

    // ABA: 1년만 (2022)
    const aba = result.topKeywords.find((kw) => kw.keyword === 'ABA');
    expect(aba!.recentStreak).toBe(1);
  });

  it('recentStreakKeywords: 3년+ 연속 키워드 필터', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2021, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2021.json' },
      { year: 2022, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2022.json' },
      { year: 2023, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2023.json' },
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2024.json' },
    ]);
    mockedGetExam.mockImplementation((year) =>
      makeExam([{ subjects: ['행동지원'], keywords: year >= 2022 ? ['긍정적행동지원'] : ['기타'] }])
    );

    const result = computeAnalytics();
    // 긍정적행동지원: 2022~2024 = 3년 연속
    expect(result.recentStreakKeywords.some((kw) => kw.keyword === '긍정적행동지원')).toBe(true);
    // 기타: 2021만 = 연속 아님
    expect(result.recentStreakKeywords.some((kw) => kw.keyword === '기타')).toBe(false);
  });

  it('neverTestedKeywords: 1회 출제, 5년+ 전 키워드', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2018, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2018.json' },
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2024.json' },
    ]);
    mockedGetExam.mockImplementation((year) => {
      if (year === 2018) return makeExam([{ subjects: ['시각장애'], keywords: ['점자규정'] }]);
      if (year === 2024) return makeExam([{ subjects: ['행동지원'], keywords: ['FBA'] }]);
      return null;
    });

    const result = computeAnalytics();
    // 점자규정: 2018 1회, 2024-2018=6 > 5
    expect(result.neverTestedKeywords.some((s) => s.includes('점자규정'))).toBe(true);
    // FBA: 2024 최신 → 미포함
    expect(result.neverTestedKeywords.some((s) => s.includes('FBA'))).toBe(false);
  });

  it('yearSummaries 연도별 문제 수/평균 배점', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2024 전공A.json' },
    ]);
    mockedGetExam.mockReturnValue(
      makeExam([
        { subjects: ['행동지원'], type: '서술형', points: 4 },
        { subjects: ['교육과정'], type: '기입형', points: 2 },
      ])
    );

    const result = computeAnalytics();
    expect(result.yearSummaries).toHaveLength(1);

    const summary = result.yearSummaries[0];
    expect(summary.year).toBe(2024);
    expect(summary.questionCount).toBe(2);
    expect(summary.avgPoints).toBe(3); // (4+2)/2
    expect(summary.typeDistribution['서술형']).toBe(1);
    expect(summary.typeDistribution['기입형']).toBe(1);
  });

  it('allYears 오름차순 정렬', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2024.json' },
      { year: 2020, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2020.json' },
      { year: 2022, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2022.json' },
    ]);
    mockedGetExam.mockReturnValue(makeExam([{ subjects: ['행동지원'] }]));

    const result = computeAnalytics();
    expect(result.allYears).toEqual([2020, 2022, 2024]);
  });

  it('isIsomorphic / isPredicted 시험은 제외', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '원본.json' },
      { year: 2024, session: '동형', isIsomorphic: true, isPredicted: false, filename: 'iso.json' },
      { year: 2025, session: '예상', isIsomorphic: false, isPredicted: true, filename: 'pred.json' },
    ]);
    mockedGetExam.mockReturnValue(makeExam([{ subjects: ['행동지원'], keywords: ['PBS'] }]));

    const result = computeAnalytics();
    // 원본 1개만 집계
    expect(result.yearSummaries).toHaveLength(1);
    expect(result.yearSummaries[0].year).toBe(2024);
  });

  it('topKeywords는 최대 30개', () => {
    // 35개 서로 다른 키워드 생성
    const keywords = Array.from({ length: 35 }, (_, i) => `kw-${i}`);
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2024.json' },
    ]);
    mockedGetExam.mockReturnValue(
      makeExam(keywords.map((kw) => ({ subjects: ['행동지원'], keywords: [kw] })))
    );

    const result = computeAnalytics();
    expect(result.topKeywords.length).toBeLessThanOrEqual(30);
  });

  it('subjectFrequencies는 total 내림차순 정렬', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '전공A', isIsomorphic: false, isPredicted: false,  filename: '2024.json' },
    ]);
    mockedGetExam.mockReturnValue(
      makeExam([
        { subjects: ['행동지원'] },
        { subjects: ['행동지원'] },
        { subjects: ['행동지원'] },
        { subjects: ['교육과정'] },
      ])
    );

    const result = computeAnalytics();
    expect(result.subjectFrequencies[0].subject).toBe('행동지원');
    expect(result.subjectFrequencies[0].total).toBe(3);
  });
});
