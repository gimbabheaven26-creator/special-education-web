'use client';

import Link from 'next/link';
import { Trophy, ArrowRight, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStudyStore } from '@/stores/useStudyStore';
import { useMounted } from '@/hooks/useMounted';
import { getToday } from '@/lib/date-utils';
import { getConceptUrl } from '@/lib/content/concept-urls';

export function TodaySession() {
  const mounted = useMounted();
  const dailyProgress = useStudyStore((s) => s.dailyProgress);
  const dailyGoal = useStudyStore((s) => s.dailyGoal);
  const recentActivities = useStudyStore((s) => s.recentActivities);

  if (!mounted) {
    return (
      <Card>
        <CardContent className="py-4">
          <div className="h-20 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const today = getToday();
  const isToday = dailyProgress.date === today;
  const quizzes = isToday ? dailyProgress.quizzesCompleted : 0;
  const chapters = isToday ? dailyProgress.chaptersCompleted : 0;
  const quizPct = dailyGoal.quizzes > 0 ? Math.min((quizzes / dailyGoal.quizzes) * 100, 100) : 0;
  const allDone = chapters >= dailyGoal.chapters && quizzes >= dailyGoal.quizzes;

  const lastActivity = recentActivities[0];

  return (
    <Card>
      <CardContent className="py-4 space-y-4">
        {/* 오늘의 목표 진행률 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className={`h-4 w-4 ${allDone ? 'text-streak' : 'text-muted-foreground'}`} />
              <span className="text-sm font-semibold">오늘의 목표</span>
            </div>
            {allDone ? (
              <span className="text-xs font-semibold text-streak bg-streak/10 px-2 py-0.5 rounded-full">
                달성 완료!
              </span>
            ) : (
              <span className="text-xs text-muted-foreground tabular-nums">
                {quizzes}/{dailyGoal.quizzes} 문제
              </span>
            )}
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${allDone ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${quizPct}%` }}
            />
          </div>
        </div>

        {/* 이어하기 또는 시작 CTA */}
        {lastActivity ? (
          <Link
            href={getConceptUrl(lastActivity.subjectSlug)}
            className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs text-muted-foreground">이어서 학습하기</div>
              <div className="text-sm font-medium truncate mt-0.5">
                {lastActivity.chapterTitle}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
          </Link>
        ) : (
          <Link href="/kice">
            <Button variant="outline" className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              오늘의 문제 시작하기
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
