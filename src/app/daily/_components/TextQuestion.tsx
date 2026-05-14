'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DailyQuestion } from '@/types/daily';
import { getConceptUrl } from '@/lib/content/concept-urls';
import { getChapterDisplayName } from '@/lib/study/display-labels';

export function TextQuestion({
  question,
  index,
  revealed,
  type,
}: {
  question: DailyQuestion;
  index: number;
  revealed: boolean;
  type: 'fill_in' | 'descriptive';
}) {
  const [userAnswer, setUserAnswer] = useState('');

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-2">
      <Link
        href={getConceptUrl(question.subject)}
        className="inline-block text-xs text-muted-foreground hover:text-primary hover:underline transition-colors"
      >
        {getChapterDisplayName(question.chapter)}
      </Link>
      <p className="text-sm text-foreground leading-relaxed">
        <span className="font-medium text-muted-foreground mr-1">{index}.</span>
        {question.question}
      </p>

      {type === 'descriptive' ? (
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={revealed}
          placeholder="답을 작성해보세요..."
          rows={3}
          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background resize-none focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:bg-muted/50 transition-colors"
        />
      ) : (
        <input
          type="text"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={revealed}
          placeholder="답을 입력해보세요..."
          className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:bg-muted/50 transition-colors"
        />
      )}

      {revealed && (
        <div className="pt-2 border-t border-border/60 space-y-2">
          {userAnswer.trim() && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">내 답안</p>
              <p className="text-sm text-foreground/70 leading-relaxed">{userAnswer}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">정답</p>
            <p className="text-sm text-foreground leading-relaxed">{question.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
}
