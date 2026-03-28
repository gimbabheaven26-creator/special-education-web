import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getStudentById,
  getIepPlanById,
  getWeeklyPlansByIepPlan,
} from '@/lib/queries/students'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DeletePlanDialog } from '@/components/iep/delete-plan-dialog'

const statusMap = {
  draft: '초안',
  active: '진행 중',
  completed: '완료',
} as const

const variantMap = {
  draft: 'outline',
  active: 'default',
  completed: 'secondary',
} as const

export default async function IepPlanDetailPage({
  params,
}: {
  params: { studentId: string; planId: string }
}) {
  const { studentId, planId } = params
  const [student, plan] = await Promise.all([
    getStudentById(studentId),
    getIepPlanById(planId),
  ])

  if (!student || !plan) notFound()

  const weeklyPlans = await getWeeklyPlansByIepPlan(plan.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <Link
        href={`/students/${student.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
        aria-label={`${student.name} 학생 상세 페이지로 돌아가기`}
      >
        &larr; {student.name}
      </Link>

      {/* Plan Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle>{plan.title}</CardTitle>
              <Badge variant={variantMap[plan.status]}>
                {statusMap[plan.status]}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {plan.subject} &middot; {plan.period_start} ~ {plan.period_end}
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Link
              href={`/students/${student.id}/plans/${plan.id}/edit`}
              className="text-sm font-medium text-primary hover:underline"
              aria-label="IEP 계획 수정"
            >
              수정
            </Link>
            <DeletePlanDialog planId={plan.id} studentId={student.id} planTitle={plan.title} />
          </div>
        </CardContent>
      </Card>

      {/* Goals Section */}
      <section aria-label="IEP 목표 목록">
        <h2 className="mb-3 text-lg font-semibold">목표</h2>
        {plan.goals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            설정된 목표가 없습니다.
          </p>
        ) : (
          <ul className="space-y-3">
            {plan.goals.map((goal, idx) => (
              <li
                key={`${goal.achievement_standard_id}-${idx}`}
                className="rounded-lg border p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    {goal.achievement_standard_code}
                  </span>
                  <Badge variant="outline">{goal.target_level}</Badge>
                </div>
                <p className="mt-1 text-sm">{goal.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Weekly Plans Section */}
      <section aria-label="주차별 계획 목록">
        <h2 className="mb-3 text-lg font-semibold">주차별 계획</h2>
        {weeklyPlans.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
            아직 주차별 계획이 없습니다.
          </div>
        ) : (
          <ul className="space-y-3">
            {weeklyPlans.map((wp) => (
              <li key={wp.id} className="rounded-lg border p-3">
                <div className="mb-1 font-medium">
                  {wp.week_number}주차
                </div>
                <p className="text-sm">{wp.activity}</p>
                {wp.materials && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    교재: {wp.materials}
                  </p>
                )}
                {wp.evaluation_method && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    평가: {wp.evaluation_method}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
