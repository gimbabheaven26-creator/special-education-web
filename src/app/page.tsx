import { StreakBanner } from '@/components/dashboard/StreakBanner';
import { DailyReviewCard } from '@/components/dashboard/DailyReviewCard';
import { ExamCountdown } from '@/components/ExamCountdown';
import { HomeQuizSection } from '@/components/HomeQuizSection';
import { TodayTermCard } from '@/components/TodayTermCard';
import { AiBriefingCard } from '@/components/AiBriefingCard';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

      {/* D-day 카운트다운 */}
      <ExamCountdown />

      {/* 오늘 복습 — SRS + 오답 카운트 전면 배치 */}
      <DailyReviewCard />

      {/* 스트릭 배너 */}
      <StreakBanner />

      {/* 오늘의 단어 */}
      <TodayTermCard />

      {/* AI 브리핑 */}
      <AiBriefingCard />

      {/* 오늘의 문제 — OX 10 / 단답 5 / 서술 3 */}
      <Suspense fallback={
        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">오늘의 문제 불러오는 중...</p>
        </div>
      }>
        <HomeQuizSection />
      </Suspense>
    </div>
  );
}
