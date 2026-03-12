'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Settings2 } from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────────────

export type Difficulty = 'easy' | 'normal' | 'hard' | 'mixed';
export type QuestionCountOption = 5 | 10 | 15 | 20;

export const QUESTION_COUNT_OPTIONS: ReadonlyArray<QuestionCountOption> = [5, 10, 15, 20];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
  mixed: '혼합',
};

export const DIFFICULTY_MAP: Record<Difficulty, ReadonlyArray<1 | 2 | 3> | null> = {
  easy: [1],
  normal: [2],
  hard: [3],
  mixed: null,
};

// ─── Apply Config ───────────────────────────────────────────────────────────

import type { WorksheetConfig } from '@/lib/worksheet-utils';

export function applyConfig(
  ws: WorksheetConfig,
  questionCount: QuestionCountOption,
  difficulty: Difficulty,
): WorksheetConfig {
  const allowedDifficulties = DIFFICULTY_MAP[difficulty];

  const filtered = allowedDifficulties
    ? ws.questions.filter((q) =>
        allowedDifficulties.includes(q.difficulty),
      )
    : ws.questions;

  const sliced = filtered.slice(0, questionCount);

  if (sliced.length === 0) return ws;

  return {
    ...ws,
    questions: sliced,
    questionCount: sliced.length,
  };
}

// ─── Config Step Component ──────────────────────────────────────────────────

export function WorksheetConfigPanel({
  questionCount,
  onQuestionCountChange,
  difficulty,
  onDifficultyChange,
}: {
  questionCount: QuestionCountOption;
  onQuestionCountChange: (count: QuestionCountOption) => void;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
}) {
  return (
    <Card className="mb-6 print:hidden border-dashed">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">문제 설정</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Question count */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              문제 수
            </label>
            <div className="flex gap-2">
              {QUESTION_COUNT_OPTIONS.map((count) => (
                <button
                  key={count}
                  onClick={() => onQuestionCountChange(count)}
                  className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors border ${
                    questionCount === count
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
          {/* Difficulty */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-2">
              난이도
            </label>
            <div className="flex gap-2">
              {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => onDifficultyChange(d)}
                  className={`flex-1 h-11 rounded-lg text-sm font-medium transition-colors border ${
                    difficulty === d
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-foreground border-border hover:bg-muted'
                  }`}
                >
                  {DIFFICULTY_LABELS[d]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
