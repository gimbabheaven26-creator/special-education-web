'use client';

import { OnboardingGate } from '@/components/OnboardingGate';
import { FocusBanner } from '@/components/dashboard/FocusBanner';
import { MissionBlockList } from '@/components/dashboard/MissionBlockList';

export function HomeDashboard({ children }: { children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <OnboardingGate />
      <FocusBanner />
      <MissionBlockList />
      {children}
    </div>
  );
}
