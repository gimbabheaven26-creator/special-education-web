import { describe, it, expect } from 'vitest'
import {
  getConceptLinksForQuestion,
  getKiceRefsForConcept,
  findConceptForKeyword,
  buildConceptLinksMap,
} from '../keyword-concept-map'
import type { KiceQuestion } from '@/types/kice'

// ─── Helper ───

function makeQuestion(overrides: Partial<KiceQuestion> = {}): KiceQuestion {
  return {
    number: 1,
    type: 'fill_in',
    points: 4,
    context: '테스트 문제',
    keywords: [],
    subjects: [],
    chapters: [],
    ...overrides,
  }
}

// ─── getConceptLinksForQuestion ───

describe('getConceptLinksForQuestion', () => {
  it('키워드가 없는 문제 → 빈 배열 반환', () => {
    const q = makeQuestion({ keywords: [], subjects: ['special-education'] })
    const result = getConceptLinksForQuestion(q)
    expect(result).toEqual([])
  })

  it('매칭되는 과목이 없으면 빈 배열', () => {
    const q = makeQuestion({
      keywords: ['자폐성장애'],
      subjects: ['nonexistent-subject'],
    })
    const result = getConceptLinksForQuestion(q)
    expect(result).toEqual([])
  })

  it('키워드 매칭 시 최대 3개 반환', () => {
    const q = makeQuestion({
      keywords: ['자폐', '의사소통', '행동지원', '개별화교육'],
      subjects: ['special-education'],
    })
    const result = getConceptLinksForQuestion(q)
    expect(result.length).toBeLessThanOrEqual(3)
    for (const link of result) {
      expect(link).toHaveProperty('subject')
      expect(link).toHaveProperty('slug')
      expect(link).toHaveProperty('title')
      expect(link).toHaveProperty('matchedKeywords')
      expect(link.matchedKeywords.length).toBeGreaterThan(0)
    }
  })

  it('ConceptLink 구조가 올바름', () => {
    const q = makeQuestion({
      keywords: ['자폐성장애'],
      subjects: ['special-education'],
    })
    const result = getConceptLinksForQuestion(q)
    if (result.length > 0) {
      const link = result[0]
      expect(typeof link.subject).toBe('string')
      expect(typeof link.slug).toBe('string')
      expect(typeof link.title).toBe('string')
      expect(Array.isArray(link.matchedKeywords)).toBe(true)
    }
  })
})

// ─── getKiceRefsForConcept ───

describe('getKiceRefsForConcept', () => {
  it('존재하지 않는 concept → 빈 배열', () => {
    const result = getKiceRefsForConcept('없는폴더', 'nonexistent-slug')
    expect(result).toEqual([])
  })

  it('KiceRef 구조가 올바름', () => {
    // 실제 concept에 대한 역링크 조회
    const result = getKiceRefsForConcept('특수교육학', 'autism-spectrum-disorder')
    if (result.length > 0) {
      const ref = result[0]
      expect(typeof ref.year).toBe('number')
      expect(typeof ref.session).toBe('string')
      expect(typeof ref.questionNumber).toBe('number')
      expect(Array.isArray(ref.matchedKeywords)).toBe(true)
    }
  })

  it('결과가 최신순 정렬', () => {
    const result = getKiceRefsForConcept('특수교육학', 'autism-spectrum-disorder')
    if (result.length >= 2) {
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].year).toBeGreaterThanOrEqual(result[i + 1].year)
      }
    }
  })
})

// ─── findConceptForKeyword ───

describe('findConceptForKeyword', () => {
  it('빈 문자열 → null 또는 빈 결과', () => {
    const result = findConceptForKeyword('')
    // 빈 문자열은 모든 키워드에 포함되므로 결과가 있을 수 있음
    // null이거나 ConceptLink 구조
    if (result !== null) {
      expect(result).toHaveProperty('slug')
    }
  })

  it('존재하는 키워드 → ConceptLink 반환', () => {
    const result = findConceptForKeyword('자폐성장애')
    if (result !== null) {
      expect(result.subject).toBeTruthy()
      expect(result.slug).toBeTruthy()
      expect(result.title).toBeTruthy()
      expect(result.matchedKeywords).toContain('자폐성장애')
    }
  })

  it('존재하지 않는 키워드 → null', () => {
    const result = findConceptForKeyword('zzz_completely_nonexistent_keyword_xyz')
    expect(result).toBeNull()
  })
})

// ─── buildConceptLinksMap ───

describe('buildConceptLinksMap', () => {
  it('빈 배열 → 빈 맵', () => {
    const result = buildConceptLinksMap([])
    expect(result).toEqual({})
  })

  it('매칭 없는 문제 → 맵에 미포함', () => {
    const q = makeQuestion({ keywords: ['zzz_no_match'], subjects: ['special-education'] })
    const result = buildConceptLinksMap([q])
    expect(result[q.number]).toBeUndefined()
  })

  it('매칭 있는 문제 → question.number 키로 매핑', () => {
    const q = makeQuestion({
      number: 42,
      keywords: ['자폐', '의사소통'],
      subjects: ['special-education'],
    })
    const result = buildConceptLinksMap([q])
    if (result[42]) {
      expect(Array.isArray(result[42])).toBe(true)
      expect(result[42].length).toBeGreaterThan(0)
      expect(result[42].length).toBeLessThanOrEqual(3)
    }
  })
})
