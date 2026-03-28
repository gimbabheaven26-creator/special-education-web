import Link from 'next/link'
import { StudentForm } from '@/components/students/student-form'
import { createStudent } from '@/lib/actions/students'

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/students"
          className="text-sm text-muted-foreground hover:text-foreground"
          aria-label="학생 목록으로 돌아가기"
        >
          &larr; 목록
        </Link>
        <h1 className="text-2xl font-bold">학생 등록</h1>
      </div>

      <StudentForm action={createStudent} submitLabel="등록" />
    </div>
  )
}
