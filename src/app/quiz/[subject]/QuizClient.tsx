'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import type { QuizQuestion } from '@/types/quiz';
import { checkFillInAnswer } from '@/lib/answer-checker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle, XCircle, ChevronDown, ChevronUp,
  ThumbsUp, ThumbsDown, Flag,
} from 'lucide-react';
import { useQuizFeedbackStore } from '@/stores/useQuizFeedbackStore';
import { useStudyStore } from '@/stores/useStudyStore';
import { QuizResultScreen, TYPE_LABELS } from './QuizResultScreen';
import type { AnswerRecord } from './QuizResultScreen';

// ─── Constants ───────────────────────────────────────────────────────────────

const XP_CORRECT = 15;
const XP_WRONG = 10;

// ─── Progress Dots ───────────────────────────────────────────────────────────

function ProgressDots({
  total,
  currentIndex,
  answers,
}: {
  total: number;
  currentIndex: number;
  answers: ReadonlyArray<AnswerRecord>;
}) {
  const answeredMap = new Map(
    answers.map((a) => [a.questionIndex, a.isCorrect])
  );

  return (
    <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto py-1">
      {Array.from({ length: total }, (_, i) => {
        const isCurrent = i === currentIndex;
        const result = answeredMap.get(i);

        let dotClass =
          'w-3 h-3 rounded-full transition-all duration-200 flex-shrink-0';

        if (isCurrent) {
          dotClass += ' bg-blue-500 ring-2 ring-blue-300 ring-offset-1 animate-pulse';
        } else if (result === true) {
          dotClass += ' bg-emerald-500';
        } else if (result === false) {
          dotClass += ' bg-red-500';
        } else {
          dotClass += ' bg-gray-300 dark:bg-gray-600';
        }

        return <div key={i} className={dotClass} />;
      })}
    </div>
  );
}

// ─── XP Toast ────────────────────────────────────────────────────────────────

function XPToast({ amount, visible }: { amount: number; visible: boolean }) {
  if (!visible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <div className="rounded-full bg-purple-600 px-4 py-2 text-white font-bold text-sm shadow-lg">
        +{amount} XP
      </div>
    </div>
  );
}

// ─── Case Context Box ────────────────────────────────────────────────────────

function CaseContextBox({ caseContext }: { caseContext: string }) {
  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/20">
      <p className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
        {'📋 사례'}
      </p>
      <p className="text-sm leading-relaxed text-amber-900 dark:text-amber-200">
        {caseContext}
      </p>
    </div>
  );
}

// ─── ErrorReportSection (kept) ───────────────────────────────────────────────

