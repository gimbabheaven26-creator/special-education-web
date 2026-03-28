import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DomainSummary } from '@/lib/queries/achievement-standards'

interface DomainCardProps {
  subjectSlug: string
  domain: DomainSummary
}

export function DomainCard({ subjectSlug, domain }: DomainCardProps) {
  const hasSubDomains = domain.subDomains.length > 0

  return (
    <Link
      href={`/standards/${subjectSlug}/${domain.domain_code}`}
      className="block transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      aria-label={`${domain.domain} — 성취기준 ${domain.count}개`}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{domain.domain}</CardTitle>
            <Badge variant="secondary">{domain.count}개</Badge>
          </div>
        </CardHeader>
        {hasSubDomains && (
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {domain.subDomains.map((sd) => (
                <Badge key={sd} variant="outline" className="text-xs">
                  {sd}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}
