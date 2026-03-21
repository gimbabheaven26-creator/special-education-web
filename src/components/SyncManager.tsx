'use client';

/**
 * SyncManager — 로그인 상태에 따라 Zustand ↔ Supabase user_data 자동 동기화
 *
 * 전략:
 *  - SIGNED_IN: syncAllStores(userId) → 서버 데이터 pull → 스토어에 hydrate
 *  - 스토어 변경 시: 1500ms debounce 후 서버에 push (optimistic update)
 *  - SIGNED_OUT: 동기화 중단 (로컬 데이터는 유지)
 */

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { pushStore, serializeState, syncAllStores, type StoreKey } from '@/lib/sync';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const DEBOUNCE_MS = 1500;

export function SyncManager() {
  const isSyncing = useRef(false);
  const timers = useRef<Partial<Record<StoreKey, ReturnType<typeof setTimeout>>>>({});

  function schedulePush(key: StoreKey, state: Record<string, unknown>) {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      pushStore(key, serializeState(state));
    }, DEBOUNCE_MS);
  }

  async function syncOnLogin(userId: string) {
    isSyncing.current = true;
    try {
      await syncAllStores(userId);
    } catch (err) {
      console.error('[SyncManager] syncOnLogin error:', err);
    } finally {
      isSyncing.current = false;
    }
  }

  useEffect(() => {
    const supabase = createClient();

    // 이미 로그인 상태면 즉시 동기화
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) syncOnLogin(user.id);
    });

    // 로그인 이벤트 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) syncOnLogin(session.user.id);
    });

    // 스토어 변경 구독 → debounce push (5개 스토어)
    const unsubs = [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useStudyStore.subscribe((state: any) => {
        if (!isSyncing.current) schedulePush('study', state as Record<string, unknown>);
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useQuizStore.subscribe((state: any) => {
        if (!isSyncing.current) schedulePush('quiz', state as Record<string, unknown>);
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useLeitnerStore.subscribe((state: any) => {
        if (!isSyncing.current) schedulePush('leitner', state as Record<string, unknown>);
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useBookmarkStore.subscribe((state: any) => {
        if (!isSyncing.current) schedulePush('bookmark', state as Record<string, unknown>);
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useOnboardingStore.subscribe((state: any) => {
        if (!isSyncing.current) schedulePush('onboarding', state as Record<string, unknown>);
      }),
    ];

    return () => {
      subscription.unsubscribe();
      unsubs.forEach((u) => u());
      Object.values(timers.current).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
