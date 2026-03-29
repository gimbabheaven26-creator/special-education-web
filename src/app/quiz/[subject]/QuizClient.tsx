'use client';

import Link from 'next/link';
import type { QuizQuestion } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QuizResultScreen, TYPE_LABELS } from './QuizResultScreen';
import { ProgressDots, XPToast } from './ProgressDots';
import { CaseContextBox, MultipleChoice, OXChoice, FillInChoice, DescriptiveChoice, ScenarioCompositeChoice } from './QuestionCard';
import { SessionSetup } from './SessionSetup';
import { ComboIndicator } from '@/components/quiz/ComboIndicator';
import { ConfidenceToggle } from '@/components/quiz/ConfidenceToggle';
import { PenLine, FileText } from 'lucide-react';
import { DiagnosticReport } from '@/components/quiz/DiagnosticReport';
import type { QuizResult } from '@/types/quiz';
import { DIAGNOSTIC_CORRECT_MS, DIAGNOSTIC_WRONG_MS } from './quiz-session-utils';
import { QuestionNav } from './QuestionNav';
import { useQuizSession } from './useQuizSession';

// ─── Main QuizClient ─────────────────────────────────────────────────────────

export function QuizClient({
  subjectSlug,
  subjectTitle,
  questions,
  chapterMap,
  diagnosticMode,
  subjectMap,
}: {
  subjectSlug: string;
  subjectTitle: string;
  questions: QuizQuestion[];
  chapterMap: Record<string, string>;
  diagnosticMode?: boolean;
  subjectMap?: Record<string, string>;
}) {
  const {
    phase,
    activeTab,
    setActiveTab,
    activeQuestions,
    currentIndex,
    answers,
    xpEarned,
    xpToast,
    comboStreak,
    confidence,
    setConfidence,
    savedSession,
    filteredQuestions,
    handleStart,
    handleResume,
    handleRestart,
    handleRetryWrong,
    handleAnswer,
    handleSkip,
    handleJump,
  } = useQuizSession({ subjectSlug, questions, diagnosticMode });

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (phase === 'setup') {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-muted p-1 gap-1">
          <button
            onClick={() => setActiveTab('short')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'short'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PenLine className="h-4 w-4" />
            단답형 문제
          </button>
          <button
            onClick={() => setActiveTab('essay')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'essay'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            서술형 문제
          </button>
        </div>

        <SessionSetup
          subjectSlug={subjectSlug}
          subjectTitle={subjectTitle}
          questions={filteredQuestions}
          chapterMap={chapterMap}
          savedSession={savedSession}
          onStart={handleStart}
          onResume={handleResume}
        />
      </div>
    );
  }

  if (activeQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">{subjectTitle} 퀴즈</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">문제를 준비하고 있어요...</p>
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

  if (phase === 'result') {
    // answers → QuizResult[] 변환 (DiagnosticReport용)
    const sessionResults: QuizResult[] = diagnosticMode
      ? answers.map((a) => {
          const q = activeQuestions[a.questionIndex];
          return {
            questionId: q.id,
            userAnswer: a.userAnswer,
            isCorrect: a.isCorrect,
            timestamp: Date.now(),
            subject: q.subject,
            chapter: q.chapter,
          };
        })
      : [];

    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-4">{subjectTitle} 퀴즈</h1>
        <QuizResultScreen
          questions={activeQuestions}
          answers={answers}
          totalXPEarned={xpEarned}
          subjectSlug={subjectSlug}
          chapterMap={chapterMap}
          onRestart={handleRestart}
          onRetryWrong={handleRetryWrong}
        />
        {diagnosticMode && subjectMap && (
          <DiagnosticReport
            results={sessionResults}
            subjectMap={subjectMap}
            chapterMap={chapterMap}
          />
        )}
      </div>
    );
  }

  const currentQuestion = activeQuestions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <XPToast amount={xpToast.amount} visible={xpToast.visible} />

      <h1 className="text-2xl font-bold text-foreground mb-4">{subjectTitle} 퀴즈</h1>

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

      {/* 콤보 표시 */}
      {comboStreak >= 3 && (
        <div className="mb-3">
          <ComboIndicator streak={comboStreak} />
        </div>
      )}

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
              autoAdvanceCorrectMs={diagnosticMode ? DIAGNOSTIC_CORRECT_MS : undefined}
              autoAdvanceWrongMs={diagnosticMode ? DIAGNOSTIC_WRONG_MS : undefined}
            />
          )}
          {currentQuestion.type === 'ox' && (
            <OXChoice
              key={currentIndex}
              question={currentQuestion}
              onAnswer={(ans, correct) => handleAnswer(ans, correct)}
              autoAdvanceCorrectMs={diagnosticMode ? DIAGNOSTIC_CORRECT_MS : undefined}
              autoAdvanceWrongMs={diagnosticMode ? DIAGNOSTIC_WRONG_MS : undefined}
            />
          )}
          {currentQuestion.type === 'fill_in' && (
            <FillInChoice
              key={currentIndex}
              question={currentQuestion}
              onAnswer={(ans, correct) => handleAnswer(ans, correct)}
              autoAdvanceCorrectMs={diagnosticMode ? DIAGNOSTIC_CORRECT_MS : undefined}
              autoAdvanceWrongMs={diagnosticMode ? DIAGNOSTIC_WRONG_MS : undefined}
            />
          )}
          {currentQuestion.type === 'descriptive' && (
            <DescriptiveChoice
              key={currentIndex}
              question={currentQuestion}
              onAnswer={(ans, correct) => handleAnswer(ans, correct)}
            />
          )}
          {currentQuestion.type === 'scenario_composite' && (
            <ScenarioCompositeChoice
              key={currentIndex}
              question={currentQuestion}
              onAnswer={(ans, correct) => handleAnswer(ans, correct)}
            />
          )}
        </CardContent>
      </Card>

      {/* 확신도 + 건너뛰기 */}
      <div className="flex items-center justify-between mt-2">
        <ConfidenceToggle value={confidence} onChange={setConfidence} />
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted"
        >
          건너뛰기 →
        </button>
      </div>
    </div>
  );
}
