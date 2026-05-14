'use client';

import Link from 'next/link';
import type { DailyQuestion } from '@/types/daily';
import { getConceptUrl } from '@/lib/content/concept-urls';
import { getChapterDisplayName } from '@/lib/study/display-labels';

export function OXQuestion({
  question,
  index,
  userAnswer,
  onAnswer,
  revealed,
  correctAnswer,
}: {
  question: DailyQuestion;
  index: number;
  userAnswer: 'O' | 'X' | null;
  onAnswer: (id: string, answer: 'O' | 'X') => void;
  revealed: boolean;
  correctAnswer: string;
}) {
  const isCorrect = revealed && userAnswer !== null && userAnswer === correctAnswer.toUpperCase();

  return (
    <div className={`p-4 rounded-xl border transition-colors ${
      revealed
        ? isCorrect ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-red-400/50 bg-red-50/50 dark:bg-red-950/20'
        : 'border-border bg-card'
    }`}>
      <Link
        href={getConceptUrl(question.subject)}
        className="inline-block text-xs text-muted-foreground hover:text-primary hover:underline mb-1.5 transition-colors"
      >
        {getChapterDisplayName(question.chapter)}
      </Link>
      <p className="text-sm text-foreground leading-relaxed mb-3">
        <span className="font-medium text-muted-foreground mr-1">{index}.</span>
        {question.question}
      </p>
      <div className="flex gap-2">
        {(['O', 'X'] as const).map((opt) => (
          <button
            key={opt}
            disabled={revealed}
            onClick={() => onAnswer(question.id, opt)}
            className={`flex-1 py-2 rounded-lg text-lg font-bold border transition-colors ${
              userAnswer === opt
                ? revealed
                  ? isCorrect ? 'border-green-500 bg-green-500 text-white' : 'border-red-400 bg-red-400 text-white'
                  : 'border-primary bg-primary text-primary-foreground'
                : revealed && opt === correctAnswer.toUpperCase()
                ? 'border-green-500 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                : 'border-border bg-background hover:bg-muted text-foreground'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {revealed && (
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          정답: <span className="font-medium text-foreground">{correctAnswer.toUpperCase()}</span>
          {question.explanation ? ` — ${question.explanation}` : ''}
        </p>
      )}
    </div>
  );
}
