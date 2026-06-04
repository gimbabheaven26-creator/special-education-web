'use client';

/**
 * SyncManager — 로그인 상태에 따라 Zustand ↔ Supabase user_data 자동 동기화
 *
 * 전략:
 *  - SIGNED_IN: syncAllStores(userId) → 서버 데이터 pull → 스토어에 hydrate
 *  - 스토어 변경 시: 1500ms debounce 후 서버에 push (optimistic update)
 *  - 서버가 더 최신이면 push 건너뜀 → pull로 최신 데이터 가져옴
 *  - SIGNED_OUT: 동기화 중단 (로컬 데이터는 유지)
 *  - visibilitychange(hidden) 시 pending push 즉시 flush
 */

import { useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/browser';
import {
  pushToServer,
  pullFromServer,
  serializeState,
  syncAllStores,
  type StoreKey,
} from '@/lib/db/sync';
import { storeSchemas } from '@/lib/db/sync-schemas';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { useOnboardingStore } from '@/stores/useOnboardingStore';
import { useFocusStore } from '@/stores/useFocusStore';

const DEBOUNCE_MS = 1500;

// Zod validates data before reaching these setters — cast bridges validated data to Zustand's type
const STORE_SETTERS: Record<StoreKey, { setState: (data: unknown) => void }> = {
  study: { setState: (d) => useStudyStore.setState(d as Partial<ReturnType<typeof useStudyStore.getState>>) },
  quiz: { setState: (d) => useQuizStore.setState(d as Partial<ReturnType<typeof useQuizStore.getState>>) },
  leitner: { setState: (d) => useLeitnerStore.setState(d as Partial<ReturnType<typeof useLeitnerStore.getState>>) },
  bookmark: { setState: (d) => useBookmarkStore.setState(d as Partial<ReturnType<typeof useBookmarkStore.getState>>) },
  onboarding: { setState: (d) => useOnboardingStore.setState(d as Partial<ReturnType<typeof useOnboardingStore.getState>>) },
  focus: { setState: (d) => useFocusStore.setState(d as Partial<ReturnType<typeof useFocusStore.getState>>) },
};

function validateAndSetState(key: StoreKey, data: Record<string, unknown>): void {
  const schema = storeSchemas[key];
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    STORE_SETTERS[key].setState(parsed.data);
  } else {
    console.warn(`[sync] ${key} data validation failed:`, parsed.error.issues);
  }
}

export function SyncManager() {
  const isSyncing = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const lastSyncTs = useRef<Partial<Record<StoreKey, string>>>({});
  const timers = useRef<Partial<Record<StoreKey, ReturnType<typeof setTimeout>>>>({});
  const pendingStates = useRef<Partial<Record<StoreKey, Record<string, unknown>>>>({});
  const syncPromise = useRef<Promise<void> | null>(null);

  function schedulePush(key: StoreKey, state: unknown) {
    pendingStates.current[key] = state as Record<string, unknown>;
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => executePush(key), DEBOUNCE_MS);
  }

  async function executePush(key: StoreKey) {
    const userId = userIdRef.current;
    const state = pendingStates.current[key];
    if (!userId || !state) return;
    delete pendingStates.current[key];
    delete timers.current[key];

    const result = await pushToServer(
      userId,
      key,
      serializeState(state),
      lastSyncTs.current[key],
    );

    if (result === 'pushed') {
      lastSyncTs.current[key] = new Date().toISOString();
    } else if (result === 'skipped') {
      isSyncing.current = true;
      try {
        const serverData = await pullFromServer(userId, key);
        if (serverData) {
          validateAndSetState(key, serverData);
        }
        lastSyncTs.current[key] = new Date().toISOString();
      } finally {
        isSyncing.current = false;
      }
    }
  }

  function flushAllPending() {
    const keys = Object.keys(pendingStates.current) as StoreKey[];
    for (const key of keys) {
      clearTimeout(timers.current[key]);
      executePush(key);
    }
  }

  async function syncOnLogin(userId: string) {
    if (syncPromise.current) return syncPromise.current;
    if (userIdRef.current === userId) return;

    const doSync = async () => {
      userIdRef.current = userId;
      isSyncing.current = true;
      try {
        await syncAllStores(userId);
        const now = new Date().toISOString();
        const keys: StoreKey[] = ['study', 'quiz', 'leitner', 'bookmark', 'onboarding', 'focus'];
        keys.forEach((k) => { lastSyncTs.current[k] = now; });
      } catch (err) {
        console.error('[SyncManager] syncOnLogin error:', err);
      } finally {
        isSyncing.current = false;
        syncPromise.current = null;
      }
    };

    syncPromise.current = doSync();
    return syncPromise.current;
  }

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) syncOnLogin(user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) syncOnLogin(session.user.id);
      if (event === 'SIGNED_OUT') {
        userIdRef.current = null;
        lastSyncTs.current = {};
      }
    });

    const stores = [
      { store: useStudyStore, key: 'study' as StoreKey },
      { store: useQuizStore, key: 'quiz' as StoreKey },
      { store: useLeitnerStore, key: 'leitner' as StoreKey },
      { store: useBookmarkStore, key: 'bookmark' as StoreKey },
      { store: useOnboardingStore, key: 'onboarding' as StoreKey },
      { store: useFocusStore, key: 'focus' as StoreKey },
    ];

    const unsubs = stores.map(({ store, key }) =>
      store.subscribe((state) => {
        if (!isSyncing.current) schedulePush(key, state);
      }),
    );

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushAllPending();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const pendingTimers = timers.current;
    return () => {
      subscription.unsubscribe();
      unsubs.forEach((u) => u());
      Object.values(pendingTimers).forEach(clearTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
