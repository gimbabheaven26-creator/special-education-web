import { describe, it, expect } from 'vitest'
import {
  iepPlanSchema,
  goalSchema,
  weeklyPlanSchema,
  presentLevelSchema,
  presentLevelAxisSchema,
} from '@/lib/schemas/iep-plan'

describe('presentLevelAxisSchema', () => {
  it('accepts valid axis', () => {
    const result = presentLevelAxisSchema.safeParse({
      axis: 'knowledge_understanding',
      axis_label: '지식·이해',
      selected_index: 1,
      selected_text: '기본 개념을 이해한다',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid axis name', () => {
    const result = presentLevelAxisSchema.safeParse({
      axis: 'invalid_axis',
      axis_label: '테스트',
      selected_index: 0,
      selected_text: '텍스트',
    })
    expect(result.success).toBe(false)
  })

  it('rejects negative selected_index', () => {
    const result = presentLevelAxisSchema.safeParse({
      axis: 'process_skills',
      axis_label: '과정·기능',
      selected_index: -1,
      selected_text: '텍스트',
    })
    expect(result.success).toBe(false)
  })
})

describe('presentLevelSchema', () => {
  const validPresentLevel = {
    levels: [
      {
        axis: 'knowledge_understanding' as const,
        axis_label: '지식·이해',
        selected_index: 1,
        selected_text: '기본 개념을 이해한다',
      },
      {
        axis: 'process_skills' as const,
        axis_label: '과정·기능',
        selected_index: 0,
        selected_text: '문제 해결 과정을 독립적으로 수행한다',
      },
    ],
    notes: '수 세기에서 10까지 독립 수행 가능',
    recommended_target: '보통' as const,
  }

  it('accepts valid present level', () => {
    const result = presentLevelSchema.safeParse(validPresentLevel)
    expect(result.success).toBe(true)
  })

  it('rejects empty levels array', () => {
    const result = presentLevelSchema.safeParse({
      ...validPresentLevel,
      levels: [],
    })
    expect(result.success).toBe(false)
  })

  it('rejects more than 3 levels', () => {
    const result = presentLevelSchema.safeParse({
      ...validPresentLevel,
      levels: [
        ...validPresentLevel.levels,
        {
          axis: 'values_attitudes',
          axis_label: '가치·태도',
          selected_index: 2,
          selected_text: '학습에 관심을 보인다',
        },
        {
          axis: 'values_attitudes',
          axis_label: '가치·태도',
          selected_index: 1,
          selected_text: '추가',
        },
      ],
    })
    expect(result.success).toBe(false)
  })

  it('defaults notes to empty string', () => {
    const result = presentLevelSchema.safeParse({
      levels: validPresentLevel.levels,
      recommended_target: '보통',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.notes).toBe('')
    }
  })

  it('rejects invalid recommended_target', () => {
    const result = presentLevelSchema.safeParse({
      ...validPresentLevel,
      recommended_target: '상',
    })
    expect(result.success).toBe(false)
  })
})

describe('goalSchema', () => {
  it('accepts valid goal', () => {
    const result = goalSchema.safeParse({
      achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
      achievement_standard_code: '9국어01-01',
      description: '상대방의 이야기를 듣고 주요 내용을 파악할 수 있다.',
      target_level: '보통',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid target_level', () => {
    const result = goalSchema.safeParse({
      achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
      achievement_standard_code: '9국어01-01',
      description: '목표 설명',
      target_level: '상',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty description', () => {
    const result = goalSchema.safeParse({
      achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
      achievement_standard_code: '9국어01-01',
      description: '',
      target_level: '기초',
    })
    expect(result.success).toBe(false)
  })

  it('accepts all target levels', () => {
    for (const level of ['기초', '보통', '우수']) {
      const result = goalSchema.safeParse({
        achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
        achievement_standard_code: '9국어01-01',
        description: '목표',
        target_level: level,
      })
      expect(result.success).toBe(true)
    }
  })

  it('accepts goal with present_level', () => {
    const result = goalSchema.safeParse({
      achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
      achievement_standard_code: '9국어01-01',
      description: '듣기 능력 향상',
      target_level: '보통',
      present_level: {
        levels: [
          {
            axis: 'knowledge_understanding',
            axis_label: '지식·이해',
            selected_index: 1,
            selected_text: '기본 개념',
          },
        ],
        notes: '현재 수준 메모',
        recommended_target: '보통',
      },
    })
    expect(result.success).toBe(true)
  })

  it('accepts goal without present_level (optional)', () => {
    const result = goalSchema.safeParse({
      achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
      achievement_standard_code: '9국어01-01',
      description: '목표',
      target_level: '기초',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.present_level).toBeUndefined()
    }
  })
})

describe('iepPlanSchema', () => {
  const validPlan = {
    title: '2026학년도 1학기 국어 IEP',
    subject: '국어',
    period_start: '2026-03-01',
    period_end: '2026-07-31',
    goals: [
      {
        achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
        achievement_standard_code: '9국어01-01',
        description: '듣기 능력 향상',
        target_level: '보통' as const,
      },
    ],
  }

  it('accepts valid plan', () => {
    const result = iepPlanSchema.safeParse(validPlan)
    expect(result.success).toBe(true)
  })

  it('rejects empty title', () => {
    const result = iepPlanSchema.safeParse({ ...validPlan, title: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid subject', () => {
    const result = iepPlanSchema.safeParse({ ...validPlan, subject: '과학' })
    expect(result.success).toBe(false)
  })

  it('accepts all 4 subjects', () => {
    for (const subject of ['국어', '수학', '생활영어', '진로와 직업']) {
      const result = iepPlanSchema.safeParse({ ...validPlan, subject })
      expect(result.success).toBe(true)
    }
  })

  it('rejects empty goals', () => {
    const result = iepPlanSchema.safeParse({ ...validPlan, goals: [] })
    expect(result.success).toBe(false)
  })

  it('rejects period_end before period_start', () => {
    const result = iepPlanSchema.safeParse({
      ...validPlan,
      period_start: '2026-07-31',
      period_end: '2026-03-01',
    })
    expect(result.success).toBe(false)
  })
})

describe('weeklyPlanSchema', () => {
  it('accepts valid weekly plan', () => {
    const result = weeklyPlanSchema.safeParse({
      week_number: 1,
      activity: '듣기·말하기 연습',
    })
    expect(result.success).toBe(true)
  })

  it('accepts full weekly plan', () => {
    const result = weeklyPlanSchema.safeParse({
      week_number: 10,
      achievement_standard_id: '550e8400-e29b-41d4-a716-446655440000',
      activity: '단어 카드 활동',
      materials: '단어 카드 30장',
      evaluation_method: '관찰 평가',
      notes: '보조교사 참여',
    })
    expect(result.success).toBe(true)
  })

  it('rejects week_number 0', () => {
    const result = weeklyPlanSchema.safeParse({
      week_number: 0,
      activity: '활동',
    })
    expect(result.success).toBe(false)
  })

  it('rejects week_number > 52', () => {
    const result = weeklyPlanSchema.safeParse({
      week_number: 53,
      activity: '활동',
    })
    expect(result.success).toBe(false)
  })

  it('rejects empty activity', () => {
    const result = weeklyPlanSchema.safeParse({
      week_number: 1,
      activity: '',
    })
    expect(result.success).toBe(false)
  })
})
