'use client';

import type { WorksheetConfig, WorksheetQuestion } from '@/lib/worksheet-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, RefreshCw } from 'lucide-react';
import { QuestionSlide, type GradeResult } from './QuestionSlide';

// ─── Score Ring ──────────────────────────────────────────────────────────────

function ScoreRing({
  score,
  maxScore,
  correct,
  total,
}: {
  score: number;
  maxScore: number;
  correct: number;
  total: number;
}) {
  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference - (circumference * percentage) / 100;

  const ringColor =
    percentage >= 80
      ? 'text-emerald-500'
      : percentage >= 60
      ? 'text-amber-500'
      : 'text-red-500';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            strokeWidth="8"
            className="stroke-muted"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className={`${ringColor} transition-all duration-700 ease-out`}
            style={{ stroke: 'currentColor' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          <span className="text-xs text-muted-foreground">
            {score}/{maxScore}점
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        {correct}/{total}문제 정답
      </p>
    </div>
  );
}

// ─── Solver Review ──────────────────────────────────────────────────────────

export interface ScoreInfo {
  correct: number;
  total: number;
  score: number;
  maxScore: number;
  hasUngraded: boolean;
}

export interface SolverReviewProps {
  worksheet: WorksheetConfig;
  subjectTitle: string;
  questions: WorksheetQuestion[];
  userAnswers: Record<string, string>;
  grades: Record<string, GradeResult>;
  scoreInfo: ScoreInfo;
  onSelfGrade: (questionId: string, correct: boolean) => void;
  onRetry: () => void;
  onNewWorksheet: () => void;
}

export function SolverReview({
  worksheet,
  subjectTitle,
  questions,
  userAnswers,
  grades,
  scoreInfo,
  onSelfGrade,
  onRetry,
  onNewWorksheet,
}: SolverReviewProps) {
  return (
    <div className="space-y-6">
      {/* Score Summary */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreRing
              score={scoreInfo.score}
              maxScore={scoreInfo.maxScore}
              correct={scoreInfo.correct}
              total={scoreInfo.total}
            />
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-foreground mb-1">채점 결과</h3>
              <p className="text-sm text-muted-foreground mb-1">
                {subjectTitle} &gt; {worksheet.topicName}
              </p>
              <p className="text-sm text-muted-foreground">
                학습지 {worksheet.id} ·{' '}
                <Badge variant="outline" className="text-xs">
                  {worksheet.type === 'fill_in'
                    ? '기입형'
                    : worksheet.type === 'descriptive'
                    ? '서술형'
                    : '혼합'}
                </Badge>
              </p>
              {scoreInfo.hasUngraded && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  서술형 문제는 아래에서 자기 채점해주세요
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action buttons at top */}
      <div className="flex gap-3">
        <Button variant="outline" size="sm" onClick={onRetry} className="min-h-[44px]">
          <RotateCcw className="h-4 w-4 mr-1.5" />
          다시 풀기
        </Button>
        <Button variant="outline" size="sm" onClick={onNewWorksheet} className="min-h-[44px]">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          새 문제지
        </Button>
      </div>

      {/* All questions in review mode */}
      <div className="space-y-4">
        {questions.map((q, idx) => (
          <QuestionSlide
            key={q.id}
            question={q}
            index={idx}
            total={questions.length}
            answer={userAnswers[q.id] || ''}
            onAnswerChange={() => {}}
            isReview={true}
            grade={grades[q.id]}
            onSelfGrade={(correct) => onSelfGrade(q.id, correct)}
          />
        ))}
      </div>

      {/* Bottom action buttons */}
      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onRetry} className="min-h-[44px]">
          <RotateCcw className="h-4 w-4 mr-1.5" />
          다시 풀기
        </Button>
        <Button variant="outline" onClick={onNewWorksheet} className="min-h-[44px]">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          새 문제지
        </Button>
      </div>
    </div>
  );
}
