'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useMounted } from '@/hooks/useMounted';
import { useMyPageData } from './useMyPageData';

export function SmartRecommendations() {
  const mounted = useMounted();
  const { recommendations } = useMyPageData();

  if (!mounted) {
    return <div className="h-16 rounded-xl bg-muted/30 animate-pulse" />;
  }

  if (recommendations.length === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
        <span className="text-lg" aria-hidden="true">🎉</span>
        <p className="text-sm font-medium text-green-700 dark:text-green-300">
          오늘 할 일을 모두 완료했어요!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">추천 액션</h2>
      <div className="space-y-2">
        {recommendations.map((rec) => (
          <Link
            key={rec.type}
            href={rec.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
          >
            <span className="text-base shrink-0" aria-hidden="true">{rec.emoji}</span>
            <span className="text-sm font-medium text-foreground flex-1">{rec.label}</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  );
}
