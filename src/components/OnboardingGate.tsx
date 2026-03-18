'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

/**
 * 미온보딩 사용자를 /onboarding으로 리다이렉트.
 * 홈 페이지에만 마운트 (layout.tsx X — 너무 공격적)
 */
export function OnboardingGate() {
  const router = useRouter();
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);

  useEffect(() => {
    if (!isOnboarded) {
      router.replace('/onboarding');
    }
  }, [isOnboarded, router]);

  return null;
}
