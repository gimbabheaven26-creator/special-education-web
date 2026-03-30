'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MilestoneDef {
  label: string;
  target: number;
  emoji: string;
}

const MILESTONES: MilestoneDef[] = [
  { label: '첫 발걸음', target: 10, emoji: '👣' },
  { label: '꾸준한 시작', target: 50, emoji: '🌱' },
  { label: '성실한 학습자', target: 100, emoji: '📚' },
  { label: '실력 향상 중', target: 300, emoji: '🔥' },
  { label: '반 이상 정복', target: 500, emoji: '⭐' },
  { label: '천 문제 돌파', target: 1000, emoji: '🏆' },
];

const STREAK_MILESTONES: MilestoneDef[] = [
  { label: '3일 연속', target: 3, emoji: '🔥' },
  { label: '7일 연속', target: 7, emoji: '💪' },
  { label: '14일 연속', target: 14, emoji: '🌟' },
  { label: '30일 연속', target: 30, emoji: '👑' },
];

function MilestoneRow({ label, target, current, emoji }: MilestoneDef & { current: number }) {
  const achieved = current >= target;
  const progress = Math.min(current / target, 1);

  return (
    <div className="flex items-center gap-3">
      <span className={`text-lg shrink-0 ${achieved ? '' : 'grayscale opacity-40'}`} aria-hidden="true">
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${achieved ? 'text-foreground' : 'text-muted-foreground'}`}>
            {label}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {achieved ? '달성!' : `${current}/${target}`}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              achieved ? 'bg-emerald-500' : 'bg-primary/60'
            }`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface StudyMilestonesProps {
  totalQuestions: number;
  currentStreak: number;
  subjectCount: number;
}

export default function StudyMilestones({
  totalQuestions,
  currentStreak,
  subjectCount,
}: StudyMilestonesProps) {
  // Find next unachieved milestone for the main message
  const nextMilestone = MILESTONES.find((m) => totalQuestions < m.target);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">학습 마일스톤</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next goal callout */}
        {nextMilestone && (
          <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5 text-center">
            <p className="text-sm text-foreground">
              다음 목표: <span className="font-semibold">{nextMilestone.emoji} {nextMilestone.label}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {nextMilestone.target - totalQuestions}문제 더 풀면 달성!
            </p>
          </div>
        )}

        {/* Question milestones */}
        <div className="space-y-2.5">
          <p className="text-xs text-muted-foreground font-medium">문제 풀이</p>
          {MILESTONES.filter((m) => totalQuestions >= m.target * 0.3 || m.target <= 50).map((m) => (
            <MilestoneRow key={m.target} {...m} current={totalQuestions} />
          ))}
        </div>

        {/* Streak milestones */}
        {(currentStreak > 0 || totalQuestions >= 10) && (
          <div className="space-y-2.5">
            <p className="text-xs text-muted-foreground font-medium">연속 학습</p>
            {STREAK_MILESTONES.filter((m) => currentStreak >= m.target * 0.3 || m.target <= 7).map((m) => (
              <MilestoneRow key={m.target} {...m} current={currentStreak} />
            ))}
          </div>
        )}

        {/* Subject diversity */}
        {subjectCount > 0 && (
          <div className="rounded-lg border border-border px-3 py-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">학습한 과목</span>
            <span className="text-sm font-semibold">{subjectCount}과목</span>
          </div>
        )}

        {/* CTA for empty-ish state */}
        {totalQuestions < 10 && (
          <Link
            href="/quiz"
            className="block text-center text-xs text-primary hover:underline mt-2"
          >
            퀴즈 풀러 가기 →
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
