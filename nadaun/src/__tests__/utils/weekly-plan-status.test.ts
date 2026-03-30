import { describe, it, expect } from 'vitest'
import type { WeeklyPlanStatus, WeeklyPlan } from '@/types/students'

const STATUS_CYCLE: WeeklyPlanStatus[] = ['planned', 'in_progress', 'completed']

function getNextStatus(current: WeeklyPlanStatus): WeeklyPlanStatus {
  const idx = STATUS_CYCLE.indexOf(current)
  return STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length]
}

function calculateProgress(plans: Array<{ status: WeeklyPlanStatus }>) {
  const total = plans.length
  const planned = plans.filter((p) => p.status === 'planned').length
  const inProgress = plans.filter((p) => p.status === 'in_progress').length
  const completed = plans.filter((p) => p.status === 'completed').length
  const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0

  return { total, planned, inProgress, completed, completedPct }
}

describe('WeeklyPlanStatus cycle', () => {
  it('planned → in_progress', () => {
    expect(getNextStatus('planned')).toBe('in_progress')
  })

  it('in_progress → completed', () => {
    expect(getNextStatus('in_progress')).toBe('completed')
  })

  it('completed → planned (순환)', () => {
    expect(getNextStatus('completed')).toBe('planned')
  })
})

describe('WeeklyPlan type includes status fields', () => {
  it('WeeklyPlan에 status 필드가 포함된다', () => {
    const plan: WeeklyPlan = {
      id: 'wp-1',
      iep_plan_id: 'plan-1',
      week_number: 1,
      achievement_standard_id: null,
      activity: '듣기 연습',
      materials: null,
      evaluation_method: null,
      notes: null,
      status: 'planned',
      progress_notes: null,
      created_at: '2026-03-01',
      updated_at: '2026-03-01',
    }
    expect(plan.status).toBe('planned')
    expect(plan.progress_notes).toBeNull()
  })

  it('WeeklyPlan progress_notes에 텍스트를 저장할 수 있다', () => {
    const plan: WeeklyPlan = {
      id: 'wp-2',
      iep_plan_id: 'plan-1',
      week_number: 2,
      achievement_standard_id: 'std-1',
      activity: '읽기 활동',
      materials: '교재',
      evaluation_method: '관찰',
      notes: null,
      status: 'in_progress',
      progress_notes: '절반 완료, 다음 주에 마무리',
      created_at: '2026-03-01',
      updated_at: '2026-03-08',
    }
    expect(plan.status).toBe('in_progress')
    expect(plan.progress_notes).toBe('절반 완료, 다음 주에 마무리')
  })
})

describe('calculateProgress', () => {
  it('모두 planned이면 completedPct = 0', () => {
    const plans = [
      { status: 'planned' as const },
      { status: 'planned' as const },
      { status: 'planned' as const },
    ]
    const progress = calculateProgress(plans)
    expect(progress.total).toBe(3)
    expect(progress.planned).toBe(3)
    expect(progress.inProgress).toBe(0)
    expect(progress.completed).toBe(0)
    expect(progress.completedPct).toBe(0)
  })

  it('모두 completed이면 completedPct = 100', () => {
    const plans = [
      { status: 'completed' as const },
      { status: 'completed' as const },
    ]
    const progress = calculateProgress(plans)
    expect(progress.completedPct).toBe(100)
    expect(progress.completed).toBe(2)
  })

  it('혼합 상태 — 1/3 completed = 33%', () => {
    const plans = [
      { status: 'completed' as const },
      { status: 'in_progress' as const },
      { status: 'planned' as const },
    ]
    const progress = calculateProgress(plans)
    expect(progress.total).toBe(3)
    expect(progress.completed).toBe(1)
    expect(progress.inProgress).toBe(1)
    expect(progress.planned).toBe(1)
    expect(progress.completedPct).toBe(33)
  })

  it('빈 배열 → completedPct = 0', () => {
    const progress = calculateProgress([])
    expect(progress.total).toBe(0)
    expect(progress.completedPct).toBe(0)
  })

  it('2/4 completed = 50%', () => {
    const plans = [
      { status: 'completed' as const },
      { status: 'completed' as const },
      { status: 'in_progress' as const },
      { status: 'planned' as const },
    ]
    const progress = calculateProgress(plans)
    expect(progress.completedPct).toBe(50)
  })
})

describe('STATUS constants', () => {
  it('STATUS_CYCLE은 3개 상태를 포함한다', () => {
    expect(STATUS_CYCLE).toHaveLength(3)
    expect(STATUS_CYCLE).toContain('planned')
    expect(STATUS_CYCLE).toContain('in_progress')
    expect(STATUS_CYCLE).toContain('completed')
  })
})
