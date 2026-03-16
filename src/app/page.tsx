import { StreakBanner } from '@/components/dashboard/StreakBanner';
import { TodaySession } from '@/components/dashboard/TodaySession';
import { LearningFlowGuide } from '@/components/dashboard/LearningFlowGuide';

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* 스트릭 배너 */}
      <StreakBanner />

      {/* 오늘의 세션 (목표 + 이어하기 통합) */}
      <TodaySession />

      {/* 학습 흐름 가이드 4단계 */}
      <LearningFlowGuide />
    </div>
  );
}
