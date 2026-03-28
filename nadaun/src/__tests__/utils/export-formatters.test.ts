import { describe, it, expect } from 'vitest'
import {
  formatPlanHeaderAsText,
  formatGoalsAsText,
  formatWeeklyPlansAsText,
  formatFullPlanAsText,
} from '@/lib/utils/export-formatters'
import type { IepGoal, IepPlan, WeeklyPlan } from '@/types/students'

// ── Fixtures ──────────────────────────────────────────

const NOW = '2026-03-29T00:00:00Z'

function makePlan(overrides: Partial<IepPlan> = {}): IepPlan {
  return {
    id: 'plan-1',
    student_id: 'stu-1',
    teacher_id: 'tea-1',
    title: '2학기 국어 IEP',
    subject: '국어',
    period_start: '2026-03-01',
    period_end: '2026-06-30',
    status: 'active',
    goals: [],
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  }
}

function makeGoal(overrides: Partial<IepGoal> = {}): IepGoal {
  return {
    achievement_standard_id: 'std-1',
    achievement_standard_code: '[9국01-01]',
    description: '핵심 어휘를 이해한다',
    target_level: '보통',
    ...overrides,
  }
}

function makeWeekly(overrides: Partial<WeeklyPlan> = {}): WeeklyPlan {
  return {
    id: 'wp-1',
    iep_plan_id: 'plan-1',
    week_number: 1,
    achievement_standard_id: null,
    activity: '그림카드 매칭 활동',
    materials: null,
    evaluation_method: null,
    notes: null,
    created_at: NOW,
    updated_at: NOW,
    ...overrides,
  }
}

// ── formatPlanHeaderAsText ────────────────────────────

describe('formatPlanHeaderAsText', () => {
  it('includes title, subject, and period', () => {
    const plan = makePlan()
    const result = formatPlanHeaderAsText(plan)

    expect(result).toContain('제목: 2학기 국어 IEP')
    expect(result).toContain('과목: 국어')
    expect(result).toContain('기간: 2026-03-01 ~ 2026-06-30')
  })
})

// ── formatGoalsAsText ─────────────────────────────────

describe('formatGoalsAsText', () => {
  it('returns placeholder for empty goals', () => {
    const result = formatGoalsAsText([])
    expect(result).toBe('등록된 목표가 없습니다.')
  })

  it('formats a single goal with number, code, description, and level', () => {
    const goal = makeGoal()
    const result = formatGoalsAsText([goal])

    expect(result).toBe('1. [9국01-01] 핵심 어휘를 이해한다 (도달수준: 보통)')
  })

  it('numbers multiple goals correctly', () => {
    const goals = [
      makeGoal({ achievement_standard_code: '[9국01-01]', description: '첫 번째 목표' }),
      makeGoal({ achievement_standard_code: '[9국01-02]', description: '두 번째 목표', target_level: '우수' }),
      makeGoal({ achievement_standard_code: '[9국02-01]', description: '세 번째 목표', target_level: '기초' }),
    ]
    const result = formatGoalsAsText(goals)
    const lines = result.split('\n')

    expect(lines).toHaveLength(3)
    expect(lines[0]).toMatch(/^1\./)
    expect(lines[1]).toMatch(/^2\./)
    expect(lines[2]).toMatch(/^3\./)
    expect(lines[2]).toContain('(도달수준: 기초)')
  })
})

// ── formatWeeklyPlansAsText ───────────────────────────

describe('formatWeeklyPlansAsText', () => {
  it('returns placeholder for empty weekly plans', () => {
    const result = formatWeeklyPlansAsText([], [])
    expect(result).toBe('등록된 주차별 계획이 없습니다.')
  })

  it('formats a single plan with all fields', () => {
    const goal = makeGoal({ achievement_standard_id: 'std-1' })
    const wp = makeWeekly({
      achievement_standard_id: 'std-1',
      materials: '그림카드 세트',
      evaluation_method: '관찰 평가',
      notes: '보조교사 지원 필요',
    })
    const result = formatWeeklyPlansAsText([wp], [goal])

    expect(result).toContain('1주차 | [9국01-01] 그림카드 매칭 활동')
    expect(result).toContain('  교재: 그림카드 세트')
    expect(result).toContain('  평가: 관찰 평가')
    expect(result).toContain('  비고: 보조교사 지원 필요')
  })

  it('omits null optional fields', () => {
    const wp = makeWeekly({
      materials: null,
      evaluation_method: null,
      notes: null,
    })
    const result = formatWeeklyPlansAsText([wp], [])

    expect(result).not.toContain('교재:')
    expect(result).not.toContain('평가:')
    expect(result).not.toContain('비고:')
  })

  it('shows goal code when achievement_standard_id matches a goal', () => {
    const goal = makeGoal({
      achievement_standard_id: 'std-42',
      achievement_standard_code: '[9수01-03]',
    })
    const wp = makeWeekly({ achievement_standard_id: 'std-42' })
    const result = formatWeeklyPlansAsText([wp], [goal])

    expect(result).toContain('[9수01-03]')
  })

  it('omits goal code when no goal matches', () => {
    const wp = makeWeekly({ achievement_standard_id: 'std-999' })
    const result = formatWeeklyPlansAsText([wp], [])

    expect(result).toContain('1주차 | 그림카드 매칭 활동')
    expect(result).not.toContain('[')
  })
})

// ── formatFullPlanAsText ──────────────────────────────

describe('formatFullPlanAsText', () => {
  it('combines header, goals, and weekly plans with separators', () => {
    const goal = makeGoal()
    const plan = makePlan({ goals: [goal] })
    const wp = makeWeekly({
      achievement_standard_id: 'std-1',
      materials: '워크시트',
    })

    const result = formatFullPlanAsText(plan, [wp])

    // Header section
    expect(result).toContain('제목: 2학기 국어 IEP')
    // Goals section
    expect(result).toContain('【 목표 】')
    expect(result).toContain('[9국01-01] 핵심 어휘를 이해한다')
    // Weekly section
    expect(result).toContain('【 주차별 계획 】')
    expect(result).toContain('1주차 | [9국01-01] 그림카드 매칭 활동')
    // Separator exists
    expect(result).toContain('─')
  })

  it('handles empty goals and empty weekly plans gracefully', () => {
    const plan = makePlan({ goals: [] })
    const result = formatFullPlanAsText(plan, [])

    expect(result).toContain('등록된 목표가 없습니다.')
    expect(result).toContain('등록된 주차별 계획이 없습니다.')
  })
})
