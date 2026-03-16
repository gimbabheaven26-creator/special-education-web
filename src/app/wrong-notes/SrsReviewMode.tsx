'use client';

import { useState, useMemo, useCallback } from 'react';
import { useLeitnerStore, type LeitnerCard } from '@/stores/useLeitnerStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';

const BOX_LABELS: Record<number, string> = {
  1: '1단계',
  2: '2단계',
  3: '3단계',
  4: '4단계',
  5: '마스터',
};

export default function SrsReviewMode() {
  const getDueCards = useLeitnerStore((s) => s.getDueCards);
  const answerCard = useLeitnerStore((s) => s.answerCard);
  const getStats = useLeitnerStore((s) => s.getStats);

  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionResults, setSessionResults] = useState<
    Array<{ cardId: string; correct: boolean }>
  >([]);
  const [sessionFinished, setSessionFinished] = useState(false);

  const dueCards = useMemo(() => getDueCards(), [getDueCards]);
  const stats = useMemo(() => getStats(), [getStats]);

  const remainingCards = useMemo(
    () => dueCards.filter((c) => !sessionResults.some((r) => r.cardId === c.id)),
    [dueCards, sessionResults],
  );

  const currentCard: LeitnerCard | undefined = remainingCards[0];

  const handleAnswer = useCallback(
    (correct: boolean) => {
      if (!currentCard) return;

      answerCard(currentCard.id, correct);
      const updated = [...sessionResults, { cardId: currentCard.id, correct }];
      setSessionResults(updated);
      setShowAnswer(false);

      if (updated.length >= dueCards.length) {
        setSessionFinished(true);
      }
    },
    [currentCard, answerCard, sessionResults, dueCards.length],
  );

  const handleRestart = () => {
    setShowAnswer(false);
    setSessionResults([]);
    setSessionFinished(false);
  };

  // No due cards
  if (dueCards.length === 0 && !sessionFinished) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="text-lg font-medium">오늘 복습할 카드가 없습니다</p>
        <p className="text-sm text-muted-foreground">
          전체 {stats.total}장 · 마스터 {stats.box5}장
        </p>
      </div>
    );
  }

  // Session complete
  if (sessionFinished) {
    const correctCount = sessionResults.filter((r) => r.correct).length;
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-green-500" />
        <p className="text-lg font-medium">복습 완료!</p>
        <p className="text-sm text-muted-foreground">
          {sessionResults.length}장 중 {correctCount}장 정답
        </p>
        <Button onClick={handleRestart} className="min-h-[44px]">
          <RotateCcw className="h-4 w-4 mr-2" />
          다시 복습
        </Button>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {sessionResults.length + 1} / {dueCards.length}
        </span>
        <Badge variant="outline">
          {BOX_LABELS[currentCard.box]}
        </Badge>
      </div>

      {/* Card */}
      <Card>
        <CardContent className="py-6 px-5 space-y-4">
          <div className="text-base font-medium leading-relaxed whitespace-pre-wrap">
            {currentCard.question}
          </div>

          {showAnswer ? (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-1">정답</p>
              <div className="text-base font-semibold text-primary whitespace-pre-wrap">
                {currentCard.answer}
              </div>
            </div>
          ) : (
            <Button
              onClick={() => setShowAnswer(true)}
              variant="outline"
              className="w-full min-h-[44px]"
            >
              정답 보기
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Answer buttons */}
      {showAnswer && (
        <div className="flex gap-3">
          <Button
            onClick={() => handleAnswer(false)}
            variant="outline"
            className="flex-1 min-h-[48px] text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950"
          >
            <XCircle className="h-4 w-4 mr-2" />
            틀림
          </Button>
          <Button
            onClick={() => handleAnswer(true)}
            className="flex-1 min-h-[48px] bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            맞음
          </Button>
        </div>
      )}
    </div>
  );
}
