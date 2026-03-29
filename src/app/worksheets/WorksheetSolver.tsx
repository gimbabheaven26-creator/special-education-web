'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { WorksheetConfig } from '@/lib/content/worksheet-utils';
import { checkFillInAnswer } from '@/lib/quiz/answer-checker';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import { SolverProgressDots } from './SolverProgressDots';
import { QuestionSlide, type GradeResult } from './QuestionSlide';
import { SolverReview } from './SolverReview';

const POINTS = { fill_in: 2, descriptive: 4 } as const;

type SolverPhase = 'solving' | 'review';
type SlideDirection = 'left' | 'right' | null;

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

  if (phase === 'review' && scoreInfo) {
    return (
      <SolverReview
        worksheet={worksheet}
        subjectTitle={subjectTitle}
        questions={questions}
        userAnswers={userAnswers}
        grades={grades}
        scoreInfo={scoreInfo}
        onSelfGrade={handleSelfGrade}
        onRetry={handleRetry}
        onNewWorksheet={onNewWorksheet}
      />
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
        <SolverProgressDots
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
            <QuestionSlide
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
