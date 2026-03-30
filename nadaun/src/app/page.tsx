import Link from 'next/link'
import { QuickStartForm } from '@/components/quick-start-form'
import { getStudents, getThisWeekTodos } from '@/lib/queries/students'
import { getTeacherId } from '@/lib/supabase/auth'
import { Card, CardContent } from '@/components/ui/card'

export default async function Home() {
  const teacherId = await getTeacherId()
  const allStudents = await getStudents()
  const students = allStudents.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
  }))

  const studentCount = allStudents.length
  const iepCount = allStudents.reduce((sum, s) => sum + s.iep_count, 0)

  const todos = await getThisWeekTodos(teacherId)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          나다운
        </h1>
        <p className="text-muted-foreground">
          기본교육과정 기반 IEP 계획 보조도구
        </p>

        <div
          className="grid grid-cols-3 gap-3"
          aria-label="대시보드 요약"
        >
          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-3">
              <span
                className="text-3xl font-bold text-primary"
                aria-label={`학생 ${studentCount}명`}
              >
                {studentCount}
              </span>
              <span className="text-xs text-muted-foreground">키움이</span>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-3">
              <span
                className="text-3xl font-bold text-primary"
                aria-label={`IEP ${iepCount}개`}
              >
                {iepCount}
              </span>
              <span className="text-xs text-muted-foreground">IEP 계획</span>
            </CardContent>
          </Card>

          <Card size="sm">
            <CardContent className="flex flex-col items-center gap-1 py-3">
              <span
                className="text-3xl font-bold text-primary"
                aria-label={`이번 주 할 일 ${todos.length}건`}
              >
                {todos.length}
              </span>
              <span className="text-xs text-muted-foreground">이번 주 할 일</span>
            </CardContent>
          </Card>
        </div>

        {/* Task 10: 이번 주 할 일 섹션 */}
        {todos.length > 0 && (
          <div className="space-y-2 text-left">
            <h2 className="text-sm font-semibold text-muted-foreground">
              이번 주 할 일
            </h2>
            <div className="space-y-1.5">
              {todos.map((todo) => (
                <Link
                  key={todo.weeklyPlanId}
                  href={`/students/${todo.studentId}/plans/${todo.iepPlanId}`}
                  className="block rounded-lg border p-2.5 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {todo.weekNumber}주차
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {todo.studentName}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm truncate">{todo.activity}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {studentCount === 0 && (
          <div
            className="rounded-lg border border-dashed p-6 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">
              아직 등록된 학생이 없습니다.
            </p>
            <Link
              href="/students/new"
              className="mt-3 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              aria-label="첫 학생 등록하기"
            >
              첫 학생 등록하기
            </Link>
          </div>
        )}

        <QuickStartForm students={students} />

        <div className="flex gap-3">
          <Link
            href="/students"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            키움이들
          </Link>
          <Link
            href="/standards"
            className="inline-flex flex-1 items-center justify-center rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            성취기준
          </Link>
        </div>
      </div>
    </main>
  )
}
