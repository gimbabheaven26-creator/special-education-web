import { StreakBanner } from '@/components/dashboard/StreakBanner';
import { DailyReviewCard } from '@/components/dashboard/DailyReviewCard';
import { TodaySession } from '@/components/dashboard/TodaySession';
import { LearningFlowGuide } from '@/components/dashboard/LearningFlowGuide';
import { ExamCountdown } from '@/components/ExamCountdown';
import { OnboardingGate } from '@/components/OnboardingGate';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* 미온보딩 유저 → /onboarding 리다이렉트 */}
      <OnboardingGate />

      {/* 스트릭 배너 */}
      <StreakBanner />

      {/* 오늘 복습 — SRS + 오답 카운트 전면 배치 */}
      <DailyReviewCard />

      {/* 오늘의 목표 + 이어하기 */}
      <TodaySession />

      {/* D-day 카운트다운 (시험일 설정 시에만 표시) */}
      <ExamCountdown showPrompt={false} />

      {/* 학습 흐름 4단계 */}
      <LearningFlowGuide />
    </div>
  );
}
