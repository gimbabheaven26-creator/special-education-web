'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import type { QuizQuestion } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { QuizResultScreen, TYPE_LABELS } from './QuizResultScreen';
import type { AnswerRecord } from './QuizResultScreen';
import { ProgressDots, XPToast } from './ProgressDots';
import { CaseContextBox, MultipleChoice, OXChoice, FillInChoice } from './QuestionCard';

// ─── Constants ───────────────────────────────────────────────────────────────

const XP_CORRECT = 15;
const XP_WRONG = 10;
const QUESTIONS_PER_SESSION = 10;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleAndPick(questions: QuizQuestion[], count: number): QuizQuestion[] {
  const shuffled = [...questions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

// ─── Question Nav (소제목 네비게이션) ────────────────────────────────────────

function QuestionNav({
  questions,
  chapterMap,
  currentIndex,
  answers,
  onJump,
}: {
  questions: ReadonlyArray<QuizQuestion>;
  chapterMap: Record<string, string>;
  currentIndex: number;
  answers: ReadonlyArray<AnswerRecord>;
  onJump: (index: number) => void;
}) {
  const answeredMap = new Map(answers.map((a) => [a.questionIndex, a.isCorrect]));

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {questions.map((q, i) => {
        const chapterTitle = chapterMap[q.chapter] || q.chapter;
        const isCurrent = i === currentIndex;
        const result = answeredMap.get(i);

        let pillClass =
          'text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all font-medium truncate max-w-[200px]';

        if (isCurrent) {
          pillClass += ' bg-primary text-primary-foreground ring-2 ring-primary/40';
        } else if (result === true) {
          pillClass += ' bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        } else if (result === false) {
          pillClass += ' bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        } else {
          pillClass += ' bg-muted text-muted-foreground hover:bg-muted/80';
        }

        return (
          <button
            key={i}
            className={pillClass}
            onClick={() => onJump(i)}
            title={`${i + 1}. ${chapterTitle}`}
          >
            {i + 1}. {chapterTitle}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main QuizClient ─────────────────────────────────────────────────────────

export function QuizClient({
  subjectTitle,
  questions,
  chapterMap,
}: {
  subjectTitle: string;
  questions: QuizQuestion[];
  chapterMap: Record<string, string>;
}) {
  const [activeQuestions, setActiveQuestions] = useState<ReadonlyArray<QuizQuestion>>(() =>
    shuffleAndPick(questions, QUESTIONS_PER_SESSION)
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadonlyArray<AnswerRecord>>([]);
  const [skipped, setSkipped] = useState<ReadonlySet<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpToast, setXpToast] = useState<{ amount: number; visible: boolean }>({
    amount: 0,
    visible: false,
  });

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordQuizResult = useStudyStore((s) => s.recordQuizResult);
  const addQuizResult = useQuizStore((s) => s.addQuizResult);
  const addWrongNote = useQuizStore((s) => s.addWrongNote);

  const showXPToast = useCallback((amount: number) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setXpToast({ amount, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setXpToast((prev) => ({ ...prev, visible: false }));
    }, 1200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Check if all questions are answered or skipped
  const allHandled = useMemo(() => {
    const answeredIndices = new Set(answers.map((a) => a.questionIndex));
    return activeQuestions.every((_, i) => answeredIndices.has(i) || skipped.has(i));
  }, [answers, skipped, activeQuestions]);

  // Auto-finish when all questions are handled
  useEffect(() => {
    if (allHandled && activeQuestions.length > 0 && answers.length > 0) {
      setFinished(true);
    }
  }, [allHandled, activeQuestions.length, answers.length]);

  if (activeQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{subjectTitle} 퀴즈</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">퀴즈를 준비 중입니다.</p>
          </CardContent>
        </Card>
        <Link
          href="/quiz"
          className="mt-6 inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium whitespace-nowrap transition-all h-11 gap-1.5 px-2.5 hover:bg-muted hover:text-foreground"
        >
          과목 목록으로
        </Link>
      </div>
    );
  }

  const handleRestart = () => {
    setActiveQuestions(shuffleAndPick(questions, QUESTIONS_PER_SESSION));
    setCurrentIndex(0);
    setAnswers([]);
    setSkipped(new Set());
    setFinished(false);
    setXpEarned(0);
  };

  const handleRetryWrong = () => {
    const wrongIndices = new Set(
      answers.filter((a) => !a.isCorrect).map((a) => a.questionIndex)
    );
    const wrongQuestions = activeQuestions.filter((_, i) => wrongIndices.has(i));
    setActiveQuestions(wrongQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setSkipped(new Set());
    setFinished(false);
    setXpEarned(0);
  };

  const handleAnswer = (_answer: string | number, isCorrect: boolean) => {
    const newAnswer: AnswerRecord = {
      questionIndex: currentIndex,
      isCorrect,
      userAnswer: _answer,
    };
    const updatedAnswers = [...answers, newAnswer];

    // Record in study store
    recordQuizResult(isCorrect);

    // Record in quiz store (history + wrong notes)
    const currentQ = activeQuestions[currentIndex];
    addQuizResult({
      questionId: currentQ.id,
      userAnswer: _answer,
      isCorrect,
      timestamp: Date.now(),
      subject: currentQ.subject,
      chapter: currentQ.chapter,
    });

    if (!isCorrect) {
      addWrongNote(currentQ, _answer);
    }

    // XP toast
    const earned = isCorrect ? XP_CORRECT : XP_WRONG;
    setXpEarned((prev) => prev + earned);
    showXPToast(earned);

    setAnswers(updatedAnswers);

    // Move to next unanswered/unskipped question, or finish
    const answeredIndices = new Set(updatedAnswers.map((a) => a.questionIndex));
    const nextIndex = findNextUnanswered(currentIndex, activeQuestions.length, answeredIndices, skipped);

    if (nextIndex === -1) {
      setFinished(true);
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleSkip = () => {
    const newSkipped = new Set(skipped);
    newSkipped.add(currentIndex);
    setSkipped(newSkipped);

    const answeredIndices = new Set(answers.map((a) => a.questionIndex));
    const nextIndex = findNextUnanswered(currentIndex, activeQuestions.length, answeredIndices, newSkipped);

    if (nextIndex === -1) {
      // All remaining are skipped — if we have at least 1 answer, finish
      if (answers.length > 0) {
        setFinished(true);
      }
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleJump = (index: number) => {
    // Allow jumping to any question that hasn't been answered yet
    const answeredIndices = new Set(answers.map((a) => a.questionIndex));
    if (!answeredIndices.has(index)) {
      setCurrentIndex(index);
    }
  };

  const currentQuestion = activeQuestions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <XPToast amount={xpToast.amount} visible={xpToast.visible} />

      <h1 className="text-2xl font-bold text-foreground mb-4">{subjectTitle} 퀴즈</h1>

      {finished ? (
        <QuizResultScreen
          questions={activeQuestions}
          answers={answers}
          totalXPEarned={xpEarned}
          onRestart={handleRestart}
          onRetryWrong={handleRetryWrong}
        />
      ) : (
        <>
          {/* 소제목 네비게이션 */}
          <QuestionNav
            questions={activeQuestions}
            chapterMap={chapterMap}
            currentIndex={currentIndex}
            answers={answers}
            onJump={handleJump}
          />

          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {activeQuestions.length}
              </span>
              <Badge variant="outline">
                {TYPE_LABELS[currentQuestion.type as keyof typeof TYPE_LABELS] ?? currentQuestion.type}
              </Badge>
            </div>
            <ProgressDots
              total={activeQuestions.length}
              currentIndex={currentIndex}
              answers={answers}
            />
          </div>

          {/* 현재 문제의 소제목 */}
          <p className="text-sm text-muted-foreground mb-2">
            📌 {chapterMap[currentQuestion.chapter] || currentQuestion.chapter}
          </p>

          <Card className="mb-4">
            <CardHeader>
              {currentQuestion.caseContext && (
                <CaseContextBox caseContext={currentQuestion.caseContext} />
              )}
              <CardTitle className="text-base font-medium leading-relaxed">
                {currentQuestion.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentQuestion.type === 'multiple' && (
                <MultipleChoice
                  key={currentIndex}
                  question={currentQuestion}
                  onAnswer={(ans, correct) => handleAnswer(ans, correct)}
                />
              )}
              {currentQuestion.type === 'ox' && (
                <OXChoice
                  key={currentIndex}
                  question={currentQuestion}
                  onAnswer={(ans, correct) => handleAnswer(ans, correct)}
                />
              )}
              {currentQuestion.type === 'fill_in' && (
                <FillInChoice
                  key={currentIndex}
                  question={currentQuestion}
                  onAnswer={(ans, correct) => handleAnswer(ans, correct)}
                />
              )}
            </CardContent>
          </Card>

          {/* 건너뛰기 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted"
            >
              건너뛰기 →
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function findNextUnanswered(
  currentIndex: number,
  total: number,
  answeredIndices: Set<number>,
  skippedIndices: ReadonlySet<number>
): number {
  // Look forward first
  for (let i = currentIndex + 1; i < total; i++) {
    if (!answeredIndices.has(i) && !skippedIndices.has(i)) return i;
  }
  // Wrap around
  for (let i = 0; i < currentIndex; i++) {
    if (!answeredIndices.has(i) && !skippedIndices.has(i)) return i;
  }
  return -1;
}
