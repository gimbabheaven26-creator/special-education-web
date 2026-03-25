'use client';

/**
 * SyncManager — 로그인 상태에 따라 Zustand ↔ Supabase user_data 자동 동기화
 *
 * 전략:
 *  - SIGNED_IN: syncAllStores(userId) → 서버 데이터 pull → 스토어에 hydrate
 *  - 스토어 변경 시: 1500ms debounce 후 서버에 push (optimistic update)
 *  - 서버가 더 최신이면 push 건너뜀 → pull로 최신 데이터 가져옴
 *  - SIGNED_OUT: 동기화 중단 (로컬 데이터는 유지)
 */

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';
import {
  pushToServer,
  pullFromServer,
  serializeState,
  syncAllStores,
  type StoreKey,
} from '@/lib/sync';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';

const DEBOUNCE_MS = 1500;

/** 스토어별 hydrate 맵 — 서버가 더 최신일 때 단일 스토어를 갱신 */
const STORE_SETTERS: Record<StoreKey, { setState: (data: Record<string, unknown>) => void }> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  study: { setState: (d) => useStudyStore.setState(d as any) },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quiz: { setState: (d) => useQuizStore.setState(d as any) },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leitner: { setState: (d) => useLeitnerStore.setState(d as any) },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bookmark: { setState: (d) => useBookmarkStore.setState(d as any) },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onboarding: { setState: (d) => useOnboardingStore.setState(d as any) },
};

export function SyncManager() {
  const isSyncing = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const lastSyncTs = useRef<Partial<Record<StoreKey, string>>>({});
  const timers = useRef<Partial<Record<StoreKey, ReturnType<typeof setTimeout>>>>({});

  function schedulePush(key: StoreKey, state: Record<string, unknown>) {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(async () => {
      const userId = userIdRef.current;
      if (!userId) return;

      const result = await pushToServer(
        userId,
        key,
        serializeState(state),
        lastSyncTs.current[key],
      );

      if (result === 'pushed') {
        lastSyncTs.current[key] = new Date().toISOString();
      } else if (result === 'skipped') {
        // 서버가 더 최신 — 서버 데이터를 pull하여 로컬에 반영
        isSyncing.current = true;
        try {
          const serverData = await pullFromServer(userId, key);
          if (serverData) {
            STORE_SETTERS[key].setState(serverData);
          }
          lastSyncTs.current[key] = new Date().toISOString();
        } finally {
          isSyncing.current = false;
        }
      }
    }, DEBOUNCE_MS);
  }

  async function syncOnLogin(userId: string) {
    if (userIdRef.current === userId) return; // 이미 동기화한 유저 — 이중 호출 방지
    userIdRef.current = userId;
    isSyncing.current = true;
    try {
      await syncAllStores(userId);
      // 초기 동기화 완료 시점 기록
      const now = new Date().toISOString();
      const keys: StoreKey[] = ['study', 'quiz', 'leitner', 'bookmark', 'onboarding'];
      keys.forEach((k) => { lastSyncTs.current[k] = now; });
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
      if (event === 'SIGNED_OUT') {
        userIdRef.current = null;
        lastSyncTs.current = {};
      }
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

    const pendingTimers = timers.current; // cleanup 시점 스냅샷
    return () => {
      subscription.unsubscribe();
      unsubs.forEach((u) => u());
      Object.values(pendingTimers).forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
