'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SubDomainTabsProps {
  subjectSlug: string
  domainCode: string
  subDomains: string[]
}

export function SubDomainTabs({
  subjectSlug,
  domainCode,
  subDomains,
}: SubDomainTabsProps) {
  const searchParams = useSearchParams()
  const activeSub = searchParams.get('sub')

  return (
    <nav aria-label="하위 영역 선택" className="flex flex-wrap gap-2">
      <Link
        href={`/standards/${subjectSlug}/${domainCode}`}
        className={cn(
          'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          !activeSub
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        )}
        aria-current={!activeSub ? 'page' : undefined}
      >
        전체
      </Link>
      {subDomains.map((sd) => (
        <Link
          key={sd}
          href={`/standards/${subjectSlug}/${domainCode}?sub=${encodeURIComponent(sd)}`}
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            activeSub === sd
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
          aria-current={activeSub === sd ? 'page' : undefined}
        >
          {sd}
        </Link>
      ))}
    </nav>
  )
}
