'use client';

import Link from 'next/link';
import { RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useMounted } from '@/hooks/useMounted';

export function DailyReviewCard() {
  const mounted = useMounted();
  const leitnerGetStats = useLeitnerStore((s) => s.getStats);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);

  if (!mounted) {
    return <div className="h-24 rounded-2xl bg-muted animate-pulse" />;
  }

  const stats = leitnerGetStats();
  const dueCount = stats.dueToday;
  const totalCards = stats.total;
  const wrongCount = wrongNotes.filter((n) => !n.mastered).length;
  const totalTodo = dueCount + wrongCount;
  const hasAnyData = totalCards > 0 || wrongNotes.length > 0;

  // 데이터가 없는 신규 사용자 — 복습 완료와 구분
  if (!hasAnyData) {
    return null;
  }

  // 진짜 완료 상태
  if (totalTodo === 0) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
        <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">오늘 복습 완료!</p>
          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 mt-0.5">내일 간격 반복 스케줄이 기다려요</p>
        </div>
      </div>
    );
  }

  const reviewHref = dueCount > 0 ? '/flashcards/review' : '/wrong-notes';

  return (
    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">오늘 처리할 복습</p>
          <p className="text-2xl font-bold text-primary tabular-nums">{totalTodo}개</p>
        </div>
        <div className="text-right text-xs text-muted-foreground space-y-1">
          {dueCount > 0 && <p>플래시카드 {dueCount}개</p>}
          {wrongCount > 0 && <p>미처리 오답 {wrongCount}개</p>}
        </div>
      </div>
      <Link href={reviewHref} className="block">
        <Button className="w-full gap-2" size="sm">
          <RefreshCw className="h-4 w-4" />
          지금 복습하기
        </Button>
      </Link>
    </div>
  );
}
