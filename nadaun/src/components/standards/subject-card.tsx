import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { SubjectMeta } from '@/lib/utils/subject-map'

interface SubjectCardProps {
  meta: SubjectMeta
  count: number
}

export function SubjectCard({ meta, count }: SubjectCardProps) {
  return (
    <Link
      href={`/standards/${meta.slug}`}
      className="block transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      aria-label={`${meta.label} — 성취기준 ${count}개`}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              <span className="mr-2" aria-hidden="true">{meta.emoji}</span>
              {meta.label}
            </CardTitle>
            <Badge variant="secondary">{count}개</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{meta.description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
