'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [done, setDone] = useState(false);

  const total = dueCards.length;
  const currentCard = dueCards[currentIndex];

  function handleAnswer(correct: boolean) {
    if (!currentCard) return;

    answerCard(currentCard.id, correct);
    setResults((prev) => [
      ...prev,
      { cardId: currentCard.id, correct, fromBox: currentCard.box },
    ]);

    const next = currentIndex + 1;
    if (next >= total) {
      setDone(true);
    } else {
      setCurrentIndex(next);
      setFlipped(false);
    }
  }

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
            render={<Link href="/flashcards/add" />}
          >
            카드 추가하기
          </Button>
          <Button render={<Link href="/flashcards" />}>
            돌아가기
          </Button>
        </div>
      </main>
    );
  }

  if (done) {
    const correctCount = results.filter((r) => r.correct).length;
    const wrongCount = results.length - correctCount;
    const movedUp = results.filter((r) => r.correct && r.fromBox < 5).length;
    const movedDown = results.filter((r) => !r.correct && r.fromBox > 1).length;

    return (
      <main className="max-w-xl mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-bold">복습 완료!</h1>
        <p className="text-muted-foreground text-sm">총 {total}장을 복습했어요.</p>

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
            render={<Link href="/flashcards/add" />}
          >
            카드 추가하기
          </Button>
          <Button render={<Link href="/flashcards" />}>
            메인으로
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground font-medium">
          {currentIndex + 1} / {total}
        </span>
        <Badge variant="outline">박스 {currentCard.box}</Badge>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / total) * 100}%` }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="relative cursor-pointer select-none"
        onClick={() => !flipped && setFlipped(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && !flipped && setFlipped(true)}
        aria-label="카드를 클릭하여 답 확인"
      >
        <Card className="min-h-56 flex flex-col justify-center transition-all duration-200">
          <CardContent className="flex flex-col gap-4 py-8">
            {!flipped ? (
              <>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium text-center">
                  질문
                </p>
                <p className="text-center text-lg font-medium leading-relaxed">
                  {currentCard.question}
                </p>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  탭하여 답 확인
                </p>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium text-center">
                  답
                </p>
                <p className="text-center text-base leading-relaxed whitespace-pre-wrap">
                  {currentCard.answer}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Answer buttons - only shown when flipped */}
      {flipped && (
        <div className="grid grid-cols-2 gap-3">
          <Button
            size="lg"
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 h-14 text-base font-semibold"
            onClick={() => handleAnswer(false)}
          >
            틀렸어요
          </Button>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white h-14 text-base font-semibold"
            onClick={() => handleAnswer(true)}
          >
            맞았어요
          </Button>
        </div>
      )}

      {/* Session exit link */}
      <div className="text-center">
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/flashcards" />}
        >
          세션 종료
        </Button>
      </div>
    </main>
  );
}
