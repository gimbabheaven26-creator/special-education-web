import type { Metadata } from 'next'
import Link from 'next/link'
import { getStudents } from '@/lib/queries/students'
import { StudentCard } from '@/components/students/student-card'

export const metadata: Metadata = {
  title: '내 학생',
  description: '등록된 학생 목록과 IEP 계획을 관리합니다.',
}

export default async function StudentsPage() {
  const students = await getStudents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 학생</h1>
        <Link
          href="/students/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="학생 등록"
        >
          + 학생 등록
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            등록된 학생이 없습니다.
          </p>
          <Link
            href="/students/new"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            aria-label="첫 학생 등록하기"
          >
            첫 학생 등록하기
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  )
}
