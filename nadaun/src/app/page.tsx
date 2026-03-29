import Link from 'next/link'
import { QuickStartForm } from '@/components/quick-start-form'
import { getStudents } from '@/lib/queries/students'
import { Card, CardContent } from '@/components/ui/card'

export default async function Home() {
  const allStudents = await getStudents()
  const students = allStudents.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
  }))

  const studentCount = allStudents.length
  const iepCount = allStudents.reduce((sum, s) => sum + s.iep_count, 0)

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
                aria-label={`주차 계획 있는 IEP ${iepCount > 0 ? iepCount : 0}개`}
              >
                {iepCount}
              </span>
              <span className="text-xs text-muted-foreground">이번 주 계획</span>
            </CardContent>
          </Card>
        </div>

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
