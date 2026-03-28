import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStudentById } from '@/lib/queries/students'
import { StudentForm } from '@/components/students/student-form'
import { updateStudent } from '@/lib/actions/students'

export default async function EditStudentPage({
  params,
}: {
  params: { studentId: string }
}) {
  const student = await getStudentById(params.studentId)
  if (!student) notFound()

  const updateAction = updateStudent.bind(null, student.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/students/${student.id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-label={`${student.name} 상세로 돌아가기`}
        >
          &larr; 돌아가기
        </Link>
        <h1 className="text-2xl font-bold">학생 정보 수정</h1>
      </div>

      <StudentForm
        action={updateAction}
        student={student}
        submitLabel="저장"
      />
    </div>
  )
}
