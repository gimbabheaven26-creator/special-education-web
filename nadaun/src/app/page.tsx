import Link from 'next/link'
import { QuickStartForm } from '@/components/quick-start-form'
import { getStudents } from '@/lib/queries/students'

export default async function Home() {
  const allStudents = await getStudents()
  const students = allStudents.map((s) => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
  }))

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          나다운
        </h1>
        <p className="text-muted-foreground">
          기본교육과정 기반 IEP 계획 보조도구
        </p>

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