function ErrorReportSection({ questionId }: { questionId: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const addErrorReport = useQuizFeedbackStore((s) => s.addErrorReport);

  const handleSubmit = () => {
    if (!message.trim()) return;
    addErrorReport(questionId, message.trim());
    setSubmitted(true);
    setMessage('');
  };

  if (submitted) {
    return (
      <span className="text-xs text-muted-foreground">신고가 접수되었습니다</span>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((prev) => !prev)}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
      >
        <Flag className="h-3.5 w-3.5" />
        오류 신고
      </Button>
      {open && (
        <div className="w-full mt-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="오류 내용을 간략히 적어주세요"
            className="w-full text-xs rounded-md border border-border bg-background p-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            rows={2}
          />
          <div className="flex gap-2 mt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSubmit}
              disabled={!message.trim()}
              className="h-6 px-2 text-xs"
            >
              제출
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-6 px-2 text-xs text-muted-foreground"
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── QuestionActions (kept) ──────────────────────────────────────────────────

function QuestionActions({ question }: { question: QuizQuestion }) {
  const { getFeedback, addFeedback } = useQuizFeedbackStore();
  const currentFeedback = getFeedback(question.id);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-1 flex-wrap">
        <span className="text-xs text-muted-foreground mr-1">이 문제가 도움이 됐나요?</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addFeedback(question.id, 'up')}
          className={`h-7 px-2 gap-1 text-xs ${
            currentFeedback === 'up'
              ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addFeedback(question.id, 'down')}
          className={`h-7 px-2 gap-1 text-xs ${
            currentFeedback === 'down'
              ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </Button>
        <span className="mx-1 text-border">|</span>
        <ErrorReportSection questionId={question.id} />
      </div>
      {question.source && (
        <p className="mt-2 text-xs text-muted-foreground">
          출처: {question.source}
        </p>
      )}
    </div>
  );
}

// ─── Explanation / Wrong Explanation ─────────────────────────────────────────

function ExplanationToggle({
  explanation,
  defaultOpen = false,
}: {
  explanation: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (defaultOpen) setOpen(true);
  }, [defaultOpen]);

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 text-sm font-medium text-blue-700 dark:text-blue-300 hover:underline"
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        해설 보기
      </button>
      {open && (
        <div className="mt-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">{explanation}</p>
        </div>
      )}
    </div>
  );
}

function WrongExplanationBox({ text }: { text: string }) {
  return (
    <div className="mb-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
      <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">
        선택한 답이 틀린 이유
      </p>
      <p className="text-sm text-red-700 dark:text-red-300">{text}</p>
    </div>
  );
}

// ─── Feedback Section ────────────────────────────────────────────────────────

function FeedbackSection({
  question,
  isCorrect,
  selectedOptionIndex,
}: {
  question: QuizQuestion;
  isCorrect: boolean;
  selectedOptionIndex?: string;
}) {
  const wrongExplanation =
    !isCorrect && selectedOptionIndex && question.wrongExplanations
      ? question.wrongExplanations[selectedOptionIndex]
      : undefined;

  return (
    <>
      {wrongExplanation && <WrongExplanationBox text={wrongExplanation} />}
      <ExplanationToggle
        explanation={question.explanation}
        defaultOpen={!isCorrect}
      />
      <QuestionActions question={question} />
    </>
  );
}

// ─── MultipleChoice ──────────────────────────────────────────────────────────

function MultipleChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: number, isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected !== null && selected === Number(question.answer);

  const handleSelect = (index: number) => {
    if (submitted) return;
    setSelected(index);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (selected === null) return;
    onAnswer(selected, selected === Number(question.answer));
  };

  return (
    <div>
      <div className="space-y-3 mb-6">
        {question.options?.map((option, index) => {
          let className =
            'w-full text-left p-4 rounded-lg border border-border transition-colors cursor-pointer';
          if (submitted) {
            if (index === Number(question.answer)) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20';
            } else if (index === selected && index !== Number(question.answer)) {
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
            {isCorrect ? '정답입니다!' : `오답 (정답: ${Number(question.answer) + 1}번)`}
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
      <div className="flex gap-3">
        {submitted && (
          <Button onClick={handleNext} className="w-full">
            다음
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── OXChoice ────────────────────────────────────────────────────────────────

function OXChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected === String(question.answer);

  const handleSelect = (choice: string) => {
    if (submitted) return;
    setSelected(choice);
    setSubmitted(true);
  };

  const handleNext = () => {
    if (!selected) return;
    onAnswer(selected, selected === String(question.answer));
  };

  return (
    <div>
      <div className="flex gap-4 mb-6">
        {['O', 'X'].map((choice) => {
          let className =
            'flex-1 h-20 text-3xl font-bold rounded-xl border border-border transition-colors cursor-pointer';
          if (submitted) {
            if (choice === String(question.answer)) {
              className += ' border-green-500 bg-green-50 dark:bg-green-950/20 text-green-600';
            } else if (choice === selected && choice !== String(question.answer)) {
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
            {isCorrect ? '정답입니다!' : `오답 (정답: ${String(question.answer)})`}
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
      <div className="flex gap-3">
        {submitted && (
          <Button onClick={handleNext} className="w-full">
            다음
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── FillInChoice ────────────────────────────────────────────────────────────

function FillInChoice({
  question,
  onAnswer,
}: {
  question: QuizQuestion;
  onAnswer: (answer: string, isCorrect: boolean) => void;
}) {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && checkFillInAnswer(input, String(question.answer));

  const handleSubmit = () => {
    if (!input.trim()) return;
    setSubmitted(true);
  };

  const handleNext = () => {
    onAnswer(input.trim(), checkFillInAnswer(input, String(question.answer)));
  };

  return (
    <div>
      <div className="mb-6">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => !submitted && e.key === 'Enter' && handleSubmit()}
          placeholder="정답을 입력하세요"
          disabled={submitted}
          className={submitted ? (isCorrect ? 'border-green-500' : 'border-red-500') : ''}
        />
      </div>
      {submitted && (
        <div className="mb-2 flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {isCorrect ? '정답입니다!' : `오답 (정답: ${String(question.answer)})`}
          </span>
        </div>
      )}
      {submitted && (
        <FeedbackSection question={question} isCorrect={isCorrect} />
      )}
      <div className="flex gap-3">
        {!submitted ? (
          <Button onClick={handleSubmit} disabled={!input.trim()} className="w-full">
            제출
          </Button>
        ) : (
          <Button onClick={handleNext} className="w-full">
            다음 문제
          </Button>
        )}
      </div>
    </div>
  );
}

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
          className="mt-6 inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium whitespace-nowrap transition-all h-8 gap-1.5 px-2.5 hover:bg-muted hover:text-foreground"
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
