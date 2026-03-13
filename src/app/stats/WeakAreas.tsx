'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { SubjectStats, ChapterStats } from '@/lib/stats-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeakAreasProps {
  readonly weakAreas: ReadonlyArray<SubjectStats>;
  readonly chapterStats: ReadonlyArray<ChapterStats>;
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
}

function rateColorClass(rate: number): string {
  if (rate >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function WeakSubjectRow({
  area,
  chapters,
  subjectTitleMap,
  chapterTitleMap,
}: {
  area: SubjectStats;
  chapters: ReadonlyArray<ChapterStats>;
  subjectTitleMap: Readonly<Record<string, string>>;
  chapterTitleMap: Readonly<Record<string, string>>;
}) {
  const [expanded, setExpanded] = useState(false);
  const weakChapters = chapters
    .filter((c) => c.subject === area.subject && c.rate < 60)
    .sort((a, b) => a.rate - b.rate);

  return (
    <li>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {area.rate < 40 && (
            <span className="flex-shrink-0" aria-label="경고">
              <Badge variant="destructive" className="text-xs px-1.5 py-0.5">
                주의
              </Badge>
            </span>
          )}
          <span className="text-sm truncate">{subjectTitleMap[area.subject] || area.subject}</span>
          {weakChapters.length > 0 && (
            <button
              onClick={() => setExpanded((prev) => !prev)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-muted transition-colors"
              aria-label={expanded ? '접기' : '펼치기'}
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`text-sm font-medium ${rateColorClass(area.rate)}`}>
            {area.rate}%
          </span>
          <Link
            href={`/quiz/${area.subject}`}
            className="text-xs text-primary hover:underline whitespace-nowrap"
          >
            연습하기
          </Link>
        </div>
      </div>

      {/* Chapter drill-down */}
      {expanded && weakChapters.length > 0 && (
        <ul className="ml-6 mt-1.5 space-y-1 border-l-2 border-border pl-3">
          {weakChapters.map((ch) => (
            <li
              key={`${ch.subject}::${ch.chapter}`}
              className="flex items-center justify-between text-xs gap-2"
            >
              <span className="text-muted-foreground truncate">
                {chapterTitleMap[`${ch.subject}::${ch.chapter}`] || ch.chapter}
              </span>
              <span className={`font-medium flex-shrink-0 ${rateColorClass(ch.rate)}`}>
                {ch.correct}/{ch.total} ({ch.rate}%)
              </span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function WeakAreas({ weakAreas, chapterStats, subjectTitleMap, chapterTitleMap }: WeakAreasProps) {
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
              <WeakSubjectRow
                key={area.subject}
                area={area}
                chapters={chapterStats}
                subjectTitleMap={subjectTitleMap}
                chapterTitleMap={chapterTitleMap}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
