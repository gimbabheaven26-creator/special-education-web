'use client';

import { useState, useMemo } from 'react';
import type { QuizQuestion } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { RefreshCw, Target, Sparkles, ChevronDown, ChevronUp, Play, Zap } from 'lucide-react';
import type { SavedSession } from '@/lib/session-recovery';
import { getSubjectProficiency, getProficiencyLabel } from '@/lib/adaptive-difficulty';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SessionPreset = 'review' | 'weak' | 'new';

export interface SessionConfig {
  preset: SessionPreset;
  questionCount: number;
  chapters: string[];
  difficulty: 'all' | 'basic' | 'intermediate' | 'advanced' | 'adaptive';
}

interface SessionSetupProps {
  subjectSlug: string;
  subjectTitle: string;
  questions: QuizQuestion[];
  chapterMap: Record<string, string>;
  savedSession: SavedSession | null;
  onStart: (config: SessionConfig) => void;
  onResume: () => void;
}

// ─── Preset definitions ───────────────────────────────────────────────────────

const PRESETS: Array<{
  id: SessionPreset;
  icon: typeof RefreshCw;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: 'review',
    icon: RefreshCw,
    label: '빠른 복습',
    description: '오답 + Leitner 카드 중심',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-800',
  },
  {
    id: 'weak',
    icon: Target,
    label: '취약 집중',
    description: '정답률 낮은 챕터 집중',
    color: 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'new',
    icon: Sparkles,
    label: '새 문제 탐색',
    description: '아직 안 푼 문제 우선',
    color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800',
  },
];

const QUESTION_COUNTS = [5, 10, 20] as const;

