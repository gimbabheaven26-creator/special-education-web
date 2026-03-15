'use client';

import { useState, useMemo } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { checkFillInAnswer } from '@/lib/answer-checker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle } from 'lucide-react';
import { FeedbackSection } from './QuestionActions';

/** 정답 문자열에서 여러 답을 분리한다. (쉼표, 세미콜론, | 등으로 구분) */
function splitAnswers(answer: string): string[] {
  // "30, 개별화교육지원팀" or "30 / 개별화교육지원팀" 등
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
}: {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const blanksCount = useMemo(() => countBlanks(question.question), [question.question]);
  const answerParts = useMemo(() => splitAnswers(String(question.answer)), [question.answer]);
  const isMultiBlank = blanksCount >= 2 && answerParts.length >= 2;

  const [inputs, setInputs] = useState<ReadonlyArray<string>>(() =>
    isMultiBlank ? answerParts.map(() => '') : ['']
  );
  const [submitted, setSubmitted] = useState(false);

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

  const handleNext = () => {
    const combinedAnswer = inputs.map((s) => s.trim()).join(', ');
    onAnswer(combinedAnswer, allCorrect);
  };

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

      <div className="flex gap-3">
        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={!inputs.some((v) => v.trim())}
            className="w-full min-h-[44px]"
          >
            제출
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full min-h-[44px]">
            다음 문제
          </Button>
        )}
      </div>
    </div>
  );
}
