'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { CalendarDays, BookOpen, Brain, ClipboardX, ArrowRight, Settings2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useStudyStore } from '@/stores/useStudyStore';
import {
  getCurrentWeekMilestone,
  getEncouragementMessage,
  getSubjectTitle,
} from '@/lib/study-planner';

function DdayBadge({ dday }: { dday: number }) {
  const urgency = dday <= 30 ? 'text-red-600 bg-red-500/10' :
    dday <= 90 ? 'text-streak bg-streak/10' :
    'text-primary bg-primary/10';

  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${urgency}`}>
      D-{dday}
    </span>
  );
}

export function TodayStudyPlan() {
  const [mounted, setMounted] = useState(false);
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);
  const studyPlan = useOnboardingStore((s) => s.studyPlan);
  const getDday = useOnboardingStore((s) => s.getDday);
  const dailyProgress = useStudyStore((s) => s.dailyProgress);
  const currentStreak = useStudyStore((s) => s.currentStreak);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dday = useMemo(() => getDday(), [getDday]);

  const milestone = useMemo(
    () => (studyPlan ? getCurrentWeekMilestone(studyPlan) : null),
    [studyPlan]
  );

  const encouragement = useMemo(() => {
    if (!dday) return '';
    const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
    const hasStudiedToday = dailyProgress.date === today && dailyProgress.quizzesCompleted > 0;
    const missedYesterday = currentStreak === 0;

    if (missedYesterday && !hasStudiedToday) {
      return getEncouragementMessage('missed');
    }
    if (!hasStudiedToday) {
      return getEncouragementMessage('start', { dday });
    }
    const target = studyPlan?.dailyQuizTarget ?? 10;
    if (dailyProgress.quizzesCompleted >= target) {
      return getEncouragementMessage('complete', {
        xp: dailyProgress.quizzesCorrect * 15,
      });
    }
    return getEncouragementMessage('progress', {
      completed: dailyProgress.quizzesCompleted,
      total: target,
    });
  }, [dday, dailyProgress, currentStreak, studyPlan]);

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  // Not onboarded — show CTA
  if (!isOnboarded || !studyPlan) {
    return (
      <Card className="border-dashed border-2 border-primary/30">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">학습 계획을 세워볼까요?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                시험일과 학습 수준을 입력하면 맞춤 학습 계획을 만들어드려요
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              시작하기 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  const todaySubjects = milestone?.subjects ?? [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            오늘의 학습
          </CardTitle>
          <div className="flex items-center gap-2">
            {dday !== null && <DdayBadge dday={dday} />}
            <Link href="/onboarding" className="text-muted-foreground hover:text-foreground">
              <Settings2 className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Encouragement */}
        <p className="text-sm text-muted-foreground">{encouragement}</p>

        {/* Today's steps */}
        <div className="space-y-2">
          {todaySubjects.length > 0 && (
            <Link
              href={`/subjects/${todaySubjects[0]}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">
                  {todaySubjects.map(getSubjectTitle).join(', ')} 학습
                </div>
                <div className="text-xs text-muted-foreground">
                  {milestone?.label ?? '개념 학습'}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
            </Link>
          )}

          <Link
            href={todaySubjects.length > 0 ? `/quiz/${todaySubjects[0]}` : '/quiz'}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-xp/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-xp" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">
                퀴즈 {studyPlan.dailyQuizTarget}문제 풀기
              </div>
              <div className="text-xs text-muted-foreground">
                오늘 {dailyProgress.quizzesCompleted}/{studyPlan.dailyQuizTarget} 완료
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
          </Link>

          <Link
            href="/wrong-notes"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <ClipboardX className="h-4 w-4 text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium">오답 복습</div>
              <div className="text-xs text-muted-foreground">틀린 문제를 다시 풀어보세요</div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
