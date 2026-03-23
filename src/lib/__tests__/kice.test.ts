import { describe, it, expect } from 'vitest'
import { getDefaultExamEntry } from '../kice'
import type { ExamEntry } from '@/types/kice'

/**
 * 파일 정렬 로직: kice.ts의 getAvailableExams에서 사용하는 정렬 함수.
 * 인라인 로직이므로 동일한 score 함수를 추출하여 테스트.
 */
function sortExamFiles(files: string[]): string[] {
  return [...files].sort((a, b) => {
    const score = (f: string) => (f.includes('예상') ? 2 : 0) + (f.includes('동형') ? 1 : 0)
    return score(a) - score(b)
  })
}

describe('exam file 정렬', () => {
  it('실제 기출이 동형/예상보다 먼저 정렬된다', () => {
    const files = ['전공A-동형.json', '전공A-예상.json', '전공A.json', '전공B.json']
    const sorted = sortExamFiles(files)

    expect(sorted).toEqual([
      '전공A.json',
      '전공B.json',
      '전공A-동형.json',
      '전공A-예상.json',
    ])
  })

  it('예상이 동형보다 뒤에 온다', () => {
    const files = ['전공A-예상.json', '전공A-동형.json']
    const sorted = sortExamFiles(files)

    expect(sorted).toEqual(['전공A-동형.json', '전공A-예상.json'])
  })

  it('모두 실제 기출이면 원래 순서 유지', () => {
    const files = ['전공A.json', '전공B.json']
    const sorted = sortExamFiles(files)

    expect(sorted).toEqual(['전공A.json', '전공B.json'])
  })
})

describe('getDefaultExamEntry — 기본 선택 로직', () => {
  const entries: ExamEntry[] = [
    { year: 2027, session: '전공A-예상', filename: '전공A-예상.json', isIsomorphic: false, isPredicted: true },
    { year: 2027, session: '전공B-예상', filename: '전공B-예상.json', isIsomorphic: false, isPredicted: true },
    { year: 2026, session: '전공A', filename: '전공A.json', isIsomorphic: false, isPredicted: false },
    { year: 2026, session: '전공B', filename: '전공B.json', isIsomorphic: false, isPredicted: false },
    { year: 2026, session: '전공A-동형', filename: '전공A-동형.json', isIsomorphic: true, isPredicted: false },
  ]

  it('실제 기출이 있으면 그것이 기본 선택된다 (예상/동형 아닌 첫 번째)', () => {
    const defaultEntry = getDefaultExamEntry(entries)

    expect(defaultEntry?.year).toBe(2026)
    expect(defaultEntry?.session).toBe('전공A')
    expect(defaultEntry?.isPredicted).toBe(false)
    expect(defaultEntry?.isIsomorphic).toBe(false)
  })

  it('모든 entry가 예상/동형이면 첫 번째를 반환한다', () => {
    const onlyPredicted: ExamEntry[] = [
      { year: 2027, session: '전공A-예상', filename: '전공A-예상.json', isIsomorphic: false, isPredicted: true },
      { year: 2027, session: '전공B-예상', filename: '전공B-예상.json', isIsomorphic: false, isPredicted: true },
    ]
    const defaultEntry = getDefaultExamEntry(onlyPredicted)

    expect(defaultEntry?.year).toBe(2027)
    expect(defaultEntry?.isPredicted).toBe(true)
  })

  it('동형만 있으면 첫 번째를 반환한다', () => {
    const onlyIsomorphic: ExamEntry[] = [
      { year: 2026, session: '전공A-동형', filename: '전공A-동형.json', isIsomorphic: true, isPredicted: false },
    ]
    const defaultEntry = getDefaultExamEntry(onlyIsomorphic)

    expect(defaultEntry?.year).toBe(2026)
    expect(defaultEntry?.isIsomorphic).toBe(true)
  })

  it('빈 배열이면 undefined를 반환한다', () => {
    const defaultEntry = getDefaultExamEntry([])

    expect(defaultEntry).toBeUndefined()
  })
})
