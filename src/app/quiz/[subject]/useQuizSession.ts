'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { shuffle } from '@/lib/array-utils';
import type { AnswerRecord } from './QuizResultScreen';
import { XP_TOAST_CORRECT, XP_TOAST_WRONG, getComboBonus } from '@/lib/study/xp-constants';
import type { SessionConfig, SessionPreset } from './SessionSetup';
import { saveSession, loadSession, clearSession, type SavedSession } from '@/lib/quiz/session-recovery';
import { buildSession, generateDiagnosticSessionId, findNextUnanswered } from './quiz-session-utils';

export type QuizTab = 'short' | 'essay';

const SHORT_ANSWER_TYPES = new Set(['multiple', 'ox', 'fill_in']);
const ESSAY_TYPES = new Set(['descriptive', 'scenario_composite']);

interface UseQuizSessionParams {
  subjectSlug: string;
  questions: QuizQuestion[];
  diagnosticMode?: boolean;
}

export function useQuizSession({ subjectSlug, questions, diagnosticMode }: UseQuizSessionParams) {
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
    clearSession();
    setSavedSession(null);
  }, [diagnosticMode]);

  useEffect(() => {
    if (!diagnosticMode || diagnosticStarted.current) return;
    if (questions.length === 0) return;
    diagnosticStarted.current = true;

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
      questionIndex: a.questionIndex,
      isCorrect: a.isCorrect,
      userAnswer: a.userAnswer,
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

  const advanceToNext = (currentAnswers: ReadonlyArray<AnswerRecord>) => {
    const answeredIndices = new Set(currentAnswers.map((a) => a.questionIndex));
    const nextIndex = findNextUnanswered(currentIndex, activeQuestions.length, answeredIndices, skipped);

    if (nextIndex === -1) {
      // 진단 모드: 세션 메타데이터 저장
      if (diagnosticMode && diagnosticSessionIdRef.current && diagnosticSessionLabelRef.current) {
        const correct = currentAnswers.filter(a => a.isCorrect).length;
        const total = currentAnswers.length;
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

  const handleAnswer = (_answer: string | number, isCorrect: boolean) => {
    const newAnswer: AnswerRecord = {
      questionIndex: currentIndex,
      isCorrect,
      userAnswer: _answer,
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
    advanceToNext(updatedAnswers);
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

  return {
    // State
    phase,
    activeTab,
    setActiveTab,
    activeQuestions,
    currentIndex,
    answers,
    xpEarned,
    xpToast,
    comboStreak,
    savedSession,
    filteredQuestions,

    // Actions
    handleStart,
    handleResume,
    handleRestart,
    handleRetryWrong,
    handleAnswer,
    handleSkip,
    handleJump,
  };
}
