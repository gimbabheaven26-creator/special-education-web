import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudentById, getIepPlansByStudent, getWeeklyPlanCountsByStudent } from '@/lib/queries/students'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DeleteStudentDialog } from '@/components/students/delete-student-dialog'

function calculateTotalWeeks(periodStart: string, periodEnd: string): number {
  const start = new Date(periodStart)
  const end = new Date(periodEnd)
  const diffMs = end.getTime() - start.getTime()
  return Math.max(1, Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000)))
}

export default async function StudentDetailPage({
  params,
}: {
  params: { studentId: string }
}) {
  const student = await getStudentById(params.studentId)
  if (!student) notFound()

  const [plans, weeklyCountMap] = await Promise.all([
    getIepPlansByStudent(student.id),
    getWeeklyPlanCountsByStudent(student.id),
  ])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/students"
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-label="학생 목록으로 돌아가기"
        >
          &larr; 목록
        </Link>
      </div>

      {/* Student Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-xl">{student.name}</CardTitle>
              <Badge variant="secondary">{student.grade}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/students/${student.id}/edit`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={`${student.name} 정보 수정`}
              >
                수정
              </Link>
              <DeleteStudentDialog studentId={student.id} studentName={student.name} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          {student.disability_type && (
            <p>장애유형: {student.disability_type}</p>
          )}
          {student.notes && <p>메모: {student.notes}</p>}
        </CardContent>
      </Card>

      {/* IEP Plans */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">IEP 계획</h2>
          <div className="flex items-center gap-2">
            {plans.length > 0 && (
              <a
                href={`/api/export/pdf?studentId=${student.id}`}
                download
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="전체 IEP를 PDF로 다운로드"
              >
                전체 PDF
              </a>
            )}
            <Link
              href={`/students/${student.id}/plans/new`}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="새 IEP 계획 작성"
            >
              + 새 계획
            </Link>
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="text-muted-foreground">
              아직 IEP 계획이 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {plans.map((plan) => {
                const writtenWeeks = weeklyCountMap.get(plan.id) ?? 0
                const totalWeeks = calculateTotalWeeks(plan.period_start, plan.period_end)
                const progressPct = Math.round((writtenWeeks / totalWeeks) * 100)

                return (
                  <Link
                    key={plan.id}
                    href={`/students/${student.id}/plans/${plan.id}`}
                    className="block rounded-lg border p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label={`${plan.title} — ${plan.subject}, 주간계획 ${writtenWeeks}/${totalWeeks}주 작성 완료`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{plan.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {plan.subject} &middot; {plan.period_start} ~ {plan.period_end}
                        </p>
                      </div>
                      <Badge
                        variant={
                          plan.status === 'active'
                            ? 'default'
                            : plan.status === 'completed'
                              ? 'secondary'
                              : 'outline'
                        }
                      >
                        {plan.status === 'draft'
                          ? '초안'
                          : plan.status === 'active'
                            ? '진행 중'
                            : '완료'}
                      </Badge>
                    </div>
                    <p
                      className="mt-1 text-xs text-muted-foreground"
                      aria-label={`목표 ${plan.goals.length}개, 주간계획 진행률 ${writtenWeeks}주 작성 / 총 ${totalWeeks}주`}
                    >
                      목표 {plan.goals.length}개
                      {' · '}
                      {writtenWeeks === 0 ? (
                        <span>아직 시작 전</span>
                      ) : progressPct >= 100 ? (
                        <Badge variant="secondary" className="ml-1 text-xs">완료</Badge>
                      ) : (
                        <span>진행률 {writtenWeeks}/{totalWeeks}주 ({progressPct}%)</span>
                      )}
                    </p>
                  </Link>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
