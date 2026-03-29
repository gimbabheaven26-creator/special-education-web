'use client';

import { useState } from 'react';
import type { SubjectStats, ChapterStats } from '@/lib/study/stats-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SubjectAccuracyBarsProps {
  readonly subjectStats: ReadonlyArray<SubjectStats>;
  readonly chapterStats: ReadonlyArray<ChapterStats>;
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
}

function barColor(rate: number): string {
  if (rate >= 80) return 'bg-emerald-500';
  if (rate >= 60) return 'bg-amber-500';
  if (rate >= 40) return 'bg-orange-500';
  return 'bg-red-500';
}

function rateTextColor(rate: number): string {
  if (rate >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (rate >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

export default function SubjectAccuracyBars({
  subjectStats,
  chapterStats,
  subjectTitleMap,
  chapterTitleMap,
}: SubjectAccuracyBarsProps) {
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);

  function handleToggle(subject: string) {
    setExpandedSubject((prev) => (prev === subject ? null : subject));
  }

  function chaptersForSubject(subject: string): ReadonlyArray<ChapterStats> {
    return chapterStats
      .filter((c) => c.subject === subject)
      .sort((a, b) => a.rate - b.rate);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">과목별 정답률</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {subjectStats.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            데이터 없음
          </p>
        ) : (
          subjectStats.map((stat) => {
            const chapters = chaptersForSubject(stat.subject);
            const isExpanded = expandedSubject === stat.subject;

            return (
              <div key={stat.subject}>
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => handleToggle(stat.subject)}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-24 truncate flex-shrink-0">
                      {subjectTitleMap[stat.subject] || stat.subject}
                    </span>
                    <div className="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor(stat.rate)}`}
                        style={{ width: `${Math.max(stat.rate, 2)}%` }}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium w-12 text-right flex-shrink-0 ${rateTextColor(stat.rate)}`}
                    >
                      {stat.rate}%
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {isExpanded ? '\u25B2' : '\u25BC'}
                    </span>
                  </div>
                </button>

                {isExpanded && chapters.length > 0 && (
                  <div className="mt-2 ml-4 space-y-2 border-l-2 border-muted pl-3">
                    {chapters.map((ch) => (
                      <div key={`${ch.subject}::${ch.chapter}`} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-28 truncate flex-shrink-0">
                          {chapterTitleMap[`${ch.subject}::${ch.chapter}`] || ch.chapter}
                        </span>
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${barColor(ch.rate)}`}
                            style={{ width: `${Math.max(ch.rate, 2)}%` }}
                          />
                        </div>
                        <span
                          className={`text-xs font-medium w-10 text-right flex-shrink-0 ${rateTextColor(ch.rate)}`}
                        >
                          {ch.rate}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {isExpanded && chapters.length === 0 && (
                  <p className="mt-2 ml-4 text-xs text-muted-foreground">
                    챕터 데이터 없음
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
