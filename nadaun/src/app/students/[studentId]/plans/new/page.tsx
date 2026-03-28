import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStudentById } from '@/lib/queries/students'
import { createIepPlan } from '@/lib/actions/iep-plans'
import { IepPlanForm } from '@/components/iep/iep-plan-form'
import type { StandardForSelector } from '@/components/iep/standard-selector-dialog'

export default async function NewIepPlanPage({
  params,
}: {
  params: { studentId: string }
}) {
  const { studentId } = params
  const student = await getStudentById(studentId)
  if (!student) notFound()

  const supabase = await createClient()
  const { data: allStandards } = await supabase
    .from('achievement_standards')
    .select('id, subject, domain, domain_code, code, content')
    .order('code')
    .limit(10000)

  const standards: StandardForSelector[] =
    (allStandards ?? []) as StandardForSelector[]

  const boundAction = createIepPlan.bind(null, student.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <Link
        href={`/students/${student.id}`}
        className="text-sm text-muted-foreground hover:text-foreground"
        aria-label={`${student.name} 학생 상세 페이지로 돌아가기`}
      >
        &larr; 돌아가기
      </Link>

      <h1 className="text-2xl font-bold">
        새 IEP 계획 &mdash; {student.name}
      </h1>

      <IepPlanForm
        action={boundAction}
        standards={standards}
        submitLabel="저장"
      />
    </div>
  )
}
