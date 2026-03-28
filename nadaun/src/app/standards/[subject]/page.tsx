import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDomainsBySubject } from '@/lib/queries/achievement-standards'
import { slugToSubject, getSubjectMeta, ALL_SUBJECT_SLUGS } from '@/lib/utils/subject-map'
import { DomainCard } from '@/components/standards/domain-card'
import type { SubjectSlug } from '@/lib/utils/subject-map'

interface Props {
  params: Promise<{ subject: string }>
}

export async function generateStaticParams() {
  return ALL_SUBJECT_SLUGS.map((subject) => ({ subject }))
}

export async function generateMetadata({ params }: Props) {
  const { subject: slug } = await params
  const meta = getSubjectMeta(slug as SubjectSlug)
  return {
    title: meta ? `${meta.label} 영역` : '영역 목록',
  }
}

export default async function SubjectDomainsPage({ params }: Props) {
  const { subject: slug } = await params
  const subjectName = slugToSubject(slug as SubjectSlug)
  const meta = getSubjectMeta(slug as SubjectSlug)

  if (!subjectName || !meta) notFound()

  const domains = await getDomainsBySubject(subjectName)

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
        <h1 className="mt-2 text-2xl font-bold">
          <span className="mr-2" aria-hidden="true">{meta.emoji}</span>
          {meta.label}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {domains.length}개 영역 · 총 {domains.reduce((s, d) => s + d.count, 0)}개 성취기준
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {domains.map((d) => (
          <DomainCard key={d.domain_code} subjectSlug={slug} domain={d} />
        ))}
      </div>
    </div>
  )
}
