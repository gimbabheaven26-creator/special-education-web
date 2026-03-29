import { describe, it, expect, vi } from 'vitest';

// kice 모듈을 모킹 — structure-utils는 getAvailableExams, getExam에 의존
vi.mock('@/lib/kice/kice', () => ({
  getAvailableExams: vi.fn(),
  getExam: vi.fn(),
}));

import { getKiceCounts } from '@/lib/content/structure-utils';
import { getAvailableExams, getExam } from '@/lib/kice/kice';

const mockedGetAvailableExams = vi.mocked(getAvailableExams);
const mockedGetExam = vi.mocked(getExam);

describe('structure-utils — getKiceCounts', () => {
  it('기본 집계 — subject와 chapter 카운트를 반환', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '1', filename: '2024-1.json', isIsomorphic: false, isPredicted: false },
    ] as ReturnType<typeof getAvailableExams>);

    mockedGetExam.mockReturnValue({
      exam: { year: 2024, session: '1' },
      questions: [
        { subjects: ['행동수정', '통합교육'], chapters: ['1장', '3장'] },
        { subjects: ['행동수정'], chapters: ['1장'] },
      ],
    } as unknown as ReturnType<typeof getExam>);

    const counts = getKiceCounts();

    expect(counts.bySubject['행동수정']).toBe(2);
    expect(counts.bySubject['통합교육']).toBe(1);
    expect(counts.byChapter['1장']).toBe(2);
    expect(counts.byChapter['3장']).toBe(1);
  });

  it('isIsomorphic 항목은 제외', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '1', filename: '2024-1.json', isIsomorphic: true, isPredicted: false },
    ] as ReturnType<typeof getAvailableExams>);

    mockedGetExam.mockReturnValue(null as ReturnType<typeof getExam>);

    const counts = getKiceCounts();
    expect(counts.bySubject).toEqual({});
    expect(counts.byChapter).toEqual({});
  });

  it('isPredicted 항목은 제외', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '1', filename: '2024-1.json', isIsomorphic: false, isPredicted: true },
    ] as ReturnType<typeof getAvailableExams>);

    const counts = getKiceCounts();
    expect(counts.bySubject).toEqual({});
  });

  it('getExam이 null 반환 시 해당 항목 건너뜀', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '1', filename: '2024-1.json', isIsomorphic: false, isPredicted: false },
    ] as ReturnType<typeof getAvailableExams>);

    mockedGetExam.mockReturnValue(null as ReturnType<typeof getExam>);

    const counts = getKiceCounts();
    expect(counts.bySubject).toEqual({});
    expect(counts.byChapter).toEqual({});
  });

  it('subjects/chapters가 없는(undefined) 문제는 무시', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2024, session: '1', filename: '2024-1.json', isIsomorphic: false, isPredicted: false },
    ] as ReturnType<typeof getAvailableExams>);

    mockedGetExam.mockReturnValue({
      exam: { year: 2024, session: '1' },
      questions: [
        { subjects: undefined, chapters: undefined },
        { subjects: ['진단평가'], chapters: [] },
      ],
    } as unknown as ReturnType<typeof getExam>);

    const counts = getKiceCounts();
    expect(counts.bySubject['진단평가']).toBe(1);
    expect(Object.keys(counts.byChapter).length).toBe(0);
  });

  it('빈 시험 목록 → 빈 결과', () => {
    mockedGetAvailableExams.mockReturnValue([]);
    const counts = getKiceCounts();
    expect(counts.bySubject).toEqual({});
    expect(counts.byChapter).toEqual({});
  });

  it('여러 시험의 카운트가 누적된다', () => {
    mockedGetAvailableExams.mockReturnValue([
      { year: 2023, session: '1', filename: '2023-1.json', isIsomorphic: false, isPredicted: false },
      { year: 2024, session: '1', filename: '2024-1.json', isIsomorphic: false, isPredicted: false },
    ] as ReturnType<typeof getAvailableExams>);

    mockedGetExam.mockImplementation((year: number) => {
      if (year === 2023) {
        return {
          exam: { year: 2023, session: '1' },
          questions: [{ subjects: ['행동수정'], chapters: ['A'] }],
        } as ReturnType<typeof getExam>;
      }
      return {
        exam: { year: 2024, session: '1' },
        questions: [{ subjects: ['행동수정'], chapters: ['B'] }],
      } as ReturnType<typeof getExam>;
    });

    const counts = getKiceCounts();
    expect(counts.bySubject['행동수정']).toBe(2);
    expect(counts.byChapter['A']).toBe(1);
    expect(counts.byChapter['B']).toBe(1);
  });
});
