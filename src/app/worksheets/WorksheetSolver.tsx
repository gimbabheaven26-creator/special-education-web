'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { WorksheetConfig, WorksheetQuestion } from '@/lib/worksheet-utils';
import { checkFillInAnswer } from '@/lib/answer-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Send,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

const POINTS = { fill_in: 2, descriptive: 4 } as const;

type GradeResult = 'correct' | 'incorrect' | 'self-correct' | 'self-incorrect' | null;
type SolverPhase = 'solving' | 'review';
type SlideDirection = 'left' | 'right' | null;

// ─── Progress Dots ───────────────────────────────────────────────────────────

function ProgressDots({
  total,
  currentIndex,
  answers,
}: {
  total: number;
  currentIndex: number;
  answers: Record<string, string>;
}) {
  return (
    <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-1.5 max-h-10 sm:max-h-16 overflow-y-auto py-1">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === currentIndex;
        const hasAnswer = Object.keys(answers).length > i; // approximate

        let dotClass =
          'w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0 cursor-pointer';

        if (isCurrent) {
          dotClass += ' bg-primary ring-2 ring-primary/40 ring-offset-1 ring-offset-background';
        } else if (hasAnswer) {
          dotClass += ' bg-emerald-500';
        } else {
          dotClass += ' bg-muted-foreground/30';
        }

        return <div key={i} className={dotClass} />;
      })}
    </div>
  );
}

// ─── Score Ring ──────────────────────────────────────────────────────────────

function ScoreRing({
  score,
  maxScore,
  correct,
  total,
}: {
  score: number;
  maxScore: number;
  correct: number;
  total: number;
}) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * percentage) / 100;

  const ringColor =
    percentage >= 80
      ? 'text-emerald-500'
      : percentage >= 60
      ? 'text-amber-500'
      : 'text-red-500';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            strokeWidth="8"
            className="stroke-muted"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`${ringColor} transition-all duration-700 ease-out`}
            style={{ stroke: 'currentColor' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          <span className="text-xs text-muted-foreground">
            {score}/{maxScore}점
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {correct}/{total}문제 정답
      </p>
    </div>
  );
}

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

// ─── Single Question Card ───────────────────────────────────────────────────

