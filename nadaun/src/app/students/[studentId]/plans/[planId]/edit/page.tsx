import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudentById, getIepPlanById } from '@/lib/queries/students'
import { IepPlanForm } from '@/components/plans/iep-plan-form'

export default async function EditPlanPage({
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/students/${student.id}/plans/${plan.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-label={`${plan.title} 페이지로 돌아가기`}
        >
          &larr; {plan.title}
        </Link>
      </div>

      <h1 className="text-2xl font-bold">IEP 계획 수정</h1>

      <IepPlanForm studentId={student.id} plan={plan} />
    </div>
  )
}
