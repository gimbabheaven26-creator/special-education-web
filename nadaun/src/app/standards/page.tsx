import Link from 'next/link'
import { getSubjectSummaries } from '@/lib/queries/achievement-standards'
import { getSubjectMeta } from '@/lib/utils/subject-map'
import { SubjectCard } from '@/components/standards/subject-card'
import type { SubjectSlug } from '@/lib/utils/subject-map'

export const metadata = {
  title: '성취기준 탐색',
  description: '2022 개정 기본교육과정 4과목 성취기준을 탐색합니다.',
}

export default async function StandardsPage() {
  const summaries = await getSubjectSummaries()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">성취기준 탐색</h1>
          <p className="mt-1 text-muted-foreground">
            2022 개정 기본교육과정 · 중학교 1~3학년
          </p>
        </div>
        <Link
          href="/standards/search"
          aria-label="성취기준 검색"
          className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          검색
        </Link>
      </div>

      {summaries.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            성취기준 데이터가 아직 준비되지 않았습니다.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            관리자에게 데이터 삽입을 요청해주세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {summaries.map((s) => {
            const meta = getSubjectMeta(s.slug as SubjectSlug)
            if (!meta) return null
            return <SubjectCard key={s.slug} meta={meta} count={s.count} />
          })}
        </div>
      )}
    </div>
  )
}
