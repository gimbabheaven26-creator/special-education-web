'use client';

import Link from 'next/link';
import { useMounted } from '@/hooks/useMounted';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { getKSTDate } from '@/lib/date-utils';
import { Flame, Target, Brain, Layers, ChevronRight } from 'lucide-react';

function StatCard({
  icon,
  label,
  value,
  sub,
  href,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  color: string;
}) {
  const content = (
    <div className={`rounded-xl border p-3 space-y-1 ${href ? 'hover:bg-accent/50 transition-colors group' : ''}`}>
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {href && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />}
      </div>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }
  return content;
}

export default function TodayDashboard() {
  const mounted = useMounted();

  const currentStreak = useStudyStore((s) => s.currentStreak);
  const dailyProgress = useStudyStore((s) => s.dailyProgress);
  const dailyGoal = useStudyStore((s) => s.dailyGoal);
  const totalXP = useStudyStore((s) => s.totalXP);

  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const unmasteredCount = wrongNotes.filter((n) => !n.mastered).length;

  const flashcardTotal = useLeitnerStore((s) => s.cards.length);
  const flashcardDueToday = useLeitnerStore((s) => {
    const today = getKSTDate();
    return s.cards.filter((c) => c.nextReview <= today).length;
  });

  if (!mounted) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border p-3 space-y-2">
            <div className="h-8 w-8 rounded-lg bg-muted animate-pulse" />
            <div className="h-5 w-12 rounded bg-muted animate-pulse" />
            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  const quizDone = dailyProgress.quizzesCompleted;
  const quizGoal = dailyGoal.quizzes;
  const quizProgress = quizGoal > 0 ? Math.min(quizDone / quizGoal, 1) : 0;

  return (
    <div className="space-y-4">
      {/* Streak + daily progress banner */}
      {(currentStreak > 0 || quizDone > 0) && (
        <div className="rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 border border-orange-200/50 dark:border-orange-800/30 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentStreak > 0 && (
                <>
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    {currentStreak}일 연속 학습 중
                  </span>
                </>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{totalXP.toLocaleString()} XP</span>
          </div>
          {quizGoal > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>오늘 목표</span>
                <span>{quizDone}/{quizGoal}문제</span>
              </div>
              <div className="h-1.5 rounded-full bg-orange-200/50 dark:bg-orange-900/30 overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all"
                  style={{ width: `${quizProgress * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          color="bg-blue-100 dark:bg-blue-950/30"
          label="오늘 푼 문제"
          value={quizDone}
          sub={quizDone > 0 ? `정답률 ${dailyProgress.quizzesCorrect > 0 ? Math.round((dailyProgress.quizzesCorrect / quizDone) * 100) : 0}%` : '아직 시작 전'}
        />

        <StatCard
          icon={<Brain className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
          color="bg-purple-100 dark:bg-purple-950/30"
          label="복습 대기 카드"
          value={flashcardDueToday}
          sub={flashcardTotal > 0 ? `총 ${flashcardTotal}장` : '카드 없음'}
          href={flashcardDueToday > 0 ? '/flashcards/review' : '/flashcards'}
        />

        <StatCard
          icon={<Layers className="h-4 w-4 text-red-600 dark:text-red-400" />}
          color="bg-red-100 dark:bg-red-950/30"
          label="오답 미해결"
          value={unmasteredCount}
          sub={unmasteredCount > 0 ? '복습이 필요해요' : '깨끗해요!'}
          href="/wrong-notes"
        />

        <StatCard
          icon={<Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />}
          color="bg-orange-100 dark:bg-orange-950/30"
          label="연속 학습"
          value={`${currentStreak}일`}
          sub={currentStreak === 0 ? '오늘 시작해보세요' : '잘하고 있어요!'}
          href="/mastery"
        />
      </div>
    </div>
  );
}
