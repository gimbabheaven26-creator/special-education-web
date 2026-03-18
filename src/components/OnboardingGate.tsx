'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

/**
 * 미온보딩 사용자를 /onboarding으로 리다이렉트.
 * mounted 후에만 체크 — Zustand localStorage 복원 전에 false로 오판하는 문제 방지.
 */
export function OnboardingGate() {
  const router = useRouter();
  const isOnboarded = useOnboardingStore((s) => s.isOnboarded);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isOnboarded) {
      router.replace('/onboarding');
    }
  }, [mounted, isOnboarded, router]);

  return null;
}
