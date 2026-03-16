'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import type { ScoringResult } from '@/lib/descriptive-scoring';

interface ScoringGuideProps {
  readonly result: ScoringResult;
}

export default function ScoringGuide({ result }: ScoringGuideProps) {
  const coveragePct = Math.round(result.coverage * 100);
  const barColor = coveragePct >= 80
    ? 'bg-green-500'
    : coveragePct >= 50
      ? 'bg-amber-500'
      : 'bg-red-500';

  const hasLegal = result.legalCitations.expected.length > 0;

  return (
    <div className="rounded-lg border border-purple-300 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-950/20 space-y-3">
      <p className="text-xs font-semibold text-purple-700 dark:text-purple-400">
        채점 가이드 (키워드 분석)
      </p>

      {/* Coverage bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">키워드 커버리지</span>
          <span className="font-medium">{coveragePct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${coveragePct}%` }}
          />
        </div>
      </div>

      {/* Keywords */}
      <div className="space-y-1.5">
        <p className="text-xs text-muted-foreground">핵심 키워드</p>
        <div className="flex flex-wrap gap-1.5">
          {result.keywords.map((kw) => {
            const isMatched = result.matched.includes(kw);
            return (
              <Badge
                key={kw}
                variant={isMatched ? 'default' : 'outline'}
                className={`text-xs ${
                  isMatched
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0'
                    : 'text-red-600 border-red-300 dark:text-red-400 dark:border-red-700'
                }`}
              >
                {isMatched ? '✓ ' : '✗ '}{kw}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Legal citations */}
      {hasLegal && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">법령 인용 확인</p>
          <div className="flex flex-wrap gap-1.5">
            {result.legalCitations.expected.map((cite) => {
              const found = result.legalCitations.found.includes(cite);
              return (
                <Badge
                  key={cite}
                  variant="outline"
                  className={`text-xs ${
                    found
                      ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300'
                      : 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400'
                  }`}
                >
                  {found ? '📜 ' : '❌ '}{cite}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Suggestion */}
      <p className="text-xs text-purple-700 dark:text-purple-300 leading-relaxed">
        {result.suggestion}
      </p>
    </div>
  );
}
