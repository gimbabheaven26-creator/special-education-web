'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { checkFillInAnswer } from '@/lib/quiz/answer-checker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Timer } from 'lucide-react';
import { FeedbackSection } from './QuestionActions';

/** 정답 문자열에서 여러 답을 분리한다. (쉼표, 세미콜론, | 등으로 구분) */
function splitAnswers(answer: string): string[] {
  const delimiters = /[,;|/]\s*/;
  const parts = answer.split(delimiters).map((s) => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [answer];
}

/** 문제 텍스트에서 ( ) 빈칸 수를 센다 */
function countBlanks(question: string): number {
  const matches = question.match(/\(\s*\)/g);
  return matches ? matches.length : 0;
}

export function FillInChoice({
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
  const blanksCount = useMemo(() => countBlanks(question.question), [question.question]);
  const answerParts = useMemo(() => splitAnswers(String(question.answer)), [question.answer]);
  const isMultiBlank = blanksCount >= 2 && answerParts.length >= 2;

  const [inputs, setInputs] = useState<ReadonlyArray<string>>(() =>
    isMultiBlank ? answerParts.map(() => '') : ['']
  );
  const [submitted, setSubmitted] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const results = useMemo(() => {
    if (!submitted) return null;
    if (isMultiBlank) {
      return inputs.map((input, i) =>
        checkFillInAnswer(input, answerParts[i] ?? '')
      );
    }
    return [checkFillInAnswer(inputs[0], String(question.answer))];
  }, [submitted, inputs, isMultiBlank, answerParts, question.answer]);

  const allCorrect = results?.every(Boolean) ?? false;

  const handleInputChange = (index: number, value: string) => {
    setInputs((prev) => prev.map((v, i) => (i === index ? value : v)));
  };

  const handleSubmit = () => {
    const hasInput = inputs.some((v) => v.trim().length > 0);
    if (!hasInput) return;
    setSubmitted(true);
  };

  const handleNext = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
    const combinedAnswer = inputs.map((s) => s.trim()).join(', ');
    onAnswer(combinedAnswer, allCorrect);
  }, [inputs, allCorrect, onAnswer]);

  // 자동 이동 타이머 + 프로그레스 바
  useEffect(() => {
    if (!submitted) return;
    const delayMs = allCorrect ? autoAdvanceCorrectMs : autoAdvanceWrongMs;
    if (!delayMs) return;

    const startTime = Date.now();
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / delayMs) * 100, 100));
    }, 50);

    autoTimerRef.current = setTimeout(() => {
      if (progressRef.current) clearInterval(progressRef.current);
      handleNext();
    }, delayMs);

    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [submitted, autoAdvanceCorrectMs, autoAdvanceWrongMs, allCorrect, handleNext]);

  const hasAutoAdvance = autoAdvanceCorrectMs || autoAdvanceWrongMs;

  return (
    <div>
      <div className="mb-6 space-y-3">
        {isMultiBlank ? (
          inputs.map((input, i) => (
            <div key={i}>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                빈칸 {i + 1}
              </label>
              <Input
                value={input}
                onChange={(e) => handleInputChange(i, e.target.value)}
                onKeyDown={(e) =>
                  !submitted && e.key === 'Enter' && handleSubmit()
                }
                placeholder={`${i + 1}번째 답을 입력하세요`}
                disabled={submitted}
                className={`h-12 ${
                  submitted
                    ? results?.[i]
                      ? 'border-green-500'
                      : 'border-red-500'
                    : ''
                }`}
              />
              {submitted && !results?.[i] && (
                <p className="text-xs text-red-600 mt-1">
                  정답: {answerParts[i]}
                </p>
              )}
            </div>
          ))
        ) : (
          <Input
            value={inputs[0]}
            onChange={(e) => handleInputChange(0, e.target.value)}
            onKeyDown={(e) =>
              !submitted && e.key === 'Enter' && handleSubmit()
            }
            placeholder="정답을 입력하세요"
            disabled={submitted}
            className={`h-12 ${
              submitted
                ? allCorrect
                  ? 'border-green-500'
                  : 'border-red-500'
                : ''
            }`}
          />
        )}
      </div>

      {submitted && (
        <div className="mb-2 flex items-center gap-2">
          {allCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {allCorrect
              ? '정답입니다!'
              : isMultiBlank
                ? `${results?.filter(Boolean).length}/${results?.length} 정답`
                : `오답 (정답: ${String(question.answer)})`}
          </span>
        </div>
      )}

      {submitted && (
        <FeedbackSection question={question} isCorrect={allCorrect} />
      )}

      {submitted && hasAutoAdvance && (
        <button
          onClick={handleNext}
          className="w-full mt-3 rounded-lg overflow-hidden bg-muted/30 h-8 relative cursor-pointer hover:bg-muted/50 transition-colors"
        >
          <div
            className={`absolute inset-y-0 left-0 transition-none ${allCorrect ? 'bg-green-500/30' : 'bg-amber-500/30'}`}
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
            다음 문제
          </Button>
        </div>
      )}
      {!submitted && (
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!inputs.some((v) => v.trim())}
            className="w-full min-h-[44px]"
          >
            제출
          </Button>
        </div>
      )}
    </div>
  );
}
