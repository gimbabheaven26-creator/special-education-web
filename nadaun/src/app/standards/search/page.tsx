import { Suspense } from 'react'
import Link from 'next/link'
import { searchStandards } from '@/lib/queries/achievement-standards'
import { subjectToSlug } from '@/lib/utils/subject-map'
import { SearchForm } from '@/components/standards/search-form'
import { StandardListItem } from '@/components/standards/standard-list-item'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = {
  title: '성취기준 검색',
}

interface Props {
  searchParams: Promise<{ q?: string; subject?: string }>
}

async function SearchResults({ q, subject }: { q?: string; subject?: string }) {
  if (!q?.trim()) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        검색어를 입력하세요.
      </p>
    )
  }

  const filters = subject && subject !== 'all' ? { subject } : undefined
  const results = await searchStandards(q, filters)

  if (results.length === 0) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        &ldquo;{q}&rdquo;에 대한 검색 결과가 없습니다.
      </p>
    )
  }

  return (
    <div className="space-y-3" role="list" aria-label="검색 결과">
      <p className="text-sm text-muted-foreground">
        {results.length}개 결과
      </p>
      {results.map((s) => {
        const slug = subjectToSlug(s.subject) ?? s.subject
        return (
          <div key={s.code} role="listitem">
            <StandardListItem standard={s} subjectSlug={slug} />
          </div>
        )
      })}
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, subject } = await searchParams

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/standards"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label="과목 목록으로 돌아가기"
        >
          ← 과목 목록
        </Link>
        <h1 className="mt-2 text-2xl font-bold">성취기준 검색</h1>
      </div>

      <Suspense>
        <SearchForm />
      </Suspense>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults q={q} subject={subject} />
      </Suspense>
    </div>
  )
}
