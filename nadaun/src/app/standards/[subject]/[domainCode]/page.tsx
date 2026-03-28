import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  getDomainsBySubject,
  getStandardsByDomain,
} from '@/lib/queries/achievement-standards'
import { slugToSubject, getSubjectMeta } from '@/lib/utils/subject-map'
import { SubDomainTabs } from '@/components/standards/sub-domain-tabs'
import { StandardListItem } from '@/components/standards/standard-list-item'
import type { SubjectSlug } from '@/lib/utils/subject-map'

interface Props {
  params: Promise<{ subject: string; domainCode: string }>
  searchParams: Promise<{ sub?: string }>
}

export async function generateMetadata({ params }: Props) {
  const { subject: slug, domainCode } = await params
  const subjectName = slugToSubject(slug as SubjectSlug)
  if (!subjectName) return { title: '성취기준' }

  const domains = await getDomainsBySubject(subjectName)
  const domain = domains.find((d) => d.domain_code === domainCode)
  return {
    title: domain ? `${subjectName} — ${domain.domain}` : '성취기준',
  }
}

export default async function DomainStandardsPage({ params, searchParams }: Props) {
  const { subject: slug, domainCode } = await params
  const { sub } = await searchParams
  const subjectName = slugToSubject(slug as SubjectSlug)
  const meta = getSubjectMeta(slug as SubjectSlug)

  if (!subjectName || !meta) notFound()

  const domains = await getDomainsBySubject(subjectName)
  const domain = domains.find((d) => d.domain_code === domainCode)
  if (!domain) notFound()

  const standards = await getStandardsByDomain(subjectName, domainCode, sub || undefined)
  const hasSubDomains = domain.subDomains.length > 0

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/standards/${slug}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`${meta.label} 영역 목록으로 돌아가기`}
        >
          ← {meta.label}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{domain.domain}</h1>
        <p className="mt-1 text-muted-foreground">
          {standards.length}개 성취기준
          {sub && ` · ${sub}`}
        </p>
      </div>

      {hasSubDomains && (
        <Suspense>
          <SubDomainTabs
            subjectSlug={slug}
            domainCode={domainCode}
            subDomains={domain.subDomains}
          />
        </Suspense>
      )}

      <div className="space-y-3" role="list" aria-label="성취기준 목록">
        {standards.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            해당 조건의 성취기준이 없습니다.
          </p>
        ) : (
          standards.map((s) => (
            <div key={s.code} role="listitem">
              <StandardListItem standard={s} subjectSlug={slug} />
            </div>
          ))
        )}
      </div>
    </div>
  )
}
