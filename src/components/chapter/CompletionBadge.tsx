'use client';

import { CheckCircle } from 'lucide-react';
import { useStudyStore } from '@/stores/useStudyStore';
import { useMounted } from '@/hooks/useMounted';

interface CompletionBadgeProps {
  subjectSlug: string;
  chapterSlug: string;
}

export function CompletionBadge({ subjectSlug, chapterSlug }: CompletionBadgeProps) {
  const mounted = useMounted();
  const isCompleted = useStudyStore((s) => s.isChapterCompleted)(subjectSlug, chapterSlug);

  if (!mounted || !isCompleted) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium" aria-label="학습 완료">
      <CheckCircle className="h-3 w-3" />
      완료
    </span>
  );
}
