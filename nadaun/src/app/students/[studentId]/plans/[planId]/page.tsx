import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getStudentById,
  getIepPlanById,
  getWeeklyPlansByIepPlan,
  getConsiderationsByStandardIds,
  getWeeklyPlanProgress,
} from '@/lib/queries/students'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlanStatusActions } from '@/components/plans/plan-status-actions'
import { PlanExportToolbar } from '@/components/export/plan-export-toolbar'
import { WeeklyPlanSection } from '@/components/plans/weekly-plan-section'
import { GenerateButton } from '@/components/ai/generate-button'
import { CalendarView } from '@/components/plans/calendar-view'
import { DuplicatePlanButton } from '@/components/plans/duplicate-plan-button'
import { getGoalAchievementSummary } from '@/lib/queries/students'

const STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  active: '진행 중',
  completed: '완료',
}

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  draft: 'outline',
  active: 'default',
  completed: 'secondary',
}

const TARGET_LEVEL_VARIANTS: Record<string, 'default' | 'secondary' | 'outline'> = {
  우수: 'default',
  보통: 'secondary',
  기초: 'outline',
}

export default async function PlanDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ studentId: string; planId: string }>
  searchParams: Promise<{ auto?: string }>
}) {
  const { studentId, planId } = await params
  const { auto } = await searchParams
  const autoGenerate = auto === '1'
  const [student, plan] = await Promise.all([
    getStudentById(studentId),
    getIepPlanById(planId),
  ])

  if (!student || !plan) notFound()

  const standardIds = plan.goals.map((g) => g.achievement_standard_id)
  const [weeklyPlans, considerationsMap, progress, goalSummaries] = await Promise.all([
    getWeeklyPlansByIepPlan(plan.id),
    getConsiderationsByStandardIds(standardIds),
    getWeeklyPlanProgress(plan.id),
    getGoalAchievementSummary(plan.id),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/students/${student.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-label={`${student.name} 페이지로 돌아가기`}
        >
          &larr; {student.name}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{plan.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {plan.subject} &middot; {plan.period_start} ~ {plan.period_end}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_VARIANTS[plan.status]}>
                {STATUS_LABELS[plan.status]}
              </Badge>
              <Link
                href={`/students/${student.id}/plans/${plan.id}/edit`}
                className="inline-flex h-7 items-center justify-center rounded-md border border-input bg-background px-2.5 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="IEP 계획 수정"
              >
                수정
              </Link>
              <DuplicatePlanButton
                planId={plan.id}
                studentId={student.id}
                planTitle={plan.title}
              />
              <PlanStatusActions
                planId={plan.id}
                studentId={student.id}
                currentStatus={plan.status}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-wrap gap-2">
        <PlanExportToolbar plan={plan} weeklyPlans={weeklyPlans} />
        <Link
          href={`/students/${student.id}/plans/${plan.id}/report`}
          className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="IEP 진행 보고서 보기"
        >
          진행 보고서
        </Link>
      </div>

      {progress.total > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={progress.completedPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`진도 ${progress.completedPct}% 완료`}
            >
              <div className="flex h-full">
                {progress.completed > 0 && (
                  <div
                    className="bg-green-500 transition-all"
                    style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                  />
                )}
                {progress.inProgress > 0 && (
                  <div
                    className="bg-blue-500 transition-all"
                    style={{ width: `${(progress.inProgress / progress.total) * 100}%` }}
                  />
                )}
              </div>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">
              {progress.completedPct}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            완료 {progress.completed} / 진행 중 {progress.inProgress} / 예정 {progress.planned} (총 {progress.total}주)
          </p>
        </div>
      )}

      {/* Task 5: 목표별 달성도 요약 */}
      {goalSummaries.length > 0 && (
        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="text-sm font-semibold">목표별 달성도</h3>
          <div className="space-y-2">
            {goalSummaries.map((gs) => {
              const goal = plan.goals.find(
                (g) => g.achievement_standard_id === gs.achievementStandardId,
              )
              return (
                <div key={gs.achievementStandardId} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {goal?.achievement_standard_code ?? ''}
                  </Badge>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    {gs.total > 0 && (
                      <div className="flex h-full">
                        {gs.exceeded > 0 && (
                          <div className="bg-blue-500" style={{ width: `${(gs.exceeded / gs.total) * 100}%` }} />
                        )}
                        {gs.met > 0 && (
                          <div className="bg-green-500" style={{ width: `${(gs.met / gs.total) * 100}%` }} />
                        )}
                      </div>
                    )}
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {gs.metRate}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Task 11: 캘린더 뷰 */}
      {weeklyPlans.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">주차 캘린더</h3>
          <CalendarView weeklyPlans={weeklyPlans} periodStart={plan.period_start} />
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          목표 ({plan.goals.length}개)
        </h2>
        {plan.goals.map((goal, i) => {
          const considerations = considerationsMap.get(goal.achievement_standard_id)
          return (
            <Card key={i}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="shrink-0">
                    {goal.achievement_standard_code}
                  </Badge>
                  <div className="min-w-0">
                    <p className="font-medium">{goal.description}</p>
                    <Badge
                      variant={TARGET_LEVEL_VARIANTS[goal.target_level] ?? 'secondary'}
                      className="mt-1"
                    >
                      {goal.target_level}
                    </Badge>
                  </div>
                </div>

                {/* Task 1: 현행수준 평가 결과 표시 */}
                {goal.present_level && (
                  <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      현행수준 평가
                    </p>
                    <div className="grid gap-1">
                      {goal.present_level.levels.map((lv, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">
                            {lv.axis_label}
                          </span>
                          <span>{lv.selected_text}</span>
                        </div>
                      ))}
                    </div>
                    {goal.present_level.notes && (
                      <p className="text-sm text-muted-foreground">
                        {goal.present_level.notes}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      추천 도달수준:{' '}
                      <Badge
                        variant={TARGET_LEVEL_VARIANTS[goal.present_level.recommended_target] ?? 'secondary'}
                        className="text-xs"
                      >
                        {goal.present_level.recommended_target}
                      </Badge>
                    </p>
                  </div>
                )}

                {/* Task 2: 고려사항 표시 */}
                {considerations && considerations.length > 0 && (
                  <div className="rounded-lg border border-dashed p-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      수업 시 고려사항
                    </p>
                    <ul className="list-disc list-inside space-y-0.5">
                      {considerations.map((c, j) => (
                        <li key={j} className="text-sm text-muted-foreground">
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">주차별 수업 계획</h2>
          <GenerateButton
            planId={plan.id}
            studentId={student.id}
            hasWeeklyPlans={weeklyPlans.length > 0}
            autoGenerate={autoGenerate}
          />
        </div>
      </div>

      <WeeklyPlanSection
        iepPlanId={plan.id}
        studentId={student.id}
        weeklyPlans={weeklyPlans}
        planGoals={plan.goals}
      />
    </div>
  )
}
