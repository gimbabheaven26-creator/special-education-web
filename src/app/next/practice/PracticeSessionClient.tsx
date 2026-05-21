'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bot,
  CalendarClock,
  CheckCircle2,
  Circle,
  Lightbulb,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';
import type { PracticeQuestion, PracticeSession } from '@/lib/sew-next/prototype-data';
import type { QuizQuestion } from '@/types/quiz';

interface PracticeSessionClientProps {
  session: PracticeSession;
}

interface AnswerRecord {
  correct: boolean;
  questionId: string;
}

function persistSnapshot(key: string, state: Record<string, unknown>, version: number) {
  if (typeof window === 'undefined') return;

  const serializable = Object.fromEntries(
    Object.entries(state).filter(([, value]) => typeof value !== 'function')
  );
  localStorage.setItem(key, JSON.stringify({ state: serializable, version }));
}

function toQuizQuestion(question: PracticeQuestion): QuizQuestion {
  const correctIndex = question.choices.findIndex((choice) => choice.correct);
  return {
    id: question.id,
    subject: question.domain,
    chapter: question.blueprint,
    type: 'multiple',
    question: question.stem,
    options: question.choices.map((choice) => choice.label),
    answer: Math.max(correctIndex, 0),
    explanation: question.explanation.coreRule,
    difficulty: question.difficulty === '상' ? 3 : question.difficulty === '하' ? 1 : 2,
    source: 'sew-next',
  };
}

