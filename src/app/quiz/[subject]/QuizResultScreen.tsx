'use client';

import Link from 'next/link';
import type { QuizQuestion } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, XCircle, BookOpen } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnswerRecord {
  questionIndex: number;
  isCorrect: boolean;
  userAnswer: string | number;
}

type QuestionTypeLabel = 'multiple' | 'ox' | 'fill_in';

export const TYPE_LABELS: Record<QuestionTypeLabel, string> = {
  multiple: '객관식',
  ox: 'OX퀴즈',
  fill_in: '단답형',
};

// ─── Circular Progress Ring (SVG) ────────────────────────────────────────────

function CircularProgressRing({
  percentage,
  size = 140,
  strokeWidth = 10,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage >= 80
      ? 'stroke-emerald-500'
      : percentage >= 60
        ? 'stroke-amber-500'
        : 'stroke-red-500';

  return (
    <svg width={size} height={size} className="mx-auto">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className="stroke-muted"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        className={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="fill-current text-3xl font-bold"
      >
        {percentage}%
      </text>
    </svg>
  );
}

// ─── Color Utility ───────────────────────────────────────────────────────────

function rateColorClass(rate: number): string {
  if (rate >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (rate >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

// ─── Quiz Result Screen ──────────────────────────────────────────────────────

export function QuizResultScreen({
  questions,
  answers,
  totalXPEarned,
  subjectSlug,
  chapterMap,
  onRestart,
  onRetryWrong,
}: {
  questions: ReadonlyArray<QuizQuestion>;
  answers: ReadonlyArray<AnswerRecord>;
  totalXPEarned: number;
  subjectSlug: string;
  chapterMap: Record<string, string>;
  onRestart: () => void;
  onRetryWrong: () => void;
}) {
  const total = questions.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const rate = Math.round((correctCount / total) * 100);
  const wrongCount = total - correctCount;

  // Chapter breakdown
  const chapterBreakdown = questions.reduce<
    Record<string, { total: number; correct: number }>
  >((acc, q, i) => {
    const chapter = q.chapter;
    const prev = acc[chapter] ?? { total: 0, correct: 0 };
    const answerRecord = answers.find((a) => a.questionIndex === i);
    return {
      ...acc,
      [chapter]: {
        total: prev.total + 1,
        correct: prev.correct + (answerRecord?.isCorrect ? 1 : 0),
      },
    };
  }, {});

  // Type breakdown
  const typeBreakdown = questions.reduce<
    Record<string, { total: number; correct: number }>
  >((acc, q, i) => {
    const type = q.type;
    const prev = acc[type] ?? { total: 0, correct: 0 };
    const answerRecord = answers.find((a) => a.questionIndex === i);
    return {
      ...acc,
      [type]: {
        total: prev.total + 1,
        correct: prev.correct + (answerRecord?.isCorrect ? 1 : 0),
      },
    };
  }, {});

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score Ring */}
      <div className="text-center mb-6">
        <div className="scale-90 sm:scale-100">
          <CircularProgressRing percentage={rate} />
        </div>
        <p className="mt-3 text-lg text-muted-foreground">
          {total}문제 중 <span className="font-bold text-foreground">{correctCount}문제</span> 정답
        </p>
        {rate >= 80 ? (
          <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-medium">
            대단해요! 꾸준한 학습이 빛을 발하고 있어요.
          </p>
        ) : rate >= 60 ? (
          <p className="mt-1 text-amber-600 dark:text-amber-400 font-medium">
            잘 하고 있어요! 이 부분을 마스터하는 중이에요.
          </p>
        ) : (
          <p className="mt-1 text-red-600 dark:text-red-400 font-medium">
            아직 익히는 중이에요. 한 번 더 도전하면 달라질 거에요!
          </p>
        )}
      </div>

      {/* XP Earned */}
      <div className="mb-6 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-4 py-2 text-sm font-bold text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
          +{totalXPEarned} XP 획득
        </span>
      </div>

      {/* Chapter Breakdown */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">챕터별 분석</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(chapterBreakdown).map(([chapter, stats]) => {
            const chapterRate = Math.round((stats.correct / stats.total) * 100);
            const chapterTitle = chapterMap[chapter] || chapter;
            return (
              <div key={chapter} className="flex items-center justify-between text-sm gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate text-muted-foreground">{chapterTitle}</span>
                  <Link
                    href={`/subjects/${subjectSlug}/${chapter}`}
                    className="shrink-0 text-primary hover:text-primary/80 transition-colors"
                    title="챕터 보기"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <span className={`font-medium flex-shrink-0 ${rateColorClass(chapterRate)}`}>
                  {stats.correct}/{stats.total} ({chapterRate}%)
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Type Breakdown */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">유형별 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            {Object.entries(typeBreakdown).map(([type, stats]) => {
              const typeRate = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={type} className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">
                    {TYPE_LABELS[type as QuestionTypeLabel] ?? type}
                  </p>
                  <p className={`text-lg font-bold ${rateColorClass(typeRate)}`}>
                    {typeRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stats.correct}/{stats.total}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {wrongCount > 0 && (
          <Button onClick={onRetryWrong} variant="outline" className="flex items-center gap-2 min-h-[44px]">
            <XCircle className="h-4 w-4" />
            틀린 문제 다시 풀기 ({wrongCount}문제)
          </Button>
        )}
        <Button onClick={onRestart} className="flex items-center gap-2 min-h-[44px]">
          <RotateCcw className="h-4 w-4" />
          다시 풀기
        </Button>
        <Link
          href="/quiz"
          className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background text-sm font-medium whitespace-nowrap transition-all min-h-[44px] gap-1.5 px-3 hover:bg-muted hover:text-foreground"
        >
          과목 목록
        </Link>
      </div>
    </div>
  );
}
