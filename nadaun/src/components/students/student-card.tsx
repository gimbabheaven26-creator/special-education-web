import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { StudentWithIepCount } from '@/types/students'

interface StudentCardProps {
  student: StudentWithIepCount
}

export function StudentCard({ student }: StudentCardProps) {
  return (
    <Link
      href={`/students/${student.id}`}
      className="block transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
      aria-label={`${student.name} — ${student.grade}`}
    >
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{student.name}</CardTitle>
            <Badge variant="secondary">{student.grade}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            {student.disability_type && (
              <span>{student.disability_type}</span>
            )}
            <span>IEP {student.iep_count}건</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
