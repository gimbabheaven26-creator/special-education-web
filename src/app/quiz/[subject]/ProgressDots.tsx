'use client';

import type { AnswerRecord } from './QuizResultScreen';

// ─── Progress Dots ───────────────────────────────────────────────────────────

export function ProgressDots({
  total,
  currentIndex,
  answers,
}: {
  total: number;
  currentIndex: number;
  answers: ReadonlyArray<AnswerRecord>;
}) {
  const answeredMap = new Map(
    answers.map((a) => [a.questionIndex, a.isCorrect])
  );

  return (
    <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-1.5 max-h-16 sm:overflow-y-auto py-1">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === currentIndex;
        const result = answeredMap.get(i);

        let dotClass =
          'w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0';

        if (isCurrent) {
          dotClass += ' bg-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-background animate-pulse';
        } else if (result === true) {
          dotClass += ' bg-emerald-500';
        } else if (result === false) {
          dotClass += ' bg-red-500';
        } else {
          dotClass += ' bg-muted-foreground/30';
        }

        return <div key={i} className={dotClass} />;
      })}
    </div>
  );
}

// ─── XP Toast ────────────────────────────────────────────────────────────────

export function XPToast({ amount, visible }: { amount: number; visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <div className="rounded-full bg-purple-600 px-4 py-2 text-white font-bold text-sm shadow-lg">
        +{amount} XP
      </div>
    </div>
  );
}
