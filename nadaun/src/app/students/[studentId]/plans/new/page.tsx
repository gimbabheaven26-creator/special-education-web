import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudentById } from '@/lib/queries/students'
import { IepPlanForm } from '@/components/plans/iep-plan-form'

export default async function NewIepPlanPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const student = await getStudentById(studentId)
  if (!student) notFound()

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

      <IepPlanForm studentId={student.id} />
    </div>
  )
}
