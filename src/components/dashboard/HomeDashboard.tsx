'use client';

import { OnboardingGate } from '@/components/OnboardingGate';
import { ExamCountdown } from '@/components/ExamCountdown';
import { StreakBanner } from '@/components/dashboard/StreakBanner';
import { FocusBanner } from '@/components/dashboard/FocusBanner';
import { MissionBlockList } from '@/components/dashboard/MissionBlockList';

export function HomeDashboard({ children }: { children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <OnboardingGate />

      {/* 집중 과목 배너 */}
      <FocusBanner />

      {/* D-day 카운트다운 + 스트릭 */}
      <ExamCountdown />
      <StreakBanner />

      {/* 오늘의 미션 블록 리스트 */}
      <MissionBlockList />

      {/* 서버 컴포넌트 슬롯 (AdminQuickAccess 등) */}
      {children}
    </div>
  );
}