const DIFFICULTY_OPTIONS: Array<{ value: SessionConfig['difficulty']; label: string; icon?: typeof Zap }> = [
  { value: 'all', label: '전체' },
  { value: 'adaptive', label: '적응형', icon: Zap },
  { value: 'basic', label: '기초' },
  { value: 'intermediate', label: '중급' },
  { value: 'advanced', label: '심화' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function SessionSetup({
  subjectSlug,
  subjectTitle,
  questions,
  chapterMap,
  savedSession,
  onStart,
  onResume,
}: SessionSetupProps) {
  const [preset, setPreset] = useState<SessionPreset>('review');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<SessionConfig['difficulty']>('all');

  const quizHistory = useQuizStore((s) => s.quizHistory);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const leitnerCards = useLeitnerStore((s) => s.cards);
  const leitnerGetDueCards = useLeitnerStore((s) => s.getDueCards);

  // Leitner due count for this subject
  const leitnerDueCount = useMemo(() => {
    const dueCards = leitnerGetDueCards(subjectSlug);
    return dueCards.filter((c) => c.id.startsWith('wrong-')).length;
  }, [leitnerGetDueCards, subjectSlug, leitnerCards]);

  // Subject proficiency
  const proficiency = useMemo(
    () => getSubjectProficiency(subjectSlug, quizHistory),
    [subjectSlug, quizHistory],
  );

  // Stats for this subject
  const subjectStats = useMemo(() => {
    const subjectHistory = quizHistory.filter((r) => r.subject === subjectSlug);
    const answeredIds = new Set(subjectHistory.map((r) => r.questionId));
    const wrongCount = wrongNotes.filter(
      (n) => !n.mastered && n.subject === subjectSlug
    ).length;

    // Chapter accuracy
    const chapterAccuracy: Record<string, { correct: number; total: number }> = {};
    for (const r of subjectHistory) {
      const ch = r.chapter;
      if (!chapterAccuracy[ch]) chapterAccuracy[ch] = { correct: 0, total: 0 };
      chapterAccuracy[ch].total++;
      if (r.isCorrect) chapterAccuracy[ch].correct++;
    }

    const weakChapters = Object.entries(chapterAccuracy)
      .filter(([, stats]) => stats.total >= 3 && stats.correct / stats.total < 0.6)
      .map(([ch]) => ch);

    return {
      totalAnswered: answeredIds.size,
      totalQuestions: questions.length,
      wrongCount,
      newCount: questions.length - answeredIds.size,
      weakChapters,
    };
  }, [quizHistory, wrongNotes, subjectSlug, questions]);

  // Available chapters for filter
  const chapters = useMemo(() => {
    const chapterSlugs = Array.from(new Set(questions.map((q) => q.chapter)));
    return chapterSlugs.map((slug) => ({
      slug,
      title: chapterMap[slug] || slug,
    }));
  }, [questions, chapterMap]);

  const toggleChapter = (slug: string) => {
    setSelectedChapters((prev) =>
      prev.includes(slug)
        ? prev.filter((s) => s !== slug)
        : [...prev, slug]
    );
  };

  const handleStart = () => {
    onStart({
      preset,
      questionCount,
      chapters: selectedChapters,
      difficulty,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">{subjectTitle} 퀴즈</h1>
          {proficiency.totalAttempts >= 3 && (
            <Badge className={`text-xs ${proficiency.color}`}>
              {getProficiencyLabel(proficiency.level)}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          전체 {subjectStats.totalQuestions}문제 중 {subjectStats.totalAnswered}문제 풀었어요
          {proficiency.totalAttempts >= 3 && (
            <span> · 정답률 {Math.round(proficiency.accuracy * 100)}%</span>
          )}
        </p>
      </div>

      {/* Resume saved session */}
      {savedSession && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">이전 세션이 있어요</p>
                <p className="text-xs text-muted-foreground">
                  {savedSession.answers.length}/{savedSession.questionIds.length}문제 진행
                </p>
              </div>
              <Button size="sm" onClick={onResume} className="gap-1.5">
                <Play className="h-3.5 w-3.5" />
                이어서 풀기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Presets */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">학습 모드</h2>
        <div className="grid gap-3">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isActive = preset === p.id;
            const count =
              p.id === 'review'
                ? subjectStats.wrongCount + leitnerDueCount
                : p.id === 'weak'
                  ? subjectStats.weakChapters.length
                  : subjectStats.newCount;

            return (
              <button
                key={p.id}
                onClick={() => setPreset(p.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                  isActive
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${p.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{p.label}</span>
                    {count > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {count}{p.id === 'weak' ? '챕터' : '문제'}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question count */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">문제 수</h2>
        <div className="flex gap-2">
          {QUESTION_COUNTS.map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                questionCount === count
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {count}문제
            </button>
          ))}
        </div>
      </div>

      {/* Advanced options toggle */}
      <button
        onClick={() => setShowOptions((prev) => !prev)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showOptions ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        추가 옵션
      </button>

      {showOptions && (
        <div className="space-y-4 pl-1">
          {/* Difficulty */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-muted-foreground">난이도</h3>
            <div className="flex gap-2 flex-wrap">
              {DIFFICULTY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDifficulty(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    difficulty === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter filter */}
          {chapters.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-muted-foreground">챕터 선택</h3>
                {selectedChapters.length > 0 && (
                  <button
                    onClick={() => setSelectedChapters([])}
                    className="text-xs text-primary hover:underline"
                  >
                    전체 선택
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {chapters.map((ch) => {
                  const isSelected =
                    selectedChapters.length === 0 || selectedChapters.includes(ch.slug);
                  return (
                    <button
                      key={ch.slug}
                      onClick={() => toggleChapter(ch.slug)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all truncate max-w-[200px] ${
                        isSelected
                          ? 'bg-primary/10 text-primary border border-primary/30'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {ch.title}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                선택하지 않으면 전체 챕터에서 출제
              </p>
            </div>
          )}
        </div>
      )}

      {/* Start button */}
      <Button
        onClick={handleStart}
        size="lg"
        className="w-full gap-2 min-h-[48px] text-base"
      >
        <Play className="h-5 w-5" />
        퀴즈 시작
      </Button>
    </div>
  );
}
