import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { AchievementStandardRow } from '@/types/achievement-standards'

interface StandardListItemProps {
  standard: AchievementStandardRow
  subjectSlug: string
}

export function StandardListItem({ standard, subjectSlug }: StandardListItemProps) {
  return (
    <Link
      href={`/standards/${subjectSlug}/${standard.domain_code}/${encodeURIComponent(standard.code)}`}
      className="block rounded-lg border p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      aria-label={`${standard.code} — ${standard.content}`}
    >
      <div className="flex items-start gap-3">
        <Badge variant="outline" className="shrink-0 font-mono text-xs">
          {standard.code}
        </Badge>
        <div className="min-w-0">
          <p className="text-sm leading-relaxed break-keep">{standard.content}</p>
          {standard.sub_domain && (
            <Badge variant="secondary" className="mt-2 text-xs">
              {standard.sub_domain}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  )
}
