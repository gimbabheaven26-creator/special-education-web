'use client';

import { useStudyStore } from '@/stores/useStudyStore';
import { useMounted } from '@/hooks/useMounted';

interface SubjectProgressProps {
  subjectSlug: string;
  totalFiles: number;
}

export function SubjectProgress({ subjectSlug, totalFiles }: SubjectProgressProps) {
  const mounted = useMounted();
  const completedChapters = useStudyStore((s) => s.completedChapters[subjectSlug]);

  if (!mounted) return null;

  const completedCount = completedChapters?.length ?? 0;
  if (completedCount === 0) return null;

  const pct = Math.round((completedCount / totalFiles) * 100);

  return (
    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium tabular-nums">
      {completedCount}/{totalFiles} ({pct}%)
    </span>
  );
}
