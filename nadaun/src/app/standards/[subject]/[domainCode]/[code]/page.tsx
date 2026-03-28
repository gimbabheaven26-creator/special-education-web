import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getStandardByCode, getDomainsBySubject } from '@/lib/queries/achievement-standards'
import { slugToSubject, getSubjectMeta, subjectToSlug } from '@/lib/utils/subject-map'
import { StandardDetail } from '@/components/standards/standard-detail'
import type { SubjectSlug } from '@/lib/utils/subject-map'

interface Props {
  params: Promise<{ subject: string; domainCode: string; code: string }>
}

export async function generateMetadata({ params }: Props) {
  const { code } = await params
  const decoded = decodeURIComponent(code)
  const standard = await getStandardByCode(decoded)
  return {
    title: standard ? `${standard.code} — ${standard.content.slice(0, 30)}` : '성취기준',
  }
}

export default async function StandardDetailPage({ params }: Props) {
  const { subject: slug, domainCode, code } = await params
  const decoded = decodeURIComponent(code)
  const subjectName = slugToSubject(slug as SubjectSlug)
  const meta = getSubjectMeta(slug as SubjectSlug)

  if (!subjectName || !meta) notFound()

  const standard = await getStandardByCode(decoded)
  if (!standard) notFound()

  // Verify the standard belongs to this subject/domain
  const expectedSlug = subjectToSlug(standard.subject)
  if (expectedSlug !== slug || standard.domain_code !== domainCode) notFound()

  const domains = await getDomainsBySubject(subjectName)
  const domain = domains.find((d) => d.domain_code === domainCode)

  return (
    <div className="space-y-6">
      <nav aria-label="경로">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <li>
            <Link href="/standards" className="hover:text-foreground transition-colors">
              과목
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link href={`/standards/${slug}`} className="hover:text-foreground transition-colors">
              {meta.label}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li>
            <Link
              href={`/standards/${slug}/${domainCode}`}
              className="hover:text-foreground transition-colors"
            >
              {domain?.domain ?? domainCode}
            </Link>
          </li>
          <li aria-hidden="true">›</li>
          <li className="text-foreground font-medium" aria-current="page">
            {standard.code}
          </li>
        </ol>
      </nav>

      <StandardDetail standard={standard} />
    </div>
  )
}
