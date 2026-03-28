import type { IepGoal, IepPlan, WeeklyPlan } from '@/types/students'

const SEPARATOR = '────────────────────────────────'

/**
 * IEP 계획의 제목/과목/기간을 텍스트로 포맷한다.
 */
export function formatPlanHeaderAsText(plan: IepPlan): string {
  return [
    `제목: ${plan.title}`,
    `과목: ${plan.subject}`,
    `기간: ${plan.period_start} ~ ${plan.period_end}`,
  ].join('\n')
}

/**
 * IEP 목표 배열을 번호 매긴 텍스트 목록으로 포맷한다.
 * 빈 배열이면 안내 문구를 반환한다.
 */
export function formatGoalsAsText(goals: IepGoal[]): string {
  if (goals.length === 0) {
    return '등록된 목표가 없습니다.'
  }

  return goals
    .map(
      (g, i) =>
        `${i + 1}. ${g.achievement_standard_code} ${g.description} (도달수준: ${g.target_level})`,
    )
    .join('\n')
}

/**
 * 주차별 계획 배열을 텍스트로 포맷한다.
 * achievement_standard_id가 goals 중 하나와 일치하면 성취기준 코드를 표시한다.
 */
export function formatWeeklyPlansAsText(
  weeklyPlans: WeeklyPlan[],
  goals: IepGoal[],
): string {
  if (weeklyPlans.length === 0) {
    return '등록된 주차별 계획이 없습니다.'
  }

  const goalMap = new Map(
    goals.map((g) => [g.achievement_standard_id, g.achievement_standard_code]),
  )

  return weeklyPlans
    .map((wp) => {
      const code = wp.achievement_standard_id
        ? goalMap.get(wp.achievement_standard_id)
        : undefined
      const header = code
        ? `${wp.week_number}주차 | ${code} ${wp.activity}`
        : `${wp.week_number}주차 | ${wp.activity}`

      const details: string[] = []
      if (wp.materials) details.push(`  교재: ${wp.materials}`)
      if (wp.evaluation_method) details.push(`  평가: ${wp.evaluation_method}`)
      if (wp.notes) details.push(`  비고: ${wp.notes}`)

      return [header, ...details].join('\n')
    })
    .join('\n')
}

/**
 * IEP 계획 전체를 하나의 텍스트 문서로 포맷한다.
 * 헤더 + 목표 + 주차별 계획을 구분선으로 연결한다.
 */
export function formatFullPlanAsText(
  plan: IepPlan,
  weeklyPlans: WeeklyPlan[],
): string {
  const header = formatPlanHeaderAsText(plan)
  const goalsText = formatGoalsAsText(plan.goals)
  const weeklyText = formatWeeklyPlansAsText(weeklyPlans, plan.goals)

  return [
    header,
    SEPARATOR,
    '【 목표 】',
    goalsText,
    SEPARATOR,
    '【 주차별 계획 】',
    weeklyText,
  ].join('\n\n')
}
