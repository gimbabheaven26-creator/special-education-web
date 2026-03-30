import { describe, it, expect } from 'vitest'
import {
  recommendTargetLevel,
  getAxisLabel,
  getAxisOptions,
  getRecommendationReason,
} from '@/lib/utils/present-level'
import type { CurriculumLevel } from '@/types/achievement-standards'

const SAMPLE_LEVELS: CurriculumLevel[] = [
  {
    knowledge_understanding: '핵심 개념을 설명할 수 있다',
    process_skills: '문제 해결 과정을 독립적으로 수행한다',
    values_attitudes: '학습에 적극적으로 참여한다',
  },
  {
    knowledge_understanding: '기본 개념을 이해한다',
    process_skills: '문제 해결 과정에 참여한다',
    values_attitudes: '학습에 참여한다',
  },
  {
    knowledge_understanding: '개념을 부분적으로 인식한다',
    process_skills: '도움을 받아 수행한다',
    values_attitudes: '학습에 관심을 보인다',
  },
]

describe('recommendTargetLevel', () => {
  it('상위 선택 → 우수', () => {
    expect(recommendTargetLevel([0, 0, 0], 3)).toBe('우수')
  })

  it('하위 선택 → 기초', () => {
    expect(recommendTargetLevel([2, 2, 2], 3)).toBe('기초')
  })

  it('중간 선택 → 보통', () => {
    expect(recommendTargetLevel([1, 1, 1], 3)).toBe('보통')
  })

  it('혼합 선택 — 평균 기반', () => {
    // [0, 1, 2] → positions [0, 0.5, 1] → avg 0.5 → 보통
    expect(recommendTargetLevel([0, 1, 2], 3)).toBe('보통')
  })

  it('totalRows <= 1이면 보통 반환', () => {
    expect(recommendTargetLevel([0], 1)).toBe('보통')
    expect(recommendTargetLevel([0], 0)).toBe('보통')
  })

  it('4행에서 경계값 테스트', () => {
    // [0,0,0] → avg 0 → 우수
    expect(recommendTargetLevel([0, 0, 0], 4)).toBe('우수')
    // [1,1,1] → avg 1/3 ≈ 0.333 > 0.33 → 보통
    expect(recommendTargetLevel([1, 1, 1], 4)).toBe('보통')
    // [2,2,2] → avg 2/3 ≈ 0.667 > 0.66 → 기초
    expect(recommendTargetLevel([2, 2, 2], 4)).toBe('기초')
    // [3,3,3] → avg 1.0 → 기초
    expect(recommendTargetLevel([3, 3, 3], 4)).toBe('기초')
  })
})

describe('getAxisLabel', () => {
  it('영문 키 → 한글 라벨', () => {
    expect(getAxisLabel('knowledge_understanding')).toBe('지식·이해')
    expect(getAxisLabel('process_skills')).toBe('과정·기능')
    expect(getAxisLabel('values_attitudes')).toBe('가치·태도')
  })

  it('미등록 키 → 키 그대로 반환', () => {
    expect(getAxisLabel('unknown')).toBe('unknown')
  })
})

describe('getAxisOptions', () => {
  it('knowledge_understanding 축 텍스트 추출', () => {
    const options = getAxisOptions(SAMPLE_LEVELS, 'knowledge_understanding')
    expect(options).toHaveLength(3)
    expect(options[0]).toBe('핵심 개념을 설명할 수 있다')
    expect(options[2]).toBe('개념을 부분적으로 인식한다')
  })

  it('빈 텍스트 필터링', () => {
    const levelsWithEmpty: CurriculumLevel[] = [
      ...SAMPLE_LEVELS,
      {
        knowledge_understanding: '',
        process_skills: '추가 기능',
        values_attitudes: '',
      },
    ]
    const options = getAxisOptions(levelsWithEmpty, 'knowledge_understanding')
    expect(options).toHaveLength(3) // 빈 문자열 제외
  })

  it('빈 배열 → 빈 결과', () => {
    expect(getAxisOptions([], 'knowledge_understanding')).toHaveLength(0)
  })
})

describe('getRecommendationReason', () => {
  it('결과 문자열에 3축 평가와 추천 수준 포함', () => {
    const reason = getRecommendationReason([0, 1, 2], 3, '보통')
    expect(reason).toContain('지식·이해')
    expect(reason).toContain('과정·기능')
    expect(reason).toContain('가치·태도')
    expect(reason).toContain('보통')
  })

  it('totalRows <= 1이면 모두 중간', () => {
    const reason = getRecommendationReason([0], 1, '보통')
    expect(reason).toContain('중간')
  })

  it('상위 선택 시 상위 표시', () => {
    const reason = getRecommendationReason([0, 0, 0], 3, '우수')
    expect(reason).toContain('상위')
    expect(reason).toContain('우수')
  })
})
