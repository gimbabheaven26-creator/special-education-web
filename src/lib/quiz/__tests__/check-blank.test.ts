import { describe, it, expect } from 'vitest'
import { checkBlank } from '../check-blank'

describe('checkBlank', () => {
  describe('정확 일치', () => {
    it('동일 문자열은 정답', () => {
      expect(checkBlank('조작적 행동 지표', '조작적 행동 지표')).toBe(true)
    })

    it('정규화 후 동일하면 정답 (공백 차이)', () => {
      expect(checkBlank('통합학급', '통합 학급')).toBe(true)
    })

    it('정규화 후 동일하면 정답 (대소문자)', () => {
      expect(checkBlank('IEP', 'iep')).toBe(true)
    })

    it('정규화 후 동일하면 정답 (구두점 차이)', () => {
      expect(checkBlank('불안위계(anxiety hierarchy)', '불안위계(anxiety hierarchy).')).toBe(true)
    })
  })

  describe('키워드 전부 포함 (순서 무관)', () => {
    it('모든 키워드가 순서 바뀌어도 포함되면 정답', () => {
      expect(checkBlank('조작적 행동 지표', '행동 지표를 조작적으로 정의')).toBe(true)
    })

    it('키워드 사이에 추가 텍스트가 있어도 정답', () => {
      expect(checkBlank('특성화 특수학교', '특성화된 특수학교입니다')).toBe(true)
    })

    it('키워드 순서가 완전히 뒤바뀌어도 정답', () => {
      expect(checkBlank('조작적 행동 지표', '행동 조작적 지표 정의')).toBe(true)
    })
  })

  describe('키워드 일부만 포함 → false', () => {
    it('키워드 하나만 포함하면 오답', () => {
      expect(checkBlank('조작적 행동 지표', '조작적')).toBe(false)
    })

    it('키워드 두 개만 포함하면 오답 (3개 중 2개)', () => {
      expect(checkBlank('조작적 행동 지표', '조작적 행동')).toBe(false)
    })

    it('완전히 다른 답변은 오답', () => {
      expect(checkBlank('부적강화', '정적강화')).toBe(false)
    })
  })

  describe('빈 답변 → false', () => {
    it('빈 문자열은 오답', () => {
      expect(checkBlank('부적강화', '')).toBe(false)
    })

    it('공백만 있는 문자열은 오답', () => {
      expect(checkBlank('부적강화', '   ')).toBe(false)
    })
  })

  describe('대소문자/공백 정규화', () => {
    it('영문 대소문자 무시', () => {
      expect(checkBlank('Anxiety Hierarchy', 'anxiety hierarchy')).toBe(true)
    })

    it('연속 공백 정규화', () => {
      expect(checkBlank('특성화 특수학교', '특성화   특수학교')).toBe(true)
    })

    it('구두점 무시', () => {
      expect(checkBlank('사회불안장애', '사회불안장애!')).toBe(true)
    })
  })

  describe('쉼표로 구분된 복수 정답', () => {
    it('첫 번째 정답과 일치하면 정답', () => {
      expect(checkBlank('사회불안장애, 사회공포증', '사회불안장애')).toBe(true)
    })

    it('두 번째 정답과 일치하면 정답', () => {
      expect(checkBlank('사회불안장애, 사회공포증', '사회공포증')).toBe(true)
    })

    it('어떤 정답과도 일치하지 않으면 오답', () => {
      expect(checkBlank('사회불안장애, 사회공포증', '범불안장애')).toBe(false)
    })

    it('복수 정답 중 하나의 키워드를 전부 포함하면 정답', () => {
      expect(checkBlank('조작적 행동 지표, 행동 조작 기준', '행동 조작의 기준')).toBe(true)
    })
  })

  describe('단일 키워드 정답', () => {
    it('단일 키워드 정확 일치는 정답', () => {
      expect(checkBlank('기능', '기능')).toBe(true)
    })

    it('단일 키워드가 포함되어 있으면 정답 (조사 포함)', () => {
      // "기능" 단일 키워드 → 사용자가 "기능을" 이라 쓰면 "기능" 포함 → 정답
      expect(checkBlank('기능', '기능을')).toBe(true)
    })

    it('단일 키워드가 포함되면 정답 (파생어)', () => {
      // 단일 키워드 매칭은 includes 기반이므로 파생어도 포함으로 처리
      expect(checkBlank('기능', '기능적')).toBe(true)
    })
  })

  describe('엣지 케이스', () => {
    it('괄호 안의 대안 표기가 있는 정답', () => {
      expect(checkBlank('사회불안장애(사회공포증)', '사회불안장애')).toBe(true)
    })

    it('괄호 안의 대안 표기 전체를 쓰면 정답', () => {
      expect(checkBlank('사회불안장애(사회공포증)', '사회불안장애(사회공포증)')).toBe(true)
    })

    it('정답이 영문 포함일 때 키워드 매칭', () => {
      expect(checkBlank('불안위계(anxiety hierarchy)', '불안위계')).toBe(true)
    })
  })
})
