'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useLeitnerStore, type LeitnerCard } from '@/stores/useLeitnerStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { createScoreTiers, getScoreTier } from '@/lib/study/score-tiers';

const BOX_LABELS: Record<number, string> = {
  1: '1단계',
  2: '2단계',
  3: '3단계',
  4: '4단계',
  5: '마스터',
};

const SRS_RESULT_TIERS = createScoreTiers([
  '모든 카드를 완벽하게 기억하고 있어요! 내일도 꾸준히!',
  '거의 완벽한 복습이었어요! 내일도 꾸준히!',
  '잘하고 있어요! 틀린 카드는 내일 다시 나와요.',
  '조금씩 자라고 있어요. 매일 하면 금방 올라요!',
  '괜찮아요! 반복할수록 기억에 남아요.',
  '복습을 시작한 것 자체가 한 걸음이에요. 매일 조금씩!',
]);

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

      answerCard(currentCard.id, correct ? 'knew' : 'forgot');
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
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <p className="text-lg font-medium">오늘 복습할 카드가 없어요</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {stats.total === 0
              ? '오답 노트에서 플래시카드로 저장하면 간격 반복이 시작돼요.'
              : '내일 다시 와서 복습해보세요!'}
          </p>
        </div>

        {/* Leitner 박스 분포 */}
        {stats.total > 0 && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <p className="text-sm font-semibold">단계별 카드 분포</p>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((box) => {
                const count = stats[`box${box}` as keyof typeof stats] as number;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={box} className="text-center space-y-1">
                    <div className="text-xs text-muted-foreground">{BOX_LABELS[box]}</div>
                    <div className="relative h-16 rounded bg-muted overflow-hidden flex items-end justify-center">
                      <div
                        className={`w-full rounded transition-all ${box === 5 ? 'bg-green-500' : 'bg-primary/60'}`}
                        style={{ height: `${Math.max(pct, count > 0 ? 10 : 0)}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium">{count}</div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              전체 {stats.total}장 · 마스터 {stats.box5}장
            </p>
          </div>
        )}

        {stats.total === 0 && (
          <div className="flex justify-center">
            <Button
              render={<Link href="/wrong-notes" />}
              variant="outline"
              className="min-h-[44px]"
            >
              오답 노트에서 카드 추가하기
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Session complete
  if (sessionFinished) {
    const correctCount = sessionResults.filter((r) => r.correct).length;
    const rate = sessionResults.length > 0 ? Math.round((correctCount / sessionResults.length) * 100) : 0;
    const tier = getScoreTier(rate, SRS_RESULT_TIERS);

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="text-5xl" aria-hidden="true">{tier?.emoji ?? '✅'}</div>
        <p className="text-lg font-semibold">복습 완료!</p>
        <p className="text-sm text-muted-foreground">
          {sessionResults.length}장 중 <span className="font-semibold text-foreground">{correctCount}장</span> 정답 ({rate}%)
        </p>
        {tier && (
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            {tier.message}
          </p>
        )}
        <div className="flex gap-3 pt-2">
          <Button onClick={handleRestart} variant="outline" className="min-h-[44px]">
            <RotateCcw className="h-4 w-4 mr-2" />
            다시 복습
          </Button>
          <Button
            render={<Link href="/wrong-notes" />}
            className="min-h-[44px]"
          >
            오답 노트로
          </Button>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {sessionResults.length + 1} / {dueCards.length}
          </span>
          <Badge variant="outline">
            {BOX_LABELS[currentCard.box]}
          </Badge>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${Math.round((sessionResults.length / dueCards.length) * 100)}%` }}
          />
        </div>
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
            aria-label="틀렸어요 — 1단계로 돌아감"
          >
            <XCircle className="h-4 w-4 mr-2" />
            틀림
          </Button>
          <Button
            onClick={() => handleAnswer(true)}
            className="flex-1 min-h-[48px] bg-green-600 hover:bg-green-700 text-white"
            aria-label="맞았어요 — 다음 단계로 승급"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            맞음
          </Button>
        </div>
      )}
    </div>
  );
}
