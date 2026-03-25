'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { QuizQuestion, Confidence } from '@/types/quiz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RotateCcw, XCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { getConceptUrl } from '@/lib/concept-urls';

// ─── Score Tiers ─────────────────────────────────────────────────────────────

const SCORE_TIERS = [
  { min: 91, color: 'text-emerald-600 dark:text-emerald-400', message: '거의 완벽해요! 다른 영역도 도전해볼까요?' },
  { min: 61, color: 'text-emerald-600 dark:text-emerald-400', message: '잘하고 있어요! 놓친 몇 문제만 정리하면 이 영역은 거의 완성이에요.' },
  { min: 31, color: 'text-amber-600 dark:text-amber-400', message: '감이 잡히기 시작했어요! 틀린 문제를 중심으로 다시 보면 빠르게 오를 거예요.' },
  { min: 0, color: 'text-red-600 dark:text-red-400', message: '아직 익숙하지 않은 영역이에요. 괜찮아요, 틀린 문제부터 다시 보면 금방 감이 올 거예요.' },
];

// ─── Types ───────────────────────────────────────────────────────────────────

export type { Confidence };

export interface AnswerRecord {
  questionIndex: number;
  isCorrect: boolean;
  userAnswer: string | number;
  confidence?: Confidence;
}

type QuestionTypeLabel = 'multiple' | 'ox' | 'fill_in' | 'descriptive' | 'scenario_composite';

export const TYPE_LABELS: Record<QuestionTypeLabel, string> = {
  multiple: '객관식',
  ox: 'OX퀴즈',
  fill_in: '단답형',
  descriptive: '서술형',
  scenario_composite: '시나리오형',
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

// ─── Question Review Section ─────────────────────────────────────────────────

function QuestionReviewSection({
  questions,
  answers,
}: {
  questions: ReadonlyArray<QuizQuestion>;
  answers: ReadonlyArray<AnswerRecord>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const answerMap = new Map(answers.map((a) => [a.questionIndex, a]));

  return (
    <Card className="mb-6">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
        aria-label={isOpen ? '전체 문제 리뷰 접기' : '전체 문제 리뷰 펼치기'}
      >
        <span className="text-sm font-semibold">전체 문제 리뷰</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && (
        <CardContent className="pt-0 space-y-4">
          {questions.map((q, i) => {
            const record = answerMap.get(i);
            const isSkipped = !record;
            const isCorrect = record?.isCorrect ?? false;

            return (
              <div
                key={q.id}
                className="rounded-lg border p-4 space-y-2"
              >
                {/* 문제 번호 + 정답 여부 */}
                <div className="flex items-start gap-2">
                  <span className="shrink-0 text-lg leading-none">
                    {isSkipped ? '⏭️' : isCorrect ? '✅' : '❌'}
                  </span>
                  <p className="text-sm font-medium leading-relaxed">
                    <span className="text-muted-foreground mr-1">{i + 1}.</span>
                    {q.question}
                  </p>
                </div>

                {/* 답변 정보 */}
                <div className="ml-7 space-y-1 text-sm">
                  {isSkipped ? (
                    <p className="text-muted-foreground italic">건너뜀</p>
                  ) : (
                    <>
                      <p>
                        <span className="text-muted-foreground">내 답변: </span>
                        <span className={isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                          {formatAnswer(record.userAnswer, q)}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p>
                          <span className="text-muted-foreground">정답: </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatAnswer(q.answer, q)}
                          </span>
                        </p>
                      )}
                    </>
                  )}
                  {/* 해설 */}
                  {q.explanation && (
                    <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
                      💡 {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}

/** 객관식 번호 답변을 보기 텍스트로 변환 */
function formatAnswer(answer: string | number, question: QuizQuestion): string {
  if (question.type === 'multiple' && question.options && typeof answer === 'number') {
    const optionText = question.options[answer - 1];
    return optionText ? `${answer}. ${optionText}` : String(answer);
  }
  if (question.type === 'ox') {
    if (answer === 'O' || answer === 'o') return 'O';
    if (answer === 'X' || answer === 'x') return 'X';
  }
  return String(answer);
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
  const answeredCount = answers.length;
  const correctCount = answers.filter((a) => a.isCorrect).length;
  const wrongAnswerCount = answers.filter((a) => !a.isCorrect).length;
  const rate = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

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
          {answeredCount > 0
            ? <>{answeredCount}문제 중 <span className="font-bold text-foreground">{correctCount}문제</span> 정답</>
            : '풀이한 문제가 없습니다'}
          {total - answeredCount > 0 && (
            <span className="text-sm ml-1">({total - answeredCount}문제 건너뜀)</span>
          )}
        </p>
        {(() => {
          const tier = SCORE_TIERS.find((t) => rate >= t.min);
          if (!tier) return null;
          return (
            <p className={`mt-1 font-medium ${tier.color}`}>
              {tier.message}
            </p>
          );
        })()}
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
                    href={getConceptUrl(subjectSlug)}
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

      {/* Question Review */}
      <QuestionReviewSection questions={questions} answers={answers} />

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap justify-center">
        {wrongAnswerCount > 0 && (
          <Button onClick={onRetryWrong} variant="outline" className="flex items-center gap-2 min-h-[44px]">
            <XCircle className="h-4 w-4" />
            틀린 문제 다시 풀기 ({wrongAnswerCount}문제)
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
