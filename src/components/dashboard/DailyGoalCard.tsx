'use client';

import { BookOpen, Brain, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudyStore } from '@/stores/useStudyStore';
import { useEffect, useState } from 'react';

function GoalRow({
  icon: Icon,
  label,
  current,
  target,
  color,
  barColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  current: number;
  target: number;
  color: string;
  barColor: string;
}) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const done = current >= target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className={`text-sm font-semibold tabular-nums ${done ? 'text-success' : 'text-muted-foreground'}`}>
          {current}/{target}
        </span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${done ? 'bg-success' : barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function DailyGoalCard() {
  const [mounted, setMounted] = useState(false);
  const dailyProgress = useStudyStore((s) => s.dailyProgress);
  const dailyGoal = useStudyStore((s) => s.dailyGoal);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const isToday = dailyProgress.date === today;
  const chapters = isToday ? dailyProgress.chaptersCompleted : 0;
  const quizzes = isToday ? dailyProgress.quizzesCompleted : 0;
  const allDone = chapters >= dailyGoal.chapters && quizzes >= dailyGoal.quizzes;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className={`h-4 w-4 ${allDone ? 'text-streak' : 'text-muted-foreground'}`} />
            오늘의 목표
          </CardTitle>
          {allDone && (
            <span className="text-xs font-semibold text-streak bg-streak/10 px-2 py-0.5 rounded-full">
              달성 완료!
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoalRow
          icon={BookOpen}
          label="챕터 학습"
          current={chapters}
          target={dailyGoal.chapters}
          color="text-primary"
          barColor="bg-primary"
        />
        <GoalRow
          icon={Brain}
          label="퀴즈 풀기"
          current={quizzes}
          target={dailyGoal.quizzes}
          color="text-xp"
          barColor="bg-xp"
        />
      </CardContent>
    </Card>
  );
}
