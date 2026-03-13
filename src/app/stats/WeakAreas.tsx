'use client';

import Link from 'next/link';
import type { SubjectStats } from '@/lib/stats-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeakAreasProps {
  readonly weakAreas: ReadonlyArray<SubjectStats>;
}

function rateColorClass(rate: number): string {
  if (rate >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export default function WeakAreas({ weakAreas }: WeakAreasProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">취약 영역</CardTitle>
      </CardHeader>
      <CardContent>
        {weakAreas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            잘하고 있어요! 취약 영역이 없습니다
          </p>
        ) : (
          <ul className="space-y-3">
            {weakAreas.map((area) => (
              <li
                key={area.subject}
                className="flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {area.rate < 40 && (
                    <span className="flex-shrink-0" aria-label="경고">
                      <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                        주의
                      </Badge>
                    </span>
                  )}
                  <span className="text-sm truncate">{area.subject}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`text-sm font-medium ${rateColorClass(area.rate)}`}>
                    {area.rate}%
                  </span>
                  <Link
                    href="/quiz"
                    className="text-xs text-primary hover:underline whitespace-nowrap"
                  >
                    연습하기
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
