'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import type { QuizQuestion } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { shuffle } from '@/lib/array-utils';
import { QuizResultScreen, TYPE_LABELS } from './QuizResultScreen';
import type { AnswerRecord } from './QuizResultScreen';
import { ProgressDots, XPToast } from './ProgressDots';
import { CaseContextBox, MultipleChoice, OXChoice, FillInChoice, DescriptiveChoice, ScenarioCompositeChoice } from './QuestionCard';
import { XP_TOAST_CORRECT, XP_TOAST_WRONG, getComboBonus } from '@/lib/study/xp-constants';
import { SessionSetup, type SessionConfig, type SessionPreset } from './SessionSetup';
import { saveSession, loadSession, clearSession, type SavedSession } from '@/lib/quiz/session-recovery';
import { ComboIndicator } from '@/components/quiz/ComboIndicator';
import { ConfidenceToggle } from '@/components/quiz/ConfidenceToggle';
import type { Confidence } from './QuizResultScreen';
import { PenLine, FileText } from 'lucide-react';
// TODO: 정교화 질문 추후 재활성화
// import { shouldTriggerElaboration } from '@/lib/quiz/elaboration';
// import ElaborationPrompt from '@/components/quiz/ElaborationPrompt';
import { DiagnosticReport } from '@/components/quiz/DiagnosticReport';
import type { QuizResult } from '@/types/quiz';
import { buildSession, generateDiagnosticSessionId, findNextUnanswered, DIAGNOSTIC_CORRECT_MS, DIAGNOSTIC_WRONG_MS } from './quiz-session-utils';
import { QuestionNav } from './QuestionNav';

// ─── Question type categories ────────────────────────────────────────────────

type QuizTab = 'short' | 'essay';

