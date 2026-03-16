'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import type { QuizQuestion } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { QuizResultScreen, TYPE_LABELS } from './QuizResultScreen';
import type { AnswerRecord } from './QuizResultScreen';
import { ProgressDots, XPToast } from './ProgressDots';
import { CaseContextBox, MultipleChoice, OXChoice, FillInChoice, DescriptiveChoice, ScenarioCompositeChoice } from './QuestionCard';
import { XP_TOAST_CORRECT, XP_TOAST_WRONG, getComboBonus } from '@/lib/xp-constants';
import { SessionSetup, type SessionConfig, type SessionPreset } from './SessionSetup';
import { saveSession, loadSession, clearSession, type SavedSession } from '@/lib/session-recovery';
import { ComboIndicator } from '@/components/quiz/ComboIndicator';
import { ConfidenceToggle } from '@/components/quiz/ConfidenceToggle';
import type { Confidence } from './QuizResultScreen';
import { PenLine, FileText } from 'lucide-react';
import { sortByAdaptiveDifficulty } from '@/lib/adaptive-difficulty';
import { shouldTriggerElaboration } from '@/lib/elaboration';
import ElaborationPrompt from '@/components/quiz/ElaborationPrompt';

// ─── Question type categories ────────────────────────────────────────────────

type QuizTab = 'short' | 'essay';

const SHORT_ANSWER_TYPES = new Set(['multiple', 'ox', 'fill_in']);
const ESSAY_TYPES = new Set(['descriptive', 'scenario_composite']);

// ─── Constants ───────────────────────────────────────────────────────────────

const REVIEW_MIX_RATIO = 0.7; // 빠른 복습 프리셋에서 오답 비율

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Build session questions based on preset configuration */
function buildSession(
  allQuestions: QuizQuestion[],
  reviewQuestions: QuizQuestion[],
  quizHistory: Array<{ questionId: string; isCorrect: boolean; chapter: string }>,
  config: SessionConfig,
  leitnerDueIds?: ReadonlySet<string>,
): QuizQuestion[] {
  const { preset, questionCount, chapters, difficulty } = config;

  // Filter by chapter
  let pool = chapters.length > 0
    ? allQuestions.filter((q) => chapters.includes(q.chapter))
    : allQuestions;

  // Filter by difficulty
  if (difficulty === 'adaptive') {
    pool = sortByAdaptiveDifficulty(pool, quizHistory);
  } else if (difficulty !== 'all') {
    const diffMap: Record<string, number[]> = {
      basic: [1],
      intermediate: [2],
      advanced: [3],
    };
    const levels = diffMap[difficulty] ?? [];
    const filtered = pool.filter((q) => levels.includes(q.difficulty ?? 2));
    if (filtered.length > 0) pool = filtered;
  }

  if (preset === 'review') {
    // 빠른 복습: 오답 + Leitner due 카드 중심 + 나머지 채움
    const reviewMax = Math.ceil(questionCount * REVIEW_MIX_RATIO);
    const reviewIds = new Set(reviewQuestions.map((q) => q.id));
    // Leitner due 카드 중 퀴즈 문제와 매핑 가능한 것 합산
    const leitnerDueQuestions = leitnerDueIds
      ? pool.filter((q) => leitnerDueIds.has(q.id) && !reviewIds.has(q.id))
      : [];
    const mergedReviewPool = [...reviewQuestions, ...leitnerDueQuestions];
    const reviewPool = shuffle(mergedReviewPool).slice(0, reviewMax);
    const selectedIds = new Set(reviewPool.map((q) => q.id));
    const freshPool = pool.filter((q) => !selectedIds.has(q.id));
    const freshPick = shuffle(freshPool).slice(0, questionCount - reviewPool.length);
    return shuffle([...reviewPool, ...freshPick]);
  }

  if (preset === 'weak') {
    // 취약 집중: 정답률 60% 미만 챕터에서 출제
    const chapterAccuracy: Record<string, { correct: number; total: number }> = {};
    for (const r of quizHistory) {
      if (!chapterAccuracy[r.chapter]) chapterAccuracy[r.chapter] = { correct: 0, total: 0 };
      chapterAccuracy[r.chapter].total++;
      if (r.isCorrect) chapterAccuracy[r.chapter].correct++;
    }
    const weakChapters = new Set(
      Object.entries(chapterAccuracy)
        .filter(([, stats]) => stats.total >= 3 && stats.correct / stats.total < 0.6)
        .map(([ch]) => ch)
    );

    if (weakChapters.size > 0) {
      const weakPool = pool.filter((q) => weakChapters.has(q.chapter));
      if (weakPool.length >= questionCount) {
        return shuffle(weakPool).slice(0, questionCount);
      }
      const rest = pool.filter((q) => !weakChapters.has(q.chapter));
      return shuffle([...weakPool, ...shuffle(rest).slice(0, questionCount - weakPool.length)]);
    }
    return shuffle(pool).slice(0, questionCount);
  }

  // 'new': 아직 안 푼 문제 우선
  const answeredIds = new Set(quizHistory.map((r) => r.questionId));
  const newPool = pool.filter((q) => !answeredIds.has(q.id));
  if (newPool.length >= questionCount) {
    return shuffle(newPool).slice(0, questionCount);
  }
  const oldPool = pool.filter((q) => answeredIds.has(q.id));
  return shuffle([...newPool, ...shuffle(oldPool).slice(0, questionCount - newPool.length)]);
}

