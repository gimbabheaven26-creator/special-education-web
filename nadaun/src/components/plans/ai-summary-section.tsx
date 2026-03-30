'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type {
  Student,
  IepPlan,
  GoalAchievementSummary,
  AchievementRating,
} from '@/types/students'
import type { WeeklyPlanProgress } from '@/lib/queries/students'

const RATING_LABELS: Record<AchievementRating, string> = {
  not_met: '미달',
  met: '달성',
  exceeded: '초과',
}

interface AiSummarySectionProps {
  student: Student
  plan: IepPlan
  progress: WeeklyPlanProgress
  goalSummaries: GoalAchievementSummary[]
  observations: Array<{ weekNumber: number; notes: string; rating: AchievementRating }>
}

function generateSummaryText(props: AiSummarySectionProps): string {
  const { student, plan, progress, goalSummaries, observations } = props

  const lines: string[] = []

  lines.push(
    `${student.name} 학생은 ${plan.period_start}부터 ${plan.period_end}까지 ` +
    `"${plan.title}" (${plan.subject}) 과목의 IEP를 수행하였습니다.`,
  )

  lines.push('')

  if (progress.total > 0) {
    lines.push(
      `전체 ${progress.total}주차 중 ${progress.completed}주차를 완료하여 ` +
      `진도율 ${progress.completedPct}%를 달성하였습니다.` +
      (progress.inProgress > 0 ? ` 현재 ${progress.inProgress}주차가 진행 중입니다.` : ''),
    )
  }

  if (goalSummaries.length > 0) {
    lines.push('')
    lines.push('【 목표별 달성 현황 】')
    for (const gs of goalSummaries) {
      const goal = plan.goals.find(
        (g) => g.achievement_standard_id === gs.achievementStandardId,
      )
      const code = goal?.achievement_standard_code ?? gs.achievementStandardId
      lines.push(
        `- ${code}: 평가 ${gs.total}회 중 달성+초과 ${gs.met + gs.exceeded}회 (달성률 ${gs.metRate}%)`,
      )
    }
  }

  if (observations.length > 0) {
    lines.push('')
    lines.push('【 주요 관찰 기록 】')
    for (const obs of observations.slice(0, 5)) {
      lines.push(
        `- ${obs.weekNumber}주차 [${RATING_LABELS[obs.rating]}]: ${obs.notes}`,
      )
    }
  }

  lines.push('')

  const overallMet = goalSummaries.reduce((sum, gs) => sum + gs.met + gs.exceeded, 0)
  const overallTotal = goalSummaries.reduce((sum, gs) => sum + gs.total, 0)
  const overallRate = overallTotal > 0 ? Math.round((overallMet / overallTotal) * 100) : 0

  if (overallRate >= 80) {
    lines.push(
      `종합적으로 ${student.name} 학생은 대부분의 학습 목표를 달성하고 있으며, ` +
      `꾸준한 학습 참여와 성과를 보이고 있습니다. ` +
      `다음 학기에는 도달수준을 상향하여 보다 심화된 학습을 계획할 수 있습니다.`,
    )
  } else if (overallRate >= 50) {
    lines.push(
      `종합적으로 ${student.name} 학생은 학습 목표의 일부를 달성하고 있으며, ` +
      `지속적인 지원과 반복 학습을 통해 목표 달성률을 높여갈 수 있습니다. ` +
      `미달 영역에 대한 추가 지도가 필요합니다.`,
    )
  } else {
    lines.push(
      `종합적으로 ${student.name} 학생은 학습 목표 달성에 어려움을 보이고 있어, ` +
      `교수 방법의 조정과 개별화된 지원 강화가 필요합니다. ` +
      `목표 수준의 하향 조정도 고려할 수 있습니다.`,
    )
  }

  return lines.join('\n')
}

export function AiSummarySection(props: AiSummarySectionProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  function handleGenerate() {
    const text = generateSummaryText(props)
    setSummary(text)
    setIsEditing(true)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">종합 의견</CardTitle>
          {!summary && (
            <Button
              type="button"
              size="sm"
              onClick={handleGenerate}
              aria-label="종합 의견 자동 생성"
            >
              자동 생성
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="space-y-3">
            {isEditing ? (
              <>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={10}
                  className="text-sm"
                  aria-label="종합 의견 편집"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                  >
                    확인
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleGenerate}
                  >
                    다시 생성
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {summary}
                </div>
                <div className="flex gap-2 print:hidden">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditing(true)}
                    aria-label="종합 의견 수정"
                  >
                    수정
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      await navigator.clipboard.writeText(summary)
                    }}
                    aria-label="종합 의견 복사"
                  >
                    복사
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            자동 생성 버튼을 눌러 달성도 데이터 기반 종합 의견을 생성할 수 있습니다.
            생성 후 자유롭게 수정할 수 있습니다.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
