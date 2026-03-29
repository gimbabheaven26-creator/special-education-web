'use client';

import Link from 'next/link';
import { Loader2, ChevronRight } from 'lucide-react';
import { makeSheetCode } from '@/lib/sheet-code';
import { getKSTTimeslot } from '@/lib/timeslot';
import { OX_COUNT, FILL_IN_COUNT, DESCRIPTIVE_COUNT } from '@/types/daily';
import type { Step } from '@/types/daily';
import { useDailyQuiz } from '@/hooks/useDailyQuiz';
import { StepOX } from './StepOX';
import { StepFillIn } from './StepFillIn';
import { StepDescriptive } from './StepDescriptive';
import { CompletionScreen } from './CompletionScreen';

const TIMESLOT = getKSTTimeslot();
const TODAY_SHEET_CODE = makeSheetCode(TIMESLOT.date);

export function DailyQuizClient() {
  const {
    step, setStep,
    loading, error, loadQuestions,
    oxQuestions, fillInQuestions, descriptiveQuestions,
    oxAnswers, answerOx, allOxAnswered,
    revealed, setRevealed,
    wrongChaptersStep1,
    step1Done, step2Done, step3Done,
    finishStep1, proceedToStep2,
    finishStep2, proceedToStep3,
    finishStep3,
  } = useDailyQuiz();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <p className="text-sm text-muted-foreground">문제를 불러오지 못했습니다.</p>
        <button onClick={loadQuestions} className="text-sm text-primary hover:underline">
          다시 시도
        </button>
      </div>
    );
  }

  if (step3Done) {
    return (
      <CompletionScreen
        timeslotLabel={TIMESLOT.label}
        oxQuestions={oxQuestions}
        oxAnswers={oxAnswers}
        wrongChapters={wrongChaptersStep1}
      />
    );
  }

  const stepLabel = step === 1 ? 'STEP 1 — OX 퀴즈' : step === 2 ? 'STEP 2 — 단답형' : 'STEP 3 — 서술형';
  const stepTotal = OX_COUNT + FILL_IN_COUNT + DESCRIPTIVE_COUNT;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* 고유번호 배너 */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>오늘의 학습 · {TIMESLOT.label}</span>
        <span className="font-mono bg-muted px-2 py-0.5 rounded">{TODAY_SHEET_CODE}</span>
      </div>

      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground">{stepLabel}</h1>
          <p className="text-xs text-muted-foreground">
            {step === 1 ? `${OX_COUNT}문제` : step === 2 ? `${FILL_IN_COUNT}문제` : `${DESCRIPTIVE_COUNT}문제`}
            {' / 오늘 총 '}
            {stepTotal}문제
          </p>
        </div>
        <div className="flex items-center gap-1">
          {([1, 2, 3] as Step[]).map((s) => (
            <button
              key={s}
              onClick={() => s <= step && setStep(s)}
              disabled={s > step}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                s < step ? 'bg-green-500 text-white hover:bg-green-600 cursor-pointer' : s === step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
              }`}
            >
              {s < step ? '\u2713' : s}
            </button>
          ))}
        </div>
      </div>

      {step === 1 && (
        <StepOX
          oxQuestions={oxQuestions}
          oxAnswers={oxAnswers}
          onAnswer={answerOx}
          revealed={revealed}
          allOxAnswered={allOxAnswered}
          step1Done={step1Done}
          wrongChaptersStep1={wrongChaptersStep1}
          onFinishStep1={finishStep1}
          onProceedToStep2={proceedToStep2}
        />
      )}

      {step === 2 && (
        <StepFillIn
          fillInQuestions={fillInQuestions}
          revealed={revealed}
          step2Done={step2Done}
          onFinishStep2={finishStep2}
          onProceedToStep3={proceedToStep3}
        />
      )}

      {step === 3 && (
        <StepDescriptive
          descriptiveQuestions={descriptiveQuestions}
          revealed={revealed}
          step3Done={step3Done}
          onReveal={() => setRevealed(true)}
          onFinishStep3={finishStep3}
        />
      )}

      {/* 하단 네비 */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          ← 홈으로
        </Link>
        <Link href="/wrong-notes" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
          오답노트 <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