export function PracticeSessionClient({ session }: PracticeSessionClientProps) {
  const questions = useMemo(
    () => [session.question, ...(session.followUpQuestions ?? [])],
    [session.followUpQuestions, session.question],
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);

  const question = questions[questionIndex] ?? questions[0];
  const selectedChoice = useMemo(
    () => question.choices.find((choice) => choice.id === selectedChoiceId),
    [question.choices, selectedChoiceId],
  );
  const correctCount = answers.filter((answer) => answer.correct).length;
  const isLastQuestion = questionIndex === questions.length - 1;
  const showSummary = submitted && selectedChoice && isLastQuestion;

  const submitDisabled = selectedChoiceId === null;

  function handleSubmit() {
    if (!selectedChoice || submitted) return;

    const isCorrect = selectedChoice.correct;
    const userAnswer = selectedChoice.label;
    const sessionId = `sew-next-${session.mode}`;

    setAnswers((current) => [
      ...current.filter((answer) => answer.questionId !== question.id),
      { correct: isCorrect, questionId: question.id },
    ]);
    useStudyStore.getState().recordQuizResult(isCorrect);
    useQuizStore.getState().addQuizResult({
      questionId: question.id,
      userAnswer,
      isCorrect,
      timestamp: Date.now(),
      subject: question.domain,
      chapter: question.blueprint,
      sessionId,
    });
    if (!isCorrect) {
      useQuizStore.getState().addWrongNote(toQuizQuestion(question), userAnswer, sessionId);
    }
    persistSnapshot('special-edu-study', useStudyStore.getState() as unknown as Record<string, unknown>, 7);
    persistSnapshot('quiz-data', useQuizStore.getState() as unknown as Record<string, unknown>, 5);
    setSubmitted(true);
  }

  function handleNextQuestion() {
    setQuestionIndex((current) => Math.min(current + 1, questions.length - 1));
    setSelectedChoiceId(null);
    setSubmitted(false);
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-6 lg:px-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link
              href="/next"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              SEW Next
            </Link>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">SEW Next Practice</h1>
            <p className="mt-2 text-lg font-semibold text-foreground">{session.title}</p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {session.subtitle}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground">Target gain</p>
            <p className="mt-1 text-2xl font-bold text-primary">{session.targetGain}</p>
            <p className="mt-1 text-xs text-muted-foreground">{session.focus}</p>
          </div>
        </header>

        <section className="grid gap-4 py-5 lg:grid-cols-[1fr_280px]">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                문항 {questionIndex + 1} / {questions.length}
              </span>
              <span className="rounded-full bg-muted px-2.5 py-1">{question.domain}</span>
              <span className="rounded-full bg-muted px-2.5 py-1">{question.difficulty}</span>
              <span className="rounded-full bg-muted px-2.5 py-1">{question.blueprint}</span>
            </div>

            <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Exam signal</p>
                  <p className="mt-1 text-sm leading-relaxed">{question.examSignal}</p>
                </div>
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-bold">{question.stem}</h2>

            <fieldset className="mt-5 space-y-3">
              <legend className="sr-only">선지 선택</legend>
              {question.choices.map((choice) => {
                const checked = selectedChoiceId === choice.id;
                const showResult = submitted && checked;
                return (
                  <label
                    key={choice.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 transition-colors',
                      checked ? 'border-primary bg-primary/5' : 'hover:bg-muted/40',
                      showResult && choice.correct && 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30',
                      showResult && !choice.correct && 'border-rose-300 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/30',
                    )}
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={choice.id}
                      checked={checked}
                      onChange={() => {
                        setSelectedChoiceId(choice.id);
                        setSubmitted(false);
                      }}
                      className="mt-1 h-4 w-4 accent-primary"
                    />
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{choice.label}</span>
                      {showResult && (
                        <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">
                          {choice.rationale}
                        </span>
                      )}
                    </span>
                    {showResult && choice.correct && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    {showResult && !choice.correct && <Circle className="h-5 w-5 text-rose-600" />}
                  </label>
                );
              })}
            </fieldset>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                선택 후 해설을 열면 AI 코치와 다음 복습 예약까지 함께 표시됩니다.
              </p>
              <button
                type="button"
                disabled={submitDisabled}
                onClick={handleSubmit}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                제출하고 해설 보기
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <section className="rounded-xl border border-border bg-card p-4">
              <h2 className="text-sm font-bold">Session queue</h2>
              <div className="mt-3 space-y-2">
                {session.queue.map((item, index) => (
                  <div key={item} className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-xs font-medium">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background text-[10px]">
                      {index + 1}
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h2 className="text-sm font-bold">Readiness rule</h2>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                정답 여부보다 판단 근거를 남겨 다음 세션의 문항 순서를 조정하는 구조입니다.
              </p>
            </section>
          </aside>
        </section>

        {submitted && selectedChoice && (
          <section className="grid gap-4 pb-8 lg:grid-cols-3" aria-live="polite">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <h2 className="font-bold">
                  {selectedChoice.correct ? question.explanation.verdict : '다시 점검이 필요합니다'}
                </h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{question.explanation.coreRule}</p>
              <p className="mt-3 text-xs leading-relaxed opacity-85">{question.explanation.trap}</p>
              {!isLastQuestion && (
                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
                >
                  다음 문항
                </button>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-sky-600 dark:text-sky-400" />
                <h2 className="font-bold">{question.aiCoach.title}</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{question.aiCoach.prompt}</p>
              <div className="mt-3 rounded-lg bg-muted/40 p-3">
                <p className="flex items-center gap-2 text-xs font-semibold">
                  <Lightbulb className="h-4 w-4 text-amber-600" />
                  모범 압축문
                </p>
                <p className="mt-2 text-sm leading-relaxed">{question.aiCoach.rewrite}</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                <h2 className="font-bold">{question.explanation.nextReview}</h2>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{question.explanation.connect}</p>
              <Link
                href="/next"
                className="mt-4 inline-flex min-h-[40px] items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
              >
                콕핏으로 돌아가기
              </Link>
            </div>
          </section>
        )}

        {showSummary && (
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-5" aria-live="polite">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold">세션 요약</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {questions.length}문항 중 {correctCount}문항 정답
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card px-4 py-3">
                <p className="text-xs font-semibold text-muted-foreground">
                  예상 준비도 상승 {session.targetGain}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
