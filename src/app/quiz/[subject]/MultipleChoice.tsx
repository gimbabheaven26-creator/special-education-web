'use client';

import { useState, useEffect, useRef } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Timer } from 'lucide-react';
import { FeedbackSection } from './QuestionActions';

export function MultipleChoice({
  question,
  onAnswer,
  autoAdvanceCorrectMs,
  autoAdvanceWrongMs,
}: {
  question: QuizQuestion;
  onAnswer: (answer: number, isCorrect: boolean) => void;
  autoAdvanceCorrectMs?: number;
  autoAdvanceWrongMs?: number;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const correctAnswer = Number(question.answer);
  const isCorrect = submitted && selected !== null && selected === correctAnswer;

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    onAnswer(selected, selected === correctAnswer);
  };

  // 자동 이동 타이머 + 프로그레스 바
  useEffect(() => {
    if (!submitted || selected === null) return;
    const correct = selected === correctAnswer;
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
  }, [submitted, autoAdvanceCorrectMs, autoAdvanceWrongMs, selected, correctAnswer, onAnswer]);

  const hasAutoAdvance = autoAdvanceCorrectMs || autoAdvanceWrongMs;

  return (
    <div>
      <div className="space-y-3 mb-6">
        {question.options?.map((option, index) => {
          let className =
            'w-full text-left p-4 rounded-lg border border-border transition-colors cursor-pointer';
          if (submitted) {
            if (index === correctAnswer) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20';
            } else if (index === selected && index !== correctAnswer) {
              className += ' border-red-500 bg-red-50 dark:bg-red-950/20';
            } else {
              className += ' bg-muted/30';
            }
          } else if (selected === index) {
            className += ' border-primary bg-primary/10';
          } else {
            className += ' hover:bg-muted/50';
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => handleSelect(index)}
              disabled={submitted}
            >
              <span className="text-sm font-medium mr-2">{index + 1}.</span>
              <span className="text-sm">{option}</span>
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
            {isCorrect ? '정답입니다!' : `오답 (정답: ${correctAnswer + 1}번)`}
          </span>
        </div>
      )}
      {submitted && (
        <FeedbackSection
          question={question}
          isCorrect={isCorrect}
          selectedOptionIndex={selected !== null ? String(selected) : undefined}
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