const SHORT_ANSWER_TYPES = new Set(['multiple', 'ox', 'fill_in']);
const ESSAY_TYPES = new Set(['descriptive', 'scenario_composite']);

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
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const diagnosticSessions = useQuizStore((s) => s.diagnosticSessions);
  const addDiagnosticSession = useQuizStore((s) => s.addDiagnosticSession);
  const leitnerCards = useLeitnerStore((s) => s.cards);
  const leitnerGetDueCards = useLeitnerStore((s) => s.getDueCards);

  // Leitner due card IDs mapped to quiz question IDs
  const leitnerDueIds = useMemo(() => {
    const dueCards = leitnerGetDueCards(subjectSlug);
    return new Set(
      dueCards
        .map((c) => c.id.startsWith('wrong-') ? c.id.slice(6) : null)
        .filter((id): id is string => id != null)
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps -- leitnerCards triggers recomputation when cards change
  }, [leitnerGetDueCards, subjectSlug, leitnerCards]);

  // Tab state
  const [activeTab, setActiveTab] = useState<QuizTab>('short');

  // Filter questions by tab
  const typeSet = activeTab === 'short' ? SHORT_ANSWER_TYPES : ESSAY_TYPES;

  const filteredQuestions = useMemo(
    () => questions.filter((q) => typeSet.has(q.type)),
    [questions, typeSet],
  );

  const reviewQuestions = useMemo(
    () => {
      const questionMap = new Map(questions.map((q) => [q.id, q]));
      return wrongNotes
        .filter((n) => !n.mastered && n.subject === subjectSlug)
        .map((n) => questionMap.get(n.questionId))
        .filter((q): q is QuizQuestion => q !== undefined && typeSet.has(q.type));
    },
    [wrongNotes, subjectSlug, typeSet, questions],
  );

  const subjectHistory = useMemo(
    () => quizHistory.filter((r) => r.subject === subjectSlug),
    [quizHistory, subjectSlug],
  );

  // Session state
  const [phase, setPhase] = useState<'setup' | 'quiz' | 'result'>('setup');
  const [activeQuestions, setActiveQuestions] = useState<ReadonlyArray<QuizQuestion>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<ReadonlyArray<AnswerRecord>>([]);
  const [skipped, setSkipped] = useState<ReadonlySet<number>>(new Set());
  const [xpEarned, setXpEarned] = useState(0);
  const [xpToast, setXpToast] = useState<{ amount: number; visible: boolean }>({
    amount: 0,
    visible: false,
  });
  const [currentPreset, setCurrentPreset] = useState<SessionPreset>('review');
  const [currentQuestionCount, setCurrentQuestionCount] = useState(10);
  const [comboStreak, setComboStreak] = useState(0);
  const [confidence, setConfidence] = useState<Confidence>('sure');
  // TODO: 정교화 질문 추후 재활성화
  // const [elaborationQuestion, setElaborationQuestion] = useState<QuizQuestion | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordQuizResult = useStudyStore((s) => s.recordQuizResult);
  const addQuizResult = useQuizStore((s) => s.addQuizResult);
  const addWrongNote = useQuizStore((s) => s.addWrongNote);
  const leitnerAddCard = useLeitnerStore((s) => s.addCard);

  // Load saved session on mount
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  useEffect(() => {
    setSavedSession(loadSession(subjectSlug));
  }, [subjectSlug]);

  // diagnosticMode: 세션설정 건너뛰고 자동 시작 (10문제)
  const diagnosticStarted = useRef(false);
  const diagnosticSessionIdRef = useRef<string | null>(null);
  const diagnosticSessionLabelRef = useRef<string | null>(null);
  const diagnosticStartTimeRef = useRef<number>(0);
  useEffect(() => {
    if (!diagnosticMode) return;
    // 이전 저장 세션 제거 (진단 모드는 항상 새로 시작)
    clearSession();
    setSavedSession(null);
  }, [diagnosticMode]);

  useEffect(() => {
    if (!diagnosticMode || diagnosticStarted.current) return;
    if (questions.length === 0) return;
    diagnosticStarted.current = true;

    // 세션 ID 생성
    const { id, label } = generateDiagnosticSessionId(diagnosticSessions);
    diagnosticSessionIdRef.current = id;
    diagnosticSessionLabelRef.current = label;
    diagnosticStartTimeRef.current = Date.now();

    const DIAGNOSTIC_COUNT = 10;
    const allTypeQuestions = [...questions];
    const sessionQuestions = shuffle(allTypeQuestions).slice(0, DIAGNOSTIC_COUNT);
    setActiveQuestions(sessionQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setSkipped(new Set());
    setXpEarned(0);
    setComboStreak(0);
    setPhase('quiz');
  }, [diagnosticMode, questions, diagnosticSessions]);

  const showXPToast = useCallback((amount: number) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
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

  // Auto-save session progress
  useEffect(() => {
    if (phase !== 'quiz' || activeQuestions.length === 0) return;

    saveSession({
      subjectSlug,
      questionIds: activeQuestions.map((q) => q.id),
      answers: answers.map((a) => ({
        questionIndex: a.questionIndex,
        isCorrect: a.isCorrect,
        userAnswer: a.userAnswer,
        confidence: a.confidence,
      })),
      skippedIndices: Array.from(skipped),
      currentIndex,
      xpEarned,
      preset: currentPreset,
      questionCount: currentQuestionCount,
      activeTab,
    });
  }, [phase, activeQuestions, answers, skipped, currentIndex, xpEarned, subjectSlug, currentPreset, currentQuestionCount, activeTab]);

  // ─── Session Start ──────────────────────────────────────────────────────────

  const handleStart = useCallback((config: SessionConfig) => {
    const sessionQuestions = buildSession(
      filteredQuestions,
      reviewQuestions,
      subjectHistory,
      config,
      leitnerDueIds,
    );
    setActiveQuestions(sessionQuestions);
    setCurrentIndex(0);
    setAnswers([]);
    setSkipped(new Set());
    setXpEarned(0);
    setComboStreak(0);
    setCurrentPreset(config.preset);
    setCurrentQuestionCount(config.questionCount);
    setPhase('quiz');
    clearSession();
  }, [filteredQuestions, reviewQuestions, subjectHistory, leitnerDueIds]);

  const handleResume = useCallback(() => {
    if (!savedSession) return;

    const questionMap = new Map(questions.map((q) => [q.id, q]));
    const restored = savedSession.questionIds
      .map((id) => questionMap.get(id))
      .filter((q): q is QuizQuestion => q != null);

    if (restored.length === 0) {
      clearSession();
      setSavedSession(null);
      return;
    }

    setActiveQuestions(restored);
    setAnswers(savedSession.answers.map((a) => ({
      ...a,
      confidence: (a.confidence as Confidence) ?? 'sure',
    })));
    setSkipped(new Set(savedSession.skippedIndices));
    setCurrentIndex(savedSession.currentIndex);
    setXpEarned(savedSession.xpEarned);
    setCurrentPreset(savedSession.preset as SessionPreset);
    setCurrentQuestionCount(savedSession.questionCount);
    if (savedSession.activeTab) {
      setActiveTab(savedSession.activeTab);
    }
    setPhase('quiz');
  }, [savedSession, questions]);

  // ─── Quiz Actions ───────────────────────────────────────────────────────────

  const handleRestart = () => {
    clearSession();
    setSavedSession(null);
    setPhase('setup');
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
    setXpEarned(0);
    setPhase('quiz');
    clearSession();
  };

  const handleAnswer = (_answer: string | number, isCorrect: boolean) => {
    const newAnswer: AnswerRecord = {
      questionIndex: currentIndex,
      isCorrect,
      userAnswer: _answer,
      confidence,
    };
    const updatedAnswers = [...answers, newAnswer];

    recordQuizResult(isCorrect);

    const currentQ = activeQuestions[currentIndex];
    const currentSessionId = diagnosticMode ? diagnosticSessionIdRef.current ?? undefined : undefined;
    addQuizResult({
      questionId: currentQ.id,
      userAnswer: _answer,
      isCorrect,
      timestamp: Date.now(),
      subject: currentQ.subject,
      chapter: currentQ.chapter,
      confidence,
      ...(currentSessionId != null ? { sessionId: currentSessionId } : {}),
    });

    if (!isCorrect) {
      addWrongNote(currentQ, _answer, currentSessionId);

      // Auto-register to Leitner SRS (skip if already exists)
      const cardId = `wrong-${currentQ.id}`;
      if (!leitnerCards.some((c) => c.id === cardId)) {
        leitnerAddCard({
          id: cardId,
          subjectSlug: currentQ.subject,
          question: currentQ.question,
          answer: String(currentQ.answer),
        });
      }
    }

    // Reset confidence for next question
    setConfidence('sure');

    // Combo tracking
    const newCombo = isCorrect ? comboStreak + 1 : 0;
    setComboStreak(newCombo);

    let earned = isCorrect ? XP_TOAST_CORRECT : XP_TOAST_WRONG;
    const combo = isCorrect ? getComboBonus(newCombo) : null;
    if (combo) {
      earned += combo.bonus;
    }
    setXpEarned((prev) => prev + earned);
    showXPToast(earned);

    setAnswers(updatedAnswers);

    // TODO: 정교화 질문 기능 — 추후 재활성화
    // if (isCorrect && shouldTriggerElaboration(true, currentQ.difficulty ?? 2, confidence)) {
    //   setElaborationQuestion(currentQ);
    //   return;
    // }

    advanceToNext(updatedAnswers);
  };

  const advanceToNext = (currentAnswers: ReadonlyArray<AnswerRecord>) => {
    const answeredIndices = new Set(currentAnswers.map((a) => a.questionIndex));
    const nextIndex = findNextUnanswered(currentIndex, activeQuestions.length, answeredIndices, skipped);

    if (nextIndex === -1) {
      // 진단 모드: 세션 메타데이터 저장
      if (diagnosticMode && diagnosticSessionIdRef.current && diagnosticSessionLabelRef.current) {
        const correct = currentAnswers.filter(a => a.isCorrect).length;
        const total = currentAnswers.length;
        // 문제 타입 추정: ox/fill_in (첫 문제 기준)
        const firstQ = activeQuestions[0];
        const sessionType: 'ox' | 'fill_in' =
          firstQ?.type === 'fill_in' ? 'fill_in' : 'ox';

        addDiagnosticSession({
          id: diagnosticSessionIdRef.current,
          label: diagnosticSessionLabelRef.current,
          type: sessionType,
          startedAt: diagnosticStartTimeRef.current,
          completedAt: Date.now(),
          questionIds: activeQuestions.map(q => q.id),
          results: currentAnswers.map(a => {
            const q = activeQuestions[a.questionIndex];
            return {
              questionId: q.id,
              isCorrect: a.isCorrect,
              questionText: q.question.slice(0, 80),
              userAnswer: String(a.userAnswer),
              correctAnswer: String(q.answer),
              explanation: q.explanation?.slice(0, 60),
              subject: q.subject,
            };
          }),
          stats: { total, correct, rate: total > 0 ? Math.round((correct / total) * 100) : 0 },
        });
      }

      setPhase('result');
      clearSession();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  // TODO: 정교화 질문 추후 재활성화
  // const handleElaborationDone = () => {
  //   setElaborationQuestion(null);
  //   advanceToNext(answers);
  // };

  const handleSkip = () => {
    const newSkipped = new Set(skipped);
    newSkipped.add(currentIndex);
    setSkipped(newSkipped);

    const answeredIndices = new Set(answers.map((a) => a.questionIndex));
    const nextIndex = findNextUnanswered(currentIndex, activeQuestions.length, answeredIndices, newSkipped);

    if (nextIndex === -1) {
      setPhase('result');
      clearSession();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleJump = (index: number) => {
    const answeredIndices = new Set(answers.map((a) => a.questionIndex));
    if (!answeredIndices.has(index)) {
      setCurrentIndex(index);
    }
  };

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

      {/* TODO: 정교화 질문 기능 — 추후 재활성화
      {elaborationQuestion && (
        <div className="mb-4">
          <ElaborationPrompt
            explanation={elaborationQuestion.explanation}
            onComplete={handleElaborationDone}
            onSkip={handleElaborationDone}
          />
        </div>
      )}
      */}

      {/* 확신도 + 건너뛰기 */}
      {(
        <div className="flex items-center justify-between mt-2">
          <ConfidenceToggle value={confidence} onChange={setConfidence} />
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-muted"
          >
            건너뛰기 →
          </button>
        </div>
      )}
    </div>
  );
}

