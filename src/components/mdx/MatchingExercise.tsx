'use client';

import { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MatchItem {
  readonly term: string;
  readonly definition: string;
}

interface MatchingExerciseProps {
  readonly title?: string;
  readonly items: readonly MatchItem[];
}

function shuffleArray<T>(arr: readonly T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

export default function MatchingExercise({ title = '용어 매칭', items }: MatchingExerciseProps) {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);

  const shuffledDefs = useMemo(() => {
    if (!items || !Array.isArray(items)) return [];
    const indexed = items.map((item, i) => ({ ...item, originalIndex: i }));
    return shuffleArray(indexed);
  }, [items]);

  const handleTermClick = useCallback((index: number) => {
    if (checked) return;
    setSelectedTerm((prev) => (prev === index ? null : index));
  }, [checked]);

  const handleDefClick = useCallback((defIndex: number) => {
    if (checked || selectedTerm === null) return;
    setMatches((prev) => ({ ...prev, [selectedTerm]: defIndex }));
    setSelectedTerm(null);
  }, [checked, selectedTerm]);

  const handleCheck = () => setChecked(true);

  const handleReset = () => {
    setSelectedTerm(null);
    setMatches({});
    setChecked(false);
  };

  if (!items || !Array.isArray(items)) return null;

  const correctCount = checked
    ? Object.entries(matches).filter(
        ([termIdx, defIdx]) => shuffledDefs[defIdx].originalIndex === Number(termIdx),
      ).length
    : 0;

  const allMatched = Object.keys(matches).length === items.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {!checked && (
          <p className="text-xs text-muted-foreground">
            왼쪽 용어를 선택한 후 오른쪽 정의를 탭하여 연결하세요.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Terms column */}
          <div className="space-y-2">
            {items.map((item, i) => {
              const isSelected = selectedTerm === i;
              const isMatched = i in matches;
              let borderClass = 'border-border';
              if (checked && isMatched) {
                const correct = shuffledDefs[matches[i]].originalIndex === i;
                borderClass = correct
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-950/20';
              } else if (isSelected) {
                borderClass = 'border-primary ring-1 ring-primary/30';
              } else if (isMatched) {
                borderClass = 'border-primary/40 bg-primary/5';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleTermClick(i)}
                  disabled={checked}
                  className={`w-full p-3 rounded-lg border-2 text-left text-sm font-medium transition-all ${borderClass} disabled:cursor-default`}
                >
                  {item.term}
                </button>
              );
            })}
          </div>

          {/* Definitions column */}
          <div className="space-y-2">
            {shuffledDefs.map((def, i) => {
              const matchedByTerm = Object.entries(matches).find(([, v]) => v === i);
              const isUsed = !!matchedByTerm;
              let borderClass = 'border-border';
              if (checked && isUsed) {
                const termIdx = Number(matchedByTerm[0]);
                const correct = def.originalIndex === termIdx;
                borderClass = correct
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/20'
                  : 'border-red-500 bg-red-50 dark:bg-red-950/20';
              } else if (isUsed) {
                borderClass = 'border-primary/40 bg-primary/5';
              }

              return (
                <button
                  key={i}
                  onClick={() => handleDefClick(i)}
                  disabled={checked || selectedTerm === null}
                  className={`w-full p-3 rounded-lg border-2 text-left text-sm transition-all ${borderClass} disabled:cursor-default`}
                >
                  {def.definition}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result */}
        {checked && (
          <div className="text-center text-sm">
            <p className={correctCount === items.length ? 'text-green-600 font-semibold' : 'text-amber-600'}>
              {correctCount}/{items.length} 정답
              {correctCount === items.length && ' — 완벽합니다!'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!checked && allMatched && (
            <Button onClick={handleCheck} size="sm" className="flex-1 min-h-[44px]">
              정답 확인
            </Button>
          )}
          {checked && (
            <Button onClick={handleReset} variant="outline" size="sm" className="flex-1 min-h-[44px]">
              다시 풀기
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
