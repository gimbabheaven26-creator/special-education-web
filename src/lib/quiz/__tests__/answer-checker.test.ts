import { describe, it, expect } from 'vitest'
import { checkFillInAnswer } from '../answer-checker'

describe('checkFillInAnswer', () => {
  describe('정확 일치', () => {
    it('동일 문자열은 정답', () => {
      expect(checkFillInAnswer('긍정적 행동지원', '긍정적 행동지원')).toBe(true)
    })

    it('영문 동일 문자열은 정답', () => {
      expect(checkFillInAnswer('PBS', 'PBS')).toBe(true)
    })
  })

  describe('대소문자 무시', () => {
    it('영문 대소문자가 달라도 정답', () => {
      expect(checkFillInAnswer('pbs', 'PBS')).toBe(true)
    })

    it('혼합 대소문자도 정답', () => {
      expect(checkFillInAnswer('Pbs', 'PBS')).toBe(true)
    })

    it('긴 영문에서도 대소문자 무시', () => {
      expect(checkFillInAnswer('positive behavior support', 'Positive Behavior Support')).toBe(true)
    })
  })

  describe('공백 정규화', () => {
    it('앞뒤 공백이 있어도 정답', () => {
      expect(checkFillInAnswer('  PBS  ', 'PBS')).toBe(true)
    })

    it('중간 공백이 달라도 정답', () => {
      expect(checkFillInAnswer('긍정적행동지원', '긍정적 행동 지원')).toBe(true)
    })

    it('연속 공백이 있어도 정답', () => {
      expect(checkFillInAnswer('긍정적  행동  지원', '긍정적 행동지원')).toBe(true)
    })

    it('탭 문자도 제거된다', () => {
      expect(checkFillInAnswer('긍정적\t행동지원', '긍정적 행동지원')).toBe(true)
    })
  })

  describe('복수 정답 ("또는" 구분자)', () => {
    it('첫 번째 정답과 일치하면 정답', () => {
      expect(checkFillInAnswer('타행동 차별강화', '타행동 차별강화 또는 DRO')).toBe(true)
    })

    it('두 번째 정답과 일치하면 정답', () => {
      expect(checkFillInAnswer('DRO', '타행동 차별강화 또는 DRO')).toBe(true)
    })

    it('세 번째 정답과 일치하면 정답', () => {
      expect(checkFillInAnswer('차별강화', '타행동 차별강화 또는 DRO 또는 차별강화')).toBe(true)
    })

    it('어떤 정답과도 일치하지 않으면 오답', () => {
      expect(checkFillInAnswer('소거', '타행동 차별강화 또는 DRO')).toBe(false)
    })

    it('"또는" 앞뒤 공백이 불규칙해도 정상 분리', () => {
      expect(checkFillInAnswer('DRO', '타행동 차별강화또는DRO')).toBe(true)
    })
  })

  describe('괄호 약어 처리', () => {
    it('괄호 안 약어만 입력해도 정답', () => {
      expect(checkFillInAnswer('DRO', '타행동 차별강화(DRO)')).toBe(true)
    })

    it('괄호 제거한 본문만 입력해도 정답', () => {
      expect(checkFillInAnswer('타행동차별강화', '타행동 차별강화(DRO)')).toBe(true)
    })

    it('괄호 포함 전체를 입력해도 정답', () => {
      expect(checkFillInAnswer('타행동차별강화(DRO)', '타행동 차별강화(DRO)')).toBe(true)
    })

    it('괄호 안 한글 약어도 정답', () => {
      expect(checkFillInAnswer('사회공포증', '사회불안장애(사회공포증)')).toBe(true)
    })

    it('괄호 안 영문 약어 대소문자 무시', () => {
      expect(checkFillInAnswer('dro', '타행동 차별강화(DRO)')).toBe(true)
    })

    it('복수 괄호가 있을 때 두 번째 괄호 내용도 정답', () => {
      expect(checkFillInAnswer('PBS', '긍정적 행동지원(PBS)(PBIS)')).toBe(true)
    })

    it('복수 괄호가 있을 때 첫 번째 괄호 내용도 정답', () => {
      expect(checkFillInAnswer('PBIS', '긍정적 행동지원(PBS)(PBIS)')).toBe(true)
    })

    it('괄호 제거한 본문만 입력 — 복수 괄호', () => {
      expect(checkFillInAnswer('긍정적행동지원', '긍정적 행동지원(PBS)(PBIS)')).toBe(true)
    })
  })

  describe('복수 정답 + 괄호 조합', () => {
    it('"또는"으로 분리된 항목 각각에서 괄호 처리', () => {
      const correct = '타행동 차별강화(DRO) 또는 대체행동 차별강화(DRA)'
      expect(checkFillInAnswer('DRO', correct)).toBe(true)
      expect(checkFillInAnswer('DRA', correct)).toBe(true)
      expect(checkFillInAnswer('타행동차별강화', correct)).toBe(true)
      expect(checkFillInAnswer('대체행동차별강화', correct)).toBe(true)
    })

    it('일치하지 않는 약어는 오답', () => {
      const correct = '타행동 차별강화(DRO) 또는 대체행동 차별강화(DRA)'
      expect(checkFillInAnswer('DRI', correct)).toBe(false)
    })
  })

  describe('빈 문자열 / 공백만', () => {
    it('빈 문자열은 오답', () => {
      expect(checkFillInAnswer('', 'PBS')).toBe(false)
    })

    it('공백만 있는 입력은 오답', () => {
      expect(checkFillInAnswer('   ', 'PBS')).toBe(false)
    })

    it('탭과 줄바꿈만 있는 입력은 오답', () => {
      expect(checkFillInAnswer('\t\n', 'PBS')).toBe(false)
    })
  })

  describe('오답 판정', () => {
    it('유사하지만 다른 한글 답안은 오답', () => {
      expect(checkFillInAnswer('긍정적행동', '긍정적 행동지원')).toBe(false)
    })

    it('부분 일치는 오답', () => {
      expect(checkFillInAnswer('행동지원', '긍정적 행동지원')).toBe(false)
    })

    it('완전히 다른 답은 오답', () => {
      expect(checkFillInAnswer('소거', '타행동 차별강화')).toBe(false)
    })

    it('정답의 일부 글자만 포함한 오답', () => {
      expect(checkFillInAnswer('타행', '타행동 차별강화')).toBe(false)
    })

    it('정답과 글자 순서가 다르면 오답', () => {
      expect(checkFillInAnswer('강화차별타행동', '타행동 차별강화')).toBe(false)
    })

    it('괄호 안 약어와 유사하지만 다른 답은 오답', () => {
      expect(checkFillInAnswer('DRB', '타행동 차별강화(DRO)')).toBe(false)
    })
  })

  describe('특수문자 입력', () => {
    it('특수문자만 입력하면 오답', () => {
      expect(checkFillInAnswer('!!!', 'PBS')).toBe(false)
    })

    it('정답에 특수문자가 포함되어 있을 때 정확히 매칭', () => {
      expect(checkFillInAnswer('A-B-C분석', 'A-B-C 분석')).toBe(true)
    })

    it('슬래시 포함 정답', () => {
      expect(checkFillInAnswer('읽기/쓰기', '읽기/쓰기')).toBe(true)
    })
  })

  describe('초장문 입력', () => {
    it('매우 긴 입력도 처리 가능 (오답)', () => {
      const longInput = '가'.repeat(1000)
      expect(checkFillInAnswer(longInput, 'PBS')).toBe(false)
    })

    it('정답이 매우 길어도 정확 일치 시 정답', () => {
      const longAnswer = '긍정적 행동지원을 통한 개별화교육계획 수립 절차'
      expect(checkFillInAnswer(longAnswer, longAnswer)).toBe(true)
    })
  })

  describe('한글 조사/어미 차이', () => {
    it('조사가 붙으면 오답 (완전 일치 기반)', () => {
      expect(checkFillInAnswer('소거를', '소거')).toBe(false)
    })

    it('어미가 다르면 오답', () => {
      expect(checkFillInAnswer('강화하다', '강화')).toBe(false)
    })
  })

  describe('"또는" 구분자 엣지 케이스', () => {
    it('정답 자체에 "또는"이라는 글자가 포함된 경우', () => {
      // "또는"이 구분자로 사용되므로, 정답 본문에 "또는"이 있으면 분리됨
      // 이는 현재 구현의 알려진 한계
      const correct = '선택 또는 거부'
      expect(checkFillInAnswer('선택', correct)).toBe(true)
      expect(checkFillInAnswer('거부', correct)).toBe(true)
    })

    it('"또는"이 여러 번 나오는 정답', () => {
      const correct = 'A 또는 B 또는 C 또는 D'
      expect(checkFillInAnswer('A', correct)).toBe(true)
      expect(checkFillInAnswer('B', correct)).toBe(true)
      expect(checkFillInAnswer('C', correct)).toBe(true)
      expect(checkFillInAnswer('D', correct)).toBe(true)
      expect(checkFillInAnswer('E', correct)).toBe(false)
    })
  })
})
