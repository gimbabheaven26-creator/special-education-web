import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getStudentById,
  getIepPlanById,
  getWeeklyPlansByIepPlan,
} from '@/lib/queries/students'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { PlanStatusActions } from '@/components/plans/plan-status-actions'
import { PlanExportToolbar } from '@/components/export/plan-export-toolbar'
import { WeeklyPlanSection } from '@/components/plans/weekly-plan-section'

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

export default async function PlanDetailPage({
  params,
}: {
  params: Promise<{ studentId: string; planId: string }>
}) {
  const { studentId, planId } = await params
  const [student, plan] = await Promise.all([
    getStudentById(studentId),
    getIepPlanById(planId),
  ])

  if (!student || !plan) notFound()

  const weeklyPlans = await getWeeklyPlansByIepPlan(plan.id)

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
              <PlanStatusActions
                planId={plan.id}
                studentId={student.id}
                currentStatus={plan.status}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <PlanExportToolbar plan={plan} weeklyPlans={weeklyPlans} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          목표 ({plan.goals.length}개)
        </h2>
        {plan.goals.map((goal, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">
                  {goal.achievement_standard_code}
                </Badge>
                <div className="min-w-0">
                  <p className="font-medium">{goal.description}</p>
                  <Badge variant="secondary" className="mt-1">
                    {goal.target_level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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
