'use client';

import { useState } from 'react';
import type { WorksheetQuestion } from '@/lib/content/worksheet-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export type GradeResult = 'correct' | 'incorrect' | 'self-correct' | 'self-incorrect' | null;

// ─── Explanation Toggle ─────────────────────────────────────────────────────

function ExplanationToggle({
  explanation,
  defaultOpen,
}: {
  explanation: string;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline min-h-[44px]"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        해설 보기
      </button>
      {open && (
        <div className="mt-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">{explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Question Card ──────────────────────────────────────────────────────────

export interface QuestionSlideProps {
  question: WorksheetQuestion;
  index: number;
  total: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  isReview: boolean;
  grade: GradeResult;
  onSelfGrade: (correct: boolean) => void;
}

export function QuestionSlide({
  question,
  index,
  total,
  answer,
  onAnswerChange,
  isReview,
  grade,
  onSelfGrade,
}: QuestionSlideProps) {
  const isCorrect = grade === 'correct' || grade === 'self-correct';
  const isIncorrect = grade === 'incorrect' || grade === 'self-incorrect';

  const cardBorder = isReview
    ? isCorrect
      ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10'
      : isIncorrect
      ? 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/10'
      : 'border-border'
    : 'border-border';

  return (
    <Card className={`${cardBorder} transition-colors`}>
      <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
        {/* Question number badge */}
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold shrink-0">
            {index + 1}
          </span>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm text-muted-foreground">
              {index + 1} / {total}
            </span>
            <Badge variant="outline" className="text-xs">
              {question.type === 'fill_in' ? '기입형 (2점)' : '서술형 (4점)'}
            </Badge>
          </div>
          {isReview && isCorrect && (
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
          )}
          {isReview && isIncorrect && (
            <XCircle className="h-5 w-5 text-red-500 shrink-0" />
          )}
        </div>

        {/* Question text */}
        <div className="text-base leading-relaxed text-foreground whitespace-pre-wrap mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
          {question.question}
        </div>

        {/* Answer input */}
        {!isReview && (
          <div className="border-l-4 border-primary/30 pl-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              {question.type === 'fill_in' ? '답안 입력' : '서술형 답안'}
            </p>
            {question.type === 'fill_in' ? (
              <Input
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="정답을 입력하세요"
                aria-label={`${index + 1}번 문제 답안`}
                className="max-w-full sm:max-w-md h-12"
                autoFocus
              />
            ) : (
              <textarea
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="서술형 답안을 작성하세요"
                aria-label={`${index + 1}번 문제 서술형 답안`}
                rows={4}
                className="w-full rounded-lg border border-input bg-transparent px-3 py-3 text-base sm:text-sm transition-colors outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50"
              />
            )}
          </div>
        )}

        {/* Review: show user answer + grading */}
        {isReview && (
          <div className="space-y-3">
            {/* User's answer */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs font-medium text-muted-foreground mb-1">내 답안</p>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {answer || '(미작성)'}
              </p>
            </div>

            {/* Fill-in: wrong answer -> show correct */}
            {question.type === 'fill_in' && isIncorrect && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm">
                  <span className="font-medium text-amber-800 dark:text-amber-300">정답: </span>
                  <span className="text-amber-700 dark:text-amber-400">{question.answer}</span>
                </p>
              </div>
            )}

            {/* Descriptive: show model answer + self grading */}
            {question.type === 'descriptive' && (
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">모범답안</p>
                <p className="text-sm text-blue-700 dark:text-blue-400 whitespace-pre-wrap">
                  {question.answer}
                </p>
                {grade === null && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 min-h-[44px]"
                      onClick={() => onSelfGrade(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      맞음
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 min-h-[44px]"
                      onClick={() => onSelfGrade(false)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      틀림
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Explanation */}
            {question.explanation && grade !== null && (
              <ExplanationToggle explanation={question.explanation} defaultOpen={isIncorrect} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
