'use client';

import Link from 'next/link';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { WrongNoteSummaryData } from '@/lib/stats-utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WrongNoteSummaryProps {
  readonly summary: WrongNoteSummaryData;
}

export default function WrongNoteSummary({ summary }: WrongNoteSummaryProps) {
  if (summary.total === 0) return null;

  const top3 = summary.bySubject.filter((s) => s.unmastered > 0).slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">오답 요약</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resolution stats */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{summary.unmastered}</span>
              <span className="text-xs text-muted-foreground">미해결</span>
            </div>
            <div className="text-muted-foreground">/</div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {summary.mastered}
              </span>
              <span className="text-xs text-muted-foreground">해결</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-lg font-semibold">
              {summary.resolutionRate}%
            </span>
            <span className="text-xs text-muted-foreground">해결률</span>
          </div>
        </div>

        {/* Resolution progress bar */}
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${summary.resolutionRate}%` }}
          />
        </div>

        {/* Top unresolved subjects */}
        {top3.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground font-medium">
              미해결 오답이 많은 과목
            </p>
            {top3.map((s) => (
              <div
                key={s.subject}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {s.unmastered >= 5 ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                  ) : (
                    <CheckCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="truncate">{s.subject}</span>
                </div>
                <span className="text-muted-foreground flex-shrink-0">
                  {s.unmastered}개 남음
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action links */}
        <div className="flex gap-3 pt-1">
          <Link
            href="/wrong-notes"
            className="text-xs text-primary hover:underline"
          >
            오답 노트 보기
          </Link>
          <Link
            href="/wrong-notes/quiz"
            className="text-xs text-primary hover:underline"
          >
            오답 재시험
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
