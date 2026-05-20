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
import type { PracticeSession } from '@/lib/sew-next/prototype-data';

interface PracticeSessionClientProps {
  session: PracticeSession;
}

export function PracticeSessionClient({ session }: PracticeSessionClientProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = session.question;
  const selectedChoice = useMemo(
    () => question.choices.find((choice) => choice.id === selectedChoiceId),
    [question.choices, selectedChoiceId],
  );

  const submitDisabled = selectedChoiceId === null;

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
                onClick={() => setSubmitted(true)}
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
      </div>
    </main>
  );
}
