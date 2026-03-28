import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentById, getIepPlanById } from '@/lib/queries/students'
import { updateIepPlan } from '@/lib/actions/iep-plans'
import { IepPlanForm } from '@/components/iep/iep-plan-form'
import type { StandardForSelector } from '@/components/iep/standard-selector-dialog'

export default async function EditIepPlanPage({
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

  const supabase = await createClient()
  const { data: allStandards } = await supabase
    .from('achievement_standards')
    .select('id, subject, domain, domain_code, code, content')
    .order('code')
    .limit(10000)

  const standards: StandardForSelector[] =
    (allStandards ?? []) as StandardForSelector[]

  const boundAction = updateIepPlan.bind(null, plan.id, student.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <Link
        href={`/students/${student.id}/plans/${plan.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
        aria-label="IEP 계획 상세 페이지로 돌아가기"
      >
        &larr; 돌아가기
      </Link>

      <h1 className="text-2xl font-bold">IEP 계획 수정</h1>

      <IepPlanForm
        action={boundAction}
        standards={standards}
        plan={plan}
        submitLabel="저장"
      />
    </div>
  )
}
