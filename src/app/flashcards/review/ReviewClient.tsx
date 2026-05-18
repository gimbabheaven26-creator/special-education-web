'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import type { AnswerGrade } from '@/stores/useLeitnerStore';
import { useMounted } from '@/hooks/useMounted';
import { buttonVariants } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { FlashcardScene } from '@/components/flashcard/FlashcardScene';
import { buildFlashcardContextActions } from '../context-actions';

interface SessionResult {
  cardId: string;
  grade: AnswerGrade;
  fromBox: number;
}

export default function ReviewClient() {
  const mounted = useMounted();
  const getDueCards = useLeitnerStore((s) => s.getDueCards);
  const answerCard = useLeitnerStore((s) => s.answerCard);
  const totalCards = useLeitnerStore((s) => s.cards.length);

  // Snapshot of due cards at session start
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dueCards = useMemo(() => getDueCards(), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [done, setDone] = useState(false);

  const total = dueCards.length;
  const currentCard = dueCards[currentIndex];

  const handleAnswer = useCallback(
    (grade: AnswerGrade) => {
      if (!currentCard) return;

      answerCard(currentCard.id, grade);

      const newResult: SessionResult = {
        cardId: currentCard.id,
        grade,
        fromBox: currentCard.box,
      };

      setResults((prev) => [...prev, newResult]);

      const next = currentIndex + 1;
      if (next >= total) {
        setDone(true);
      } else {
        setCurrentIndex(next);
      }
    },
    [currentCard, answerCard, currentIndex, total]
  );

  // Hydration guard — persist store is empty during SSR
  if (!mounted) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16">
        <div className="h-48 rounded-2xl bg-muted animate-pulse" />
      </main>
    );
  }

  // Empty state — no cards at all
  if (totalCards === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16">
        <EmptyState
          icon="🃏"
          title="플래시카드가 아직 없어요"
          description="나만의 플래시카드를 만들어 간격반복으로 효율적으로 암기하세요. 용어, 법령, 핵심 개념 등 시험에 자주 나오는 내용을 카드로 정리해보세요."
          action={{ label: '첫 카드 만들기', href: '/flashcards/add', ariaLabel: '플래시카드 추가 페이지로 이동' }}
        />
      </main>
    );
  }

  // Empty state — cards exist but none due today
  if (total === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <span className="text-5xl" aria-hidden="true">🎉</span>
        <h1 className="text-xl font-bold">오늘 복습 완료!</h1>
        <p className="text-muted-foreground text-sm max-w-sm">
          오늘 복습할 카드를 모두 마쳤어요. 내일 새로운 카드가 준비됩니다.
          새 카드를 추가하면 바로 복습할 수 있어요.
        </p>
        <div className="flex gap-3">
          <Link
            href="/flashcards/add"
            className={buttonVariants({ variant: 'outline', className: 'min-h-[44px]' })}
          >
            카드 추가하기
          </Link>
          <Link href="/" className={buttonVariants({ className: 'min-h-[44px]' })}>
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  // Session results screen
  if (done) {
    const knewCount = results.filter((r) => r.grade === 'knew').length;
    const hintCount = results.filter((r) => r.grade === 'hint').length;
    const forgotCount = results.filter((r) => r.grade === 'forgot').length;
    const movedUp = results.filter((r) => r.grade === 'knew' && r.fromBox < 5).length;
    const stayed = results.filter((r) => r.grade === 'hint').length;
    const movedDown = results.filter((r) => r.grade === 'forgot' && r.fromBox > 1).length;

    const dotColor = (grade: AnswerGrade) =>
      grade === 'knew' ? 'bg-emerald-500' : grade === 'hint' ? 'bg-amber-500' : 'bg-red-500';

    return (
      <main className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-bold">복습 완료!</h1>
        <p className="text-muted-foreground text-sm">총 {total}장을 복습했어요.</p>

        {/* Progress dots summary */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {results.map((r, i) => (
            <span
              key={i}
              className={`inline-block w-3 h-3 rounded-full ${dotColor(r.grade)}`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 w-full max-w-sm">
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-green-700 dark:text-green-400">
              {knewCount}
            </span>
            <span className="text-xs text-green-600 dark:text-green-400">바로 앎</span>
          </div>
          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">
              {hintCount}
            </span>
            <span className="text-xs text-amber-600 dark:text-amber-400">힌트 후 앎</span>
          </div>
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-red-700 dark:text-red-400">
              {forgotCount}
            </span>
            <span className="text-xs text-red-600 dark:text-red-400">모름</span>
          </div>
        </div>

        {(movedUp > 0 || stayed > 0 || movedDown > 0) && (
          <div className="text-sm text-muted-foreground space-y-1">
            {movedUp > 0 && <p>↑ {movedUp}장이 다음 박스로 승격했어요</p>}
            {stayed > 0 && <p>→ {stayed}장이 현재 박스에서 한 번 더 복습해요</p>}
            {movedDown > 0 && <p>↓ {movedDown}장이 박스 1로 돌아갔어요</p>}
          </div>
        )}

        <div className="flex gap-3 flex-wrap justify-center">
          <Link
            href="/flashcards/add"
            className={buttonVariants({ variant: 'outline', className: 'min-h-[44px]' })}
          >
            카드 추가하기
          </Link>
          <Link href="/flashcards" className={buttonVariants({ className: 'min-h-[44px]' })}>
            메인으로
          </Link>
        </div>
      </main>
    );
  }

  // Active review screen
  return (
    <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-4">
      <FlashcardScene
        card={currentCard}
        onAnswer={handleAnswer}
        currentIndex={currentIndex}
        total={total}
        results={results}
      />

      {buildFlashcardContextActions(currentCard).length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">출처 복습</p>
          <div className="flex flex-wrap gap-2">
            {buildFlashcardContextActions(currentCard).map((action) => (
              <Link
                key={action.kind}
                href={action.href}
                className="inline-flex min-h-[36px] items-center rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary"
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Session exit link */}
      <div className="text-center mt-2">
        <Link
          href="/flashcards"
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'min-h-[44px]' })}
        >
          세션 종료
        </Link>
      </div>
    </main>
  );
}
