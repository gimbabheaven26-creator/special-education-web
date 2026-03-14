'use client';

import { useState } from 'react';
import type { QuizQuestion, SubQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

// ─── SubQuestionInput ─────────────────────────────────────────────────────────

function SubQuestionInput({
  subQ,
  index,
  disabled,
  value,
  onChange,
}: {
  subQ: SubQuestion;
  index: number;
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm font-medium mb-2">
        <span className="text-primary font-semibold">{index + 1})</span> {subQ.question}
      </p>
      {subQ.type === 'fill_in' ? (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="답을 입력하세요"
          disabled={disabled}
          className="h-10"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="답안을 작성하세요..."
          disabled={disabled}
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60 resize-y"
        />
      )}
    </div>
  );
}

// ─── SubQuestionResult ────────────────────────────────────────────────────────

function SubQuestionResult({
  subQ,
  index,
  userAnswer,
  graded,
  onGrade,
}: {
  subQ: SubQuestion;
  index: number;
  userAnswer: string;
  graded: boolean | null;
  onGrade: (correct: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-3">
      <p className="text-sm font-medium">
        <span className="text-primary font-semibold">{index + 1})</span> {subQ.question}
      </p>

      <div className="rounded-md bg-muted/50 p-3">
        <p className="text-xs text-muted-foreground mb-1">내 답안</p>
        <p className="text-sm whitespace-pre-wrap">{userAnswer || '(미작성)'}</p>
      </div>

      <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 dark:border-emerald-700 dark:bg-emerald-950/20">
        <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">모범답안</p>
        <p className="text-sm text-emerald-900 dark:text-emerald-200 whitespace-pre-wrap">{subQ.answer}</p>
      </div>

      {subQ.explanation && (
        <div className="rounded-md border border-blue-300 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-950/20">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">해설</p>
          <p className="text-sm text-blue-900 dark:text-blue-200 whitespace-pre-wrap">{subQ.explanation}</p>
        </div>
      )}

      {graded === null ? (
        <div className="flex gap-2">
          <button
            onClick={() => onGrade(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/20 text-sm font-medium transition-colors"
          >
            <CheckCircle className="h-4 w-4" /> 맞음
          </button>
          <button
            onClick={() => onGrade(false)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20 text-sm font-medium transition-colors"
          >
            <XCircle className="h-4 w-4" /> 틀림
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {graded ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">정답</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-400">오답</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ScenarioCompositeChoice ──────────────────────────────────────────────────

export function ScenarioCompositeChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const subQs = question.subQuestions || [];
  const [subAnswers, setSubAnswers] = useState<ReadonlyArray<string>>(() =>
    subQs.map(() => '')
  );
  const [showResults, setShowResults] = useState(false);
  const [subGrades, setSubGrades] = useState<ReadonlyArray<boolean | null>>(() =>
    subQs.map(() => null)
  );

  const allFilled = subAnswers.every((a) => a.trim().length > 0);
  const allGraded = subGrades.every((g) => g !== null);

  const handleSubAnswerChange = (index: number, value: string) => {
    setSubAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  };

  const handleShowResults = () => {
    setShowResults(true);
  };

  const handleSubGrade = (index: number, correct: boolean) => {
    setSubGrades((prev) => prev.map((g, i) => (i === index ? correct : g)));
  };

  const handleNext = () => {
    const correctCount = subGrades.filter((g) => g === true).length;
    const isCorrect = correctCount === subQs.length;
    const summary = subAnswers.join(' | ');
    onAnswer(summary, isCorrect);
  };

  if (subQs.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        하위 질문이 없습니다.
      </div>
    );
  }

  return (
    <div>
      {!showResults ? (
        <>
          <div className="space-y-4 mb-6">
            {subQs.map((subQ, i) => (
              <SubQuestionInput
                key={subQ.id}
                subQ={subQ}
                index={i}
                disabled={false}
                value={subAnswers[i]}
                onChange={(v) => handleSubAnswerChange(i, v)}
              />
            ))}
          </div>
          <Button
            onClick={handleShowResults}
            disabled={!allFilled}
            className="w-full min-h-[44px] gap-2"
          >
            <Eye className="h-4 w-4" />
            모범답안 보기 ({subQs.length}개 하위 질문)
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {subQs.map((subQ, i) => (
              <SubQuestionResult
                key={subQ.id}
                subQ={subQ}
                index={i}
                userAnswer={subAnswers[i]}
                graded={subGrades[i]}
                onGrade={(correct) => handleSubGrade(i, correct)}
              />
            ))}
          </div>

          {question.explanation && (
            <div className="mb-4 rounded-lg border border-blue-300 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/20">
              <p className="mb-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                전체 해설
              </p>
              <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200 whitespace-pre-wrap">
                {question.explanation}
              </p>
            </div>
          )}

          {allGraded && (
            <>
              <div className="mb-4 rounded-lg border border-border bg-muted/30 p-4 text-center">
                <p className="text-sm font-medium">
                  {subGrades.filter((g) => g === true).length} / {subQs.length} 정답
                </p>
              </div>
              <Button onClick={handleNext} className="w-full min-h-[44px]">
                다음
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}
