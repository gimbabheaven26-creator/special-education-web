'use client';

import { useState, useEffect, useRef } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Timer } from 'lucide-react';
import { normalizeOXAnswer } from '@/lib/quiz';
import { FeedbackSection } from './QuestionActions';

export function OXChoice({
  question,
  onAnswer,
  autoAdvanceCorrectMs,
  autoAdvanceWrongMs,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
  autoAdvanceCorrectMs?: number;
  autoAdvanceWrongMs?: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const normalizedAnswer = normalizeOXAnswer(question.answer);
  const isCorrect = submitted && selected === normalizedAnswer;

  const handleSelect = (choice: string) => {
    if (submitted) return;
    setSelected(choice);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (!selected) return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    onAnswer(selected, selected === normalizedAnswer);
  };

  // 자동 이동 타이머 + 프로그레스 바
  useEffect(() => {
    if (!submitted || !selected) return;
    const correct = selected === normalizedAnswer;
    const delayMs = correct ? autoAdvanceCorrectMs : autoAdvanceWrongMs;
    if (!delayMs) return;

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / delayMs) * 100, 100));
    }, 50);

    autoTimerRef.current = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      onAnswer(selected, correct);
    }, delayMs);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [submitted, autoAdvanceCorrectMs, autoAdvanceWrongMs, selected, normalizedAnswer, onAnswer]);

  const hasAutoAdvance = autoAdvanceCorrectMs || autoAdvanceWrongMs;

  return (
    <div>
      <div className="flex gap-4 mb-6">
        {['O', 'X'].map((choice) => {
          let className =
            'flex-1 h-20 text-3xl font-bold rounded-xl border border-border transition-colors cursor-pointer';
          if (submitted) {
            if (choice === normalizedAnswer) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20 text-green-600';
            } else if (choice === selected && choice !== normalizedAnswer) {
              className += ' border-red-500 bg-red-50 dark:bg-red-950/20 text-red-600';
            } else {
              className += ' bg-muted/30 text-muted-foreground';
            }
          } else if (selected === choice) {
            className += ' border-primary bg-primary/10 text-primary';
          } else {
            className += ' hover:bg-muted/50';
          }

          return (
            <button
              key={choice}
              className={className}
              onClick={() => handleSelect(choice)}
              disabled={submitted}
            >
              {choice}
            </button>
          );
        })}
      </div>
      {submitted && (
        <div className="mb-2 flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {isCorrect ? '정답입니다!' : `오답 (정답: ${normalizedAnswer})`}
          </span>
        </div>
      )}
      {submitted && (
        <FeedbackSection
          question={question}
          isCorrect={isCorrect}
          selectedOptionIndex={selected === 'O' ? '0' : '1'}
        />
      )}
      {submitted && hasAutoAdvance && (
        <button
          onClick={handleNext}
          className="w-full mt-3 rounded-lg overflow-hidden bg-muted/30 h-8 relative cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div
            className={`absolute inset-y-0 left-0 transition-none ${isCorrect ? 'bg-green-500/30' : 'bg-amber-500/30'}`}
            style={{ width: `${progress}%` }}
          />
          <div className="relative flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Timer className="h-3.5 w-3.5" />
            <span>다음 문제로 이동 중... (탭하여 건너뛰기)</span>
          </div>
        </button>
      )}
      {submitted && !hasAutoAdvance && (
        <div className="flex gap-3">
          <Button onClick={handleNext} className="w-full min-h-[44px]">
            다음
          </Button>
        </div>
      )}
    </div>
  );
}
