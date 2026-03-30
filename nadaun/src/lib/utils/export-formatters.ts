import type { IepGoal, IepPlan, WeeklyPlan, Student, GoalAchievementSummary, AchievementRating, TeachingMaterial } from '@/types/students'
import type { WeeklyPlanProgress } from '@/lib/queries/students'

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
 * present_level이 있으면 현행수준 정보를 함께 표시한다.
 * 빈 배열이면 안내 문구를 반환한다.
 */
export function formatGoalsAsText(goals: IepGoal[]): string {
  if (goals.length === 0) {
    return '등록된 목표가 없습니다.'
  }

  return goals
    .map((g, i) => {
      const lines: string[] = [
        `${i + 1}. ${g.achievement_standard_code} ${g.description} (도달수준: ${g.target_level})`,
      ]

      if (g.present_level) {
        const axes = g.present_level.levels
          .map((lv) => `${lv.axis_label}: ${lv.selected_text}`)
          .join(', ')
        lines.push(`   현행수준: ${axes}`)
        if (g.present_level.notes) {
          lines.push(`   현재 할 수 있는 것: ${g.present_level.notes}`)
        }
      }

      return lines.join('\n')
    })
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

const RATING_LABELS: Record<AchievementRating, string> = {
  not_met: '미달',
  met: '달성',
  exceeded: '초과',
}

/**
 * IEP 진행 보고서를 텍스트로 포맷한다.
 */
export function formatReportAsText(
  student: Student,
  plan: IepPlan,
  progress: WeeklyPlanProgress,
  goalSummaries: GoalAchievementSummary[],
  observations: Array<{ weekNumber: number; notes: string; rating: AchievementRating }>,
): string {
  const sections: string[] = []

  sections.push('IEP 진행 보고서')
  sections.push(SEPARATOR)

  sections.push(
    [
      `학생: ${student.name} (${student.grade})`,
      `제목: ${plan.title}`,
      `과목: ${plan.subject}`,
      `기간: ${plan.period_start} ~ ${plan.period_end}`,
    ].join('\n'),
  )

  sections.push(SEPARATOR)
  sections.push('【 전체 진도 】')
  sections.push(
    `완료 ${progress.completed} / 진행 중 ${progress.inProgress} / 예정 ${progress.planned} (총 ${progress.total}주, ${progress.completedPct}%)`,
  )

  if (goalSummaries.length > 0) {
    sections.push(SEPARATOR)
    sections.push('【 목표별 달성도 】')
    const goalLines = goalSummaries.map((gs) => {
      const goal = plan.goals.find(
        (g) => g.achievement_standard_id === gs.achievementStandardId,
      )
      const code = goal?.achievement_standard_code ?? gs.achievementStandardId
      return `${code}: 평가 ${gs.total}회, 달성+초과 ${gs.met + gs.exceeded}회 (달성률 ${gs.metRate}%)`
    })
    sections.push(goalLines.join('\n'))
  }

  if (observations.length > 0) {
    sections.push(SEPARATOR)
    sections.push('【 관찰 기록 】')
    const obsLines = observations.map(
      (obs) => `${obs.weekNumber}주차 [${RATING_LABELS[obs.rating]}]: ${obs.notes}`,
    )
    sections.push(obsLines.join('\n'))
  }

  return sections.join('\n\n')
}

const MATERIAL_TYPE_LABELS: Record<string, string> = {
  link: '링크',
  file: '파일',
  note: '메모',
}

/**
 * 교수학습 자료를 포함한 주차별 계획 텍스트를 포맷한다.
 */
export function formatWeeklyPlansWithMaterials(
  weeklyPlans: WeeklyPlan[],
  goals: IepGoal[],
  materialsMap: Map<string, TeachingMaterial[]>,
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

      const mats = materialsMap.get(wp.id) ?? []
      if (mats.length > 0) {
        details.push(`  교수학습 자료:`)
        mats.forEach((m) => {
          const typeLabel = MATERIAL_TYPE_LABELS[m.type] ?? m.type
          if (m.type === 'link' && m.content) {
            details.push(`    [${typeLabel}] ${m.title}: ${m.content}`)
          } else if (m.type === 'file' && m.file_url) {
            details.push(`    [${typeLabel}] ${m.title}: ${m.file_url}`)
          } else {
            details.push(`    [${typeLabel}] ${m.title}${m.content ? ': ' + m.content : ''}`)
          }
        })
      }

      return [header, ...details].join('\n')
    })
    .join('\n')
}
