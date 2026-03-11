'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { Button } from '@/components/ui/button';
import { FlashcardScene } from '@/components/flashcard/FlashcardScene';

interface SessionResult {
  cardId: string;
  correct: boolean;
  fromBox: number;
}

export default function ReviewPage() {
  const getDueCards = useLeitnerStore((s) => s.getDueCards);
  const answerCard = useLeitnerStore((s) => s.answerCard);

  // Snapshot of due cards at session start
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dueCards = useMemo(() => getDueCards(), []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [done, setDone] = useState(false);

  const total = dueCards.length;
  const currentCard = dueCards[currentIndex];

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return;

      answerCard(currentCard.id, correct);

      const newResult: SessionResult = {
        cardId: currentCard.id,
        correct,
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

  // Empty state
  if (total === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <h1 className="text-xl font-bold">오늘 복습할 카드가 없어요</h1>
        <p className="text-muted-foreground text-sm">
          새 카드를 추가하거나 내일 다시 오세요.
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="min-h-[44px]"
            render={<Link href="/flashcards/add" />}
          >
            카드 추가하기
          </Button>
          <Button className="min-h-[44px]" render={<Link href="/flashcards" />}>
            돌아가기
          </Button>
        </div>
      </main>
    );
  }

  // Session results screen
  if (done) {
    const correctCount = results.filter((r) => r.correct).length;
    const wrongCount = results.length - correctCount;
    const movedUp = results.filter((r) => r.correct && r.fromBox < 5).length;
    const movedDown = results.filter((r) => !r.correct && r.fromBox > 1).length;

    return (
      <main className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-bold">복습 완료!</h1>
        <p className="text-muted-foreground text-sm">총 {total}장을 복습했어요.</p>

        {/* Progress dots summary */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {results.map((r, i) => (
            <span
              key={i}
              className={`inline-block w-3 h-3 rounded-full ${
                r.correct ? 'bg-emerald-500' : 'bg-red-500'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-green-700 dark:text-green-400">
              {correctCount}
            </span>
            <span className="text-xs text-green-600 dark:text-green-400">맞았어요</span>
          </div>
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 flex flex-col items-center gap-1">
            <span className="text-3xl font-bold text-red-700 dark:text-red-400">
              {wrongCount}
            </span>
            <span className="text-xs text-red-600 dark:text-red-400">틀렸어요</span>
          </div>
        </div>

        {(movedUp > 0 || movedDown > 0) && (
          <div className="text-sm text-muted-foreground space-y-1">
            {movedUp > 0 && <p>{movedUp}장이 다음 박스로 이동했어요</p>}
            {movedDown > 0 && <p>{movedDown}장이 박스 1로 돌아갔어요</p>}
          </div>
        )}

        <div className="flex gap-3 flex-wrap justify-center">
          <Button
            variant="outline"
            className="min-h-[44px]"
            render={<Link href="/flashcards/add" />}
          >
            카드 추가하기
          </Button>
          <Button className="min-h-[44px]" render={<Link href="/flashcards" />}>
            메인으로
          </Button>
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

      {/* Session exit link */}
      <div className="text-center mt-2">
        <Button
          variant="ghost"
          size="sm"
          className="min-h-[44px]"
          render={<Link href="/flashcards" />}
        >
          세션 종료
        </Button>
      </div>
    </main>
  );
}
