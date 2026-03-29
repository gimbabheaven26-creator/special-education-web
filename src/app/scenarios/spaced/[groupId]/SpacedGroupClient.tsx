'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScenarioGroup } from '@/types/scenario';
import { getScenarioById } from '@/data/scenarios';
import { useStudyStore } from '@/stores/useStudyStore';
import {
  createSchedule,
  isDueToday,
  isGroupComplete,
  getNextScenarioId,
  daysUntilReview,
} from '@/lib/study/spaced-scenario';

interface SpacedGroupClientProps {
  readonly group: ScenarioGroup;
}

const DIFFICULTY_COLORS: Record<number, string> = {
  1: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  2: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  3: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: '기초',
  2: '중급',
  3: '심화',
};

export default function SpacedGroupClient({ group }: SpacedGroupClientProps) {
  const spacedSchedules = useStudyStore((s) => s.spacedScenarioSchedules);
  const scenarioProgress = useStudyStore((s) => s.scenarioProgress);
  const saveSpacedSchedule = useStudyStore((s) => s.saveSpacedSchedule);

  const schedule = spacedSchedules[group.groupId];
  const isStarted = !!schedule;
  const complete = schedule ? isGroupComplete(schedule, group) : false;
  const dueToday = schedule ? isDueToday(schedule) : false;
  const nextId = schedule ? getNextScenarioId(schedule, group) : group.scenarioIds[0];
  const daysLeft = schedule ? daysUntilReview(schedule) : 0;

  const scenarios = useMemo(
    () => group.scenarioIds.map((id) => getScenarioById(id)).filter(Boolean),
    [group.scenarioIds],
  );

  const handleStart = () => {
    const newSchedule = createSchedule(group.groupId);
    saveSpacedSchedule(newSchedule);
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔄</span>
          <h1 className="text-2xl font-bold tracking-tight">{group.principle}</h1>
        </div>
        <p className="text-muted-foreground text-sm">{group.description}</p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">학습 현황</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isStarted ? (
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                아직 시작하지 않았습니다. {group.scenarioIds.length}개 시나리오를 간격을 두고 반복 학습합니다.
              </p>
              <Button onClick={handleStart} size="lg" className="min-h-[44px]">
                학습 시작하기
              </Button>
            </div>
          ) : complete ? (
            <div className="text-center space-y-2">
              <p className="text-2xl">🎉</p>
              <p className="font-semibold">모든 시나리오를 완료했습니다!</p>
              <p className="text-sm text-muted-foreground">
                {group.scenarioIds.length}개 시나리오를 간격반복으로 학습 완료
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Progress bar */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round((schedule.completedScenarioIds.length / group.scenarioIds.length) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-medium shrink-0">
                  {schedule.completedScenarioIds.length}/{group.scenarioIds.length}
                </span>
              </div>

              {/* Schedule info */}
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">현재 간격:</span>
                  <Badge variant="outline">{schedule.intervalDays}일</Badge>
                </div>
                {dueToday ? (
                  <Badge className="bg-primary/10 text-primary border-primary/20">
                    오늘 복습 가능!
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">
                    다음 복습: {daysLeft}일 후
                  </span>
                )}
              </div>

              {/* Action */}
              {dueToday && nextId && (
                <Button
                  render={<Link href={`/scenarios/${nextId}`} />}
                  size="lg"
                  className="w-full min-h-[44px]"
                >
                  다음 시나리오 시작
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scenario List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">시나리오 목록</h2>
        {scenarios.map((scenario, index) => {
          if (!scenario) return null;
          const isCompleted = schedule?.completedScenarioIds.includes(scenario.id);
          const isCurrent = nextId === scenario.id && dueToday;
          const isLocked = !isCompleted && !isCurrent;
          const progress = scenarioProgress?.[scenario.id];
          const bestScore = progress
            ? Math.round((progress.optimalCount / Math.max(progress.totalChoices, 1)) * 100)
            : null;

          return (
            <Card
              key={scenario.id}
              className={`${
                isCurrent
                  ? 'border-primary/50 ring-1 ring-primary/20'
                  : isLocked
                    ? 'opacity-60'
                    : ''
              }`}
            >
              <CardContent className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-muted-foreground">
                      {index + 1}.
                    </span>
                    <h3 className="text-sm font-semibold">{scenario.title}</h3>
                  </div>
                  {isCompleted && (
                    <Badge variant="secondary" className="shrink-0 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      완료
                    </Badge>
                  )}
                  {isCurrent && (
                    <Badge variant="secondary" className="shrink-0 bg-primary/10 text-primary">
                      현재
                    </Badge>
                  )}
                  {isLocked && (
                    <Badge variant="outline" className="shrink-0 text-muted-foreground">
                      잠금
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">{scenario.description}</p>

                <div className="flex flex-wrap gap-2 items-center">
                  <Badge className={`text-xs ${DIFFICULTY_COLORS[scenario.difficulty]} border-0`}>
                    {DIFFICULTY_LABELS[scenario.difficulty]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    약 {scenario.estimatedMinutes}분
                  </span>
                  {bestScore !== null && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      최고 점수: {bestScore}%
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Back link */}
      <Button
        render={<Link href="/scenarios" />}
        variant="outline"
        size="lg"
        className="w-full min-h-[44px]"
      >
        시뮬레이터 목록으로
      </Button>
    </main>
  );
}
