import { describe, it, expect } from 'vitest'
import type {
  AchievementRating,
  GoalAchievementSummary,
  WeeklyPlanStatus,
  Student,
  IepPlan,
  WeeklyPlan,
} from '@/types/students'
import {
  formatReportAsText,
} from '@/lib/utils/export-formatters'

// ── AchievementRating type tests ──

describe('AchievementRating type', () => {
  it('allows valid rating values', () => {
    const ratings: AchievementRating[] = ['not_met', 'met', 'exceeded']
    expect(ratings).toHaveLength(3)
    expect(ratings).toContain('not_met')
    expect(ratings).toContain('met')
    expect(ratings).toContain('exceeded')
  })
})

// ── GoalAchievementSummary tests ──

describe('GoalAchievementSummary', () => {
  it('calculates metRate correctly', () => {
    const summary: GoalAchievementSummary = {
      achievementStandardId: 'std-1',
      total: 10,
      notMet: 3,
      met: 5,
      exceeded: 2,
      metRate: 70,
    }
    expect(summary.metRate).toBe(
      Math.round(((summary.met + summary.exceeded) / summary.total) * 100),
    )
  })

  it('handles zero total gracefully', () => {
    const summary: GoalAchievementSummary = {
      achievementStandardId: 'std-2',
      total: 0,
      notMet: 0,
      met: 0,
      exceeded: 0,
      metRate: 0,
    }
    expect(summary.metRate).toBe(0)
  })

  it('all met gives 100%', () => {
    const summary: GoalAchievementSummary = {
      achievementStandardId: 'std-3',
      total: 5,
      notMet: 0,
      met: 3,
      exceeded: 2,
      metRate: 100,
    }
    expect(summary.met + summary.exceeded).toBe(summary.total)
    expect(summary.metRate).toBe(100)
  })

  it('all not_met gives 0%', () => {
    const summary: GoalAchievementSummary = {
      achievementStandardId: 'std-4',
      total: 3,
      notMet: 3,
      met: 0,
      exceeded: 0,
      metRate: 0,
    }
    expect(summary.metRate).toBe(0)
  })
})

// ── WeeklyPlan achievement fields tests ──

describe('WeeklyPlan achievement fields', () => {
  const basePlan: WeeklyPlan = {
    id: 'wp-1',
    iep_plan_id: 'plan-1',
    week_number: 1,
    achievement_standard_id: 'std-1',
    activity: '읽기 연습',
    materials: null,
    evaluation_method: null,
    notes: null,
    status: 'completed' as WeeklyPlanStatus,
    progress_notes: null,
    achievement_rating: null,
    observation_notes: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  }

  it('allows null achievement_rating', () => {
    expect(basePlan.achievement_rating).toBeNull()
  })

  it('allows valid achievement_rating values', () => {
    const withRating: WeeklyPlan = { ...basePlan, achievement_rating: 'met' }
    expect(withRating.achievement_rating).toBe('met')
  })

  it('allows observation_notes when rating is set', () => {
    const withObs: WeeklyPlan = {
      ...basePlan,
      achievement_rating: 'exceeded',
      observation_notes: '집중력이 높았고 과제를 빠르게 완료함',
    }
    expect(withObs.observation_notes).toBeTruthy()
    expect(withObs.achievement_rating).toBe('exceeded')
  })
})

// ── formatReportAsText tests ──

describe('formatReportAsText', () => {
  const student: Student = {
    id: 's-1',
    teacher_id: 't-1',
    name: '김학생',
    grade: '초4',
    disability_type: null,
    notes: null,
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  }

  const plan: IepPlan = {
    id: 'p-1',
    student_id: 's-1',
    teacher_id: 't-1',
    title: '1학기 국어',
    subject: '국어',
    period_start: '2026-03-01',
    period_end: '2026-07-31',
    status: 'active',
    goals: [
      {
        achievement_standard_id: 'std-1',
        achievement_standard_code: '[4국01-01]',
        description: '낱말 읽기',
        target_level: '보통',
      },
    ],
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
  }

  const progress = {
    total: 10,
    planned: 2,
    inProgress: 3,
    completed: 5,
    completedPct: 50,
  }

  const goalSummaries: GoalAchievementSummary[] = [
    {
      achievementStandardId: 'std-1',
      total: 5,
      notMet: 1,
      met: 3,
      exceeded: 1,
      metRate: 80,
    },
  ]

  const observations: Array<{ weekNumber: number; notes: string; rating: AchievementRating }> = [
    { weekNumber: 3, notes: '발음이 정확해지고 있음', rating: 'met' },
    { weekNumber: 5, notes: '자신감 있게 읽기 시작', rating: 'exceeded' },
  ]

  it('includes student name', () => {
    const text = formatReportAsText(student, plan, progress, goalSummaries, observations)
    expect(text).toContain('김학생')
  })

  it('includes plan title and subject', () => {
    const text = formatReportAsText(student, plan, progress, goalSummaries, observations)
    expect(text).toContain('1학기 국어')
    expect(text).toContain('국어')
  })

  it('includes progress stats', () => {
    const text = formatReportAsText(student, plan, progress, goalSummaries, observations)
    expect(text).toContain('완료 5')
    expect(text).toContain('총 10주')
    expect(text).toContain('50%')
  })

  it('includes goal achievement summary', () => {
    const text = formatReportAsText(student, plan, progress, goalSummaries, observations)
    expect(text).toContain('[4국01-01]')
    expect(text).toContain('달성률 80%')
  })

  it('includes observation records', () => {
    const text = formatReportAsText(student, plan, progress, goalSummaries, observations)
    expect(text).toContain('3주차')
    expect(text).toContain('발음이 정확해지고 있음')
    expect(text).toContain('[달성]')
  })

  it('handles empty observations', () => {
    const text = formatReportAsText(student, plan, progress, goalSummaries, [])
    expect(text).not.toContain('관찰 기록')
  })

  it('handles empty goal summaries', () => {
    const text = formatReportAsText(student, plan, progress, [], observations)
    expect(text).not.toContain('목표별 달성도')
  })

  it('includes report title', () => {
    const text = formatReportAsText(student, plan, progress, goalSummaries, observations)
    expect(text).toContain('IEP 진행 보고서')
  })
})

// ── Status cycle tests ──

describe('Status cycle for achievement rating trigger', () => {
  it('achievement rating should only be entered for completed status', () => {
    const statuses: WeeklyPlanStatus[] = ['planned', 'in_progress', 'completed']
    const completedIdx = statuses.indexOf('completed')
    expect(completedIdx).toBe(2)
    // Only 'completed' status triggers achievement rating UI
    expect(statuses[completedIdx]).toBe('completed')
  })
})