function QuestionCard({
  question,
  index,
  total,
  answer,
  onAnswerChange,
  isReview,
  grade,
  onSelfGrade,
}: {
  question: WorksheetQuestion;
  index: number;
  total: number;
  answer: string;
  onAnswerChange: (value: string) => void;
  isReview: boolean;
  grade: GradeResult;
  onSelfGrade: (correct: boolean) => void;
}) {
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
        <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap mb-4">
          {question.question}
        </p>

        {/* Answer input */}
        {!isReview && (
          <div>
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

            {/* Fill-in: wrong answer → show correct */}
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

// ─── Main WorksheetSolver ───────────────────────────────────────────────────

export interface WorksheetSolverProps {
  worksheet: WorksheetConfig;
  subjectTitle: string;
  onRetry: () => void;
  onNewWorksheet: () => void;
}

export function WorksheetSolver({
  worksheet,
  subjectTitle,
  onRetry,
  onNewWorksheet,
}: WorksheetSolverProps) {
  const [phase, setPhase] = useState<SolverPhase>('solving');
  const [currentStep, setCurrentStep] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [grades, setGrades] = useState<Record<string, GradeResult>>({});
  const [slideDirection, setSlideDirection] = useState<SlideDirection>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const questions = worksheet.questions;
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentStep];

  // Answered question count
  const answeredCount = useMemo(() => {
    return questions.filter((q) => (userAnswers[q.id] || '').trim().length > 0).length;
  }, [questions, userAnswers]);

  // Score info for review
  const scoreInfo = useMemo(() => {
    if (phase !== 'review') return null;

    let correct = 0;
    let score = 0;
    let maxScore = 0;
    const hasUngraded = Object.values(grades).some((g) => g === null);

    for (const q of questions) {
      const pts = POINTS[q.type as keyof typeof POINTS] ?? POINTS.fill_in;
      maxScore += pts;
      const g = grades[q.id];
      if (g === 'correct' || g === 'self-correct') {
        correct++;
        score += pts;
      }
    }

    return { correct, total: totalQuestions, score, maxScore, hasUngraded };
  }, [phase, grades, questions, totalQuestions]);

  // Answer update (immutable)
  const handleAnswerChange = useCallback(
    (questionId: string, value: string) => {
      setUserAnswers((prev) => ({ ...prev, [questionId]: value }));
    },
    [],
  );

  // Self-grade (immutable)
  const handleSelfGrade = useCallback((questionId: string, correct: boolean) => {
    setGrades((prev) => ({
      ...prev,
      [questionId]: correct ? 'self-correct' : 'self-incorrect',
    }));
  }, []);

  // Slide transition helper
  const animateSlide = useCallback(
    (direction: SlideDirection, callback: () => void) => {
      setSlideDirection(direction);
      setIsAnimating(true);
      // After animation out, switch content, then animate in
      const timer = setTimeout(() => {
        callback();
        setSlideDirection(null);
        setIsAnimating(false);
      }, 200);
      return () => clearTimeout(timer);
    },
    [],
  );

  // Navigate next
  const goNext = useCallback(() => {
    if (isAnimating) return;
    if (currentStep < totalQuestions - 1) {
      animateSlide('left', () => setCurrentStep((prev) => prev + 1));
    }
  }, [isAnimating, currentStep, totalQuestions, animateSlide]);

  // Navigate previous
  const goPrev = useCallback(() => {
    if (isAnimating) return;
    if (currentStep > 0) {
      animateSlide('right', () => setCurrentStep((prev) => prev - 1));
    }
  }, [isAnimating, currentStep, animateSlide]);

  // Submit all answers
  const handleSubmit = useCallback(() => {
    const newGrades: Record<string, GradeResult> = {};
    for (const q of questions) {
      if (q.type === 'fill_in') {
        const answer = userAnswers[q.id] || '';
        newGrades[q.id] = checkFillInAnswer(answer, q.answer) ? 'correct' : 'incorrect';
      } else {
        newGrades[q.id] = null;
      }
    }
    setGrades(newGrades);
    setPhase('review');
    setCurrentStep(0);
  }, [questions, userAnswers]);

  // Retry: reset everything
  const handleRetry = useCallback(() => {
    setPhase('solving');
    setCurrentStep(0);
    setUserAnswers({});
    setGrades({});
    setSlideDirection(null);
    setIsAnimating(false);
    onRetry();
  }, [onRetry]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'solving') return;

      // Enter to advance for fill_in
      if (e.key === 'Enter' && !e.shiftKey && currentQuestion?.type === 'fill_in') {
        e.preventDefault();
        if (currentStep < totalQuestions - 1) {
          goNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentQuestion, currentStep, totalQuestions, goNext]);

  // Slide animation class
  const slideClass = slideDirection === 'left'
    ? 'translate-x-[-100%] opacity-0'
    : slideDirection === 'right'
    ? 'translate-x-[100%] opacity-0'
    : 'translate-x-0 opacity-100';

  // ─── Review Phase ─────────────────────────────────────────────────────────

  if (phase === 'review') {
    return (
      <div className="space-y-6">
        {/* Score Summary */}
        {scoreInfo && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ScoreRing
                  score={scoreInfo.score}
                  maxScore={scoreInfo.maxScore}
                  correct={scoreInfo.correct}
                  total={scoreInfo.total}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-foreground mb-1">채점 결과</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {subjectTitle} &gt; {worksheet.topicName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    학습지 {worksheet.id} ·{' '}
                    <Badge variant="outline" className="text-xs">
                      {worksheet.type === 'fill_in'
                        ? '기입형'
                        : worksheet.type === 'descriptive'
                        ? '서술형'
                        : '혼합'}
                    </Badge>
                  </p>
                  {scoreInfo.hasUngraded && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      서술형 문제는 아래에서 자기 채점해주세요
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action buttons at top */}
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleRetry} className="min-h-[44px]">
            <RotateCcw className="h-4 w-4 mr-1.5" />
            다시 풀기
          </Button>
          <Button variant="outline" size="sm" onClick={onNewWorksheet} className="min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            새 문제지
          </Button>
        </div>

        {/* All questions in review mode */}
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={idx}
              total={totalQuestions}
              answer={userAnswers[q.id] || ''}
              onAnswerChange={() => {}}
              isReview={true}
              grade={grades[q.id]}
              onSelfGrade={(correct) => handleSelfGrade(q.id, correct)}
            />
          ))}
        </div>

        {/* Bottom action buttons */}
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={handleRetry} className="min-h-[44px]">
            <RotateCcw className="h-4 w-4 mr-1.5" />
            다시 풀기
          </Button>
          <Button variant="outline" onClick={onNewWorksheet} className="min-h-[44px]">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            새 문제지
          </Button>
        </div>
      </div>
    );
  }

  // ─── Solving Phase (Step-by-Step) ─────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Progress section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            문제 {currentStep + 1} / {totalQuestions}
          </span>
          <span className="text-xs text-muted-foreground">
            {answeredCount}문제 작성됨
          </span>
        </div>
        <ProgressDots
          total={totalQuestions}
          currentIndex={currentStep}
          answers={userAnswers}
        />
      </div>

      {/* Question card with slide animation */}
      <div ref={containerRef} className="overflow-hidden">
        <div
          className={`transition-all duration-200 ease-in-out ${slideClass}`}
        >
          {currentQuestion && (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              index={currentStep}
              total={totalQuestions}
              answer={userAnswers[currentQuestion.id] || ''}
              onAnswerChange={(value) =>
                handleAnswerChange(currentQuestion.id, value)
              }
              isReview={false}
              grade={null}
              onSelfGrade={() => {}}
            />
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 0 || isAnimating}
          className="gap-1 min-h-[44px]"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </Button>

        <div className="flex gap-2">
          {currentStep < totalQuestions - 1 ? (
            <Button
              onClick={goNext}
              disabled={isAnimating}
              className="gap-1 min-h-[44px]"
            >
              다음
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="gap-1 min-h-[44px] text-sm whitespace-nowrap"
            >
              <Send className="h-4 w-4 mr-1" />
              제출하기 ({answeredCount}/{totalQuestions})
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
