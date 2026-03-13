'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

// ─── Main QuizClient ─────────────────────────────────────────────────────────

export function QuizClient({
  subjectTitle,
  questions,
}: {
  subjectTitle: string;
  questions: QuizQuestion[];
}) {
  const [activeQuestions, setActiveQuestions] = useState<ReadonlyArray<QuizQuestion>>(questions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadonlyArray<AnswerRecord>>([]);
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
    setActiveQuestions(questions);
    setCurrentIndex(0);
    setAnswers([]);
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

    if (currentIndex + 1 >= activeQuestions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const currentQuestion = activeQuestions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <XPToast amount={xpToast.amount} visible={xpToast.visible} />

      <h1 className="text-2xl font-bold text-foreground mb-6">{subjectTitle} 퀴즈</h1>

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

          <Card className="mb-6">
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
        </>
      )}
    </div>
  );
}
