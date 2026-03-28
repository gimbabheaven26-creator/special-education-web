import { describe, it, expect } from 'vitest'
import { iepPlanSchema, goalSchema, weeklyPlanSchema } from '@/lib/schemas/iep-plan'

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
