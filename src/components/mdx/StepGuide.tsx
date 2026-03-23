'use client';

import { useCallback, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Step {
  readonly title: string;
  readonly content: string;
  readonly checklist?: readonly string[];
}

interface StepGuideProps {
  readonly title?: string;
  readonly steps: readonly Step[];
}

export default function StepGuide({ title = '절차 가이드', steps }: StepGuideProps) {
  const [openStep, setOpenStep] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleStep = useCallback((index: number) => {
    setOpenStep((prev) => (prev === index ? null : index));
  }, []);

  const toggleCheck = useCallback((key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  if (!steps) return null;

  const totalChecks = steps.reduce(
    (sum, step) => sum + (step.checklist?.length ?? 0),
    0,
  );
  const completedChecks = Object.values(checkedItems).filter(Boolean).length;
  const allComplete = totalChecks > 0 && completedChecks === totalChecks;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          {totalChecks > 0 && (
            <Badge
              variant={allComplete ? 'default' : 'outline'}
              className={allComplete ? 'bg-green-600' : ''}
            >
              {allComplete ? '완료!' : `${completedChecks}/${totalChecks}`}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          각 단계를 클릭하여 상세 내용을 확인하세요.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {steps.map((step, i) => {
          const isOpen = openStep === i;
          const stepChecks = step.checklist ?? [];
          const stepComplete =
            stepChecks.length > 0 &&
            stepChecks.every((_, j) => checkedItems[`${i}-${j}`]);

          return (
            <div
              key={i}
              className={`rounded-lg border transition-all ${
                isOpen ? 'border-primary/50' : 'border-border'
              }`}
            >
              {/* Step header */}
              <button
                onClick={() => toggleStep(i)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <span
                  className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    stepComplete
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : isOpen
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {stepComplete ? '✓' : i + 1}
                </span>
                <span className="flex-1 text-sm font-medium">{step.title}</span>
                <span className="text-muted-foreground text-xs">
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>

              {/* Step content (accordion) */}
              {isOpen && (
                <div className="px-3 pb-3 space-y-3">
                  <div className="ml-10 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {step.content}
                  </div>

                  {/* Checklist */}
                  {stepChecks.length > 0 && (
                    <div className="ml-10 space-y-1.5">
                      {stepChecks.map((item, j) => {
                        const key = `${i}-${j}`;
                        const isChecked = !!checkedItems[key];

                        return (
                          <label
                            key={j}
                            className="flex items-start gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCheck(key)}
                              className="mt-0.5 w-4 h-4 rounded border-muted-foreground/30 accent-primary"
                            />
                            <span
                              className={`text-sm ${
                                isChecked
                                  ? 'text-muted-foreground line-through'
                                  : ''
                              }`}
                            >
                              {item}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