// ─── Question Nav ────────────────────────────────────────────────────────────

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
  subjectSlug,
  subjectTitle,
  questions,
  chapterMap,
}: {
  subjectSlug: string;
  subjectTitle: string;
  questions: QuizQuestion[];
  chapterMap: Record<string, string>;
}) {
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const quizHistory = useQuizStore((s) => s.quizHistory);
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
    () => wrongNotes
      .filter((n) => !n.mastered && n.question.subject === subjectSlug && typeSet.has(n.question.type))
      .map((n) => n.question),
    [wrongNotes, subjectSlug, typeSet],
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
  const [elaborationQuestion, setElaborationQuestion] = useState<QuizQuestion | null>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordQuizResult = useStudyStore((s) => s.recordQuizResult);
  const addQuizResult = useQuizStore((s) => s.addQuizResult);
  const addWrongNote = useQuizStore((s) => s.addWrongNote);

  // Load saved session on mount
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);
  useEffect(() => {
    setSavedSession(loadSession(subjectSlug));
  }, [subjectSlug]);

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
    addQuizResult({
      questionId: currentQ.id,
      userAnswer: _answer,
      isCorrect,
      timestamp: Date.now(),
      subject: currentQ.subject,
      chapter: currentQ.chapter,
      confidence,
    });

    if (!isCorrect) {
      addWrongNote(currentQ, _answer);
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

    // Check for elaboration trigger
    if (isCorrect && shouldTriggerElaboration(true, currentQ.difficulty ?? 2, confidence)) {
      setElaborationQuestion(currentQ);
      return;
    }

    advanceToNext(updatedAnswers);
  };

  const advanceToNext = (currentAnswers: ReadonlyArray<AnswerRecord>) => {
    const answeredIndices = new Set(currentAnswers.map((a) => a.questionIndex));
    const nextIndex = findNextUnanswered(currentIndex, activeQuestions.length, answeredIndices, skipped);

    if (nextIndex === -1) {
      setPhase('result');
      clearSession();
    } else {
      setCurrentIndex(nextIndex);
    }
  };

  const handleElaborationDone = () => {
    setElaborationQuestion(null);
    advanceToNext(answers);
  };

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

  if (phase === 'result') {
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

      {/* 정교화 질문 */}
      {elaborationQuestion && (
        <div className="mb-4">
          <ElaborationPrompt
            explanation={elaborationQuestion.explanation}
            onComplete={handleElaborationDone}
            onSkip={handleElaborationDone}
          />
        </div>
      )}

      {/* 확신도 + 건너뛰기 */}
      {!elaborationQuestion && (
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

// ─── Utilities ───────────────────────────────────────────────────────────────

function findNextUnanswered(
  currentIndex: number,
  total: number,
  answeredIndices: Set<number>,
  skippedIndices: ReadonlySet<number>
): number {
  for (let i = currentIndex + 1; i < total; i++) {
    if (!answeredIndices.has(i) && !skippedIndices.has(i)) return i;
  }
  for (let i = 0; i < currentIndex; i++) {
    if (!answeredIndices.has(i) && !skippedIndices.has(i)) return i;
  }
  return -1;
}
