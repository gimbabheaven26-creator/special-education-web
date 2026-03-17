'use client';

/**
 * SyncManager — 로그인 상태에 따라 Zustand ↔ Supabase user_data 자동 동기화
 *
 * 전략:
 *  - SIGNED_IN: 서버 데이터 pull → 있으면 스토어에 merge, 없으면 로컬 push (게스트 마이그레이션)
 *  - 스토어 변경 시: 3초 debounce 후 서버에 push (optimistic update)
 *  - SIGNED_OUT: 동기화 중단 (로컬 데이터는 유지)
 */

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { pushStore, pullStore, serializeState, type StoreKey } from '@/lib/sync';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useBookmarkStore } from '@/stores/useBookmarkStore';

export function SyncManager() {
  const isSyncing = useRef(false);
  const timers = useRef<Partial<Record<StoreKey, ReturnType<typeof setTimeout>>>>({});

  function schedulePush(key: StoreKey, state: Record<string, unknown>) {
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => {
      pushStore(key, serializeState(state));
    }, 3000);
  }

  async function syncOnLogin() {
    isSyncing.current = true;
    try {
      const keys: StoreKey[] = ['study', 'quiz', 'leitner', 'bookmark'];
      const results = await Promise.all(keys.map((k) => pullStore(k)));

      const [study, quiz, leitner, bookmark] = results;

      // 서버 데이터 있으면 스토어에 merge, 없으면 로컬 데이터를 서버로 push
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const applyOrPush = async (key: StoreKey, result: typeof study, setter: (s: any) => void, getter: () => unknown) => {
        if (result?.data) {
          setter(result.data);
        } else {
          await pushStore(key, serializeState(getter() as Record<string, unknown>));
        }
      };

      await Promise.all([
        applyOrPush('study', study, useStudyStore.setState, useStudyStore.getState),
        applyOrPush('quiz', quiz, useQuizStore.setState, useQuizStore.getState),
        applyOrPush('leitner', leitner, useLeitnerStore.setState, useLeitnerStore.getState),
        applyOrPush('bookmark', bookmark, useBookmarkStore.setState, useBookmarkStore.getState),
      ]);
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
      if (user) syncOnLogin();
    });

    // 로그인 이벤트 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') syncOnLogin();
    });

    // 스토어 변경 구독 → debounce push
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
