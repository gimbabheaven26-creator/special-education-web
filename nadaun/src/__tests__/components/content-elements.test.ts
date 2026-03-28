import { describe, it, expect } from 'vitest'
import {
  isStringArray,
  isLanguageContext,
  isRecordStringString,
  isSingleString,
} from '@/lib/utils/knowledge-understanding'

describe('content-elements type guards', () => {
  describe('isStringArray', () => {
    it('returns true for string[]', () => {
      expect(isStringArray(['a', 'b'])).toBe(true)
    })

    it('returns true for empty array', () => {
      expect(isStringArray([])).toBe(true)
    })

    it('returns false for object', () => {
      expect(isStringArray({ language: [], context: [] })).toBe(false)
    })

    it('returns false for string', () => {
      expect(isStringArray('hello')).toBe(false)
    })
  })

  describe('isLanguageContext', () => {
    it('returns true for { language, context }', () => {
      expect(isLanguageContext({ language: ['a'], context: ['b'] })).toBe(true)
    })

    it('returns false for string[]', () => {
      expect(isLanguageContext(['a'])).toBe(false)
    })

    it('returns false for Record<string, string>', () => {
      expect(isLanguageContext({ key: 'value' })).toBe(false)
    })

    it('returns false for string', () => {
      expect(isLanguageContext('hello')).toBe(false)
    })
  })

  describe('isRecordStringString', () => {
    it('returns true for Record<string, string>', () => {
      expect(isRecordStringString({ 수: '세 자리 수', 수의_연산: '덧셈' })).toBe(true)
    })

    it('returns false for { language, context }', () => {
      expect(isRecordStringString({ language: ['a'], context: ['b'] })).toBe(false)
    })

    it('returns false for array', () => {
      expect(isRecordStringString(['a'])).toBe(false)
    })

    it('returns false for string', () => {
      expect(isRecordStringString('hello')).toBe(false)
    })

    it('returns false for null', () => {
      expect(isRecordStringString(null as unknown as string)).toBe(false)
    })
  })

  describe('isSingleString', () => {
    it('returns true for string', () => {
      expect(isSingleString('hello')).toBe(true)
    })

    it('returns false for array', () => {
      expect(isSingleString(['a'])).toBe(false)
    })

    it('returns false for object', () => {
      expect(isSingleString({ key: 'val' })).toBe(false)
    })
  })

  describe('real data shapes', () => {
    // 국어: string[]
    it('handles 국어 knowledge_understanding', () => {
      const ku = ['느낌을 나타내는 말', '준언어적, 비언어적 표현', '높임 표현']
      expect(isStringArray(ku)).toBe(true)
      expect(isLanguageContext(ku)).toBe(false)
    })

    // 생활영어: { language, context }
    it('handles 생활영어 knowledge_understanding', () => {
      const ku = {
        language: ['알파벳의 이름과 소리', '주변에서 사용하는 낱말과 표현'],
        context: ['자기 주변 및 생활', '가정 및 학교'],
      }
      expect(isLanguageContext(ku)).toBe(true)
      expect(isStringArray(ku)).toBe(false)
      expect(isRecordStringString(ku)).toBe(false)
    })

    // 수학: Record<string, string>
    it('handles 수학 knowledge_understanding', () => {
      const ku = { 수: '세 자리 수', 수의_연산: '몇백의 덧셈과 뺄셈', 화폐: '여러 가지 화폐 활용' }
      expect(isRecordStringString(ku)).toBe(true)
      expect(isLanguageContext(ku)).toBe(false)
    })

    // 진로와직업: string[]
    it('handles 진로와직업 knowledge_understanding', () => {
      const ku = ['자신의 기본 정보와 특성', '자신의 특성과 미래 모습']
      expect(isStringArray(ku)).toBe(true)
    })
  })
})
