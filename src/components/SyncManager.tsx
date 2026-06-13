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
  setLocalModified,
  clearLocalModified,
  STORE_KEYS,
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

/** key → 현재 스토어 상태 조회 (H1 keptLocal push 용) */
function getStoreState(key: StoreKey): Record<string, unknown> {
  switch (key) {
    case 'study': return useStudyStore.getState() as unknown as Record<string, unknown>;
    case 'quiz': return useQuizStore.getState() as unknown as Record<string, unknown>;
    case 'leitner': return useLeitnerStore.getState() as unknown as Record<string, unknown>;
    case 'bookmark': return useBookmarkStore.getState() as unknown as Record<string, unknown>;
    case 'onboarding': return useOnboardingStore.getState() as unknown as Record<string, unknown>;
    case 'focus': return useFocusStore.getState() as unknown as Record<string, unknown>;
  }
}

/**
 * H3: 6개 스토어를 초기 상태로 리셋하고 persist localStorage를 비운다.
 * 로그아웃 / 계정 전환 시 이전 사용자 데이터가 다음 사용자 계정으로 새는 것을 막는다.
 * zustand v5 getInitialState()는 액션을 포함하므로 replace=true로 안전하게 복원된다.
 * 호출자는 반드시 isSyncing=true로 감싸 subscribe→push 발동을 막아야 한다.
 */
function resetAllStores(): void {
  useStudyStore.setState(useStudyStore.getInitialState(), true);
  useStudyStore.persist.clearStorage();
  useQuizStore.setState(useQuizStore.getInitialState(), true);
  useQuizStore.persist.clearStorage();
  useLeitnerStore.setState(useLeitnerStore.getInitialState(), true);
  useLeitnerStore.persist.clearStorage();
  useBookmarkStore.setState(useBookmarkStore.getInitialState(), true);
  useBookmarkStore.persist.clearStorage();
  useOnboardingStore.setState(useOnboardingStore.getInitialState(), true);
  useOnboardingStore.persist.clearStorage();
  useFocusStore.setState(useFocusStore.getInitialState(), true);
  useFocusStore.persist.clearStorage();
  clearLocalModified();
  try {
    localStorage.removeItem('sew-migrated');
  } catch {
    // 무시
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
    // H1: 로컬 변경 시각을 영속화 → 리로드 후에도 로컬이 서버보다 최신인지 비교 가능
    setLocalModified(key);
    clearTimeout(timers.current[key]);
    timers.current[key] = setTimeout(() => executePush(key), DEBOUNCE_MS);
  }

  async function executePush(key: StoreKey) {
    const userId = userIdRef.current;
    const state = pendingStates.current[key];
    if (!userId || !state) return;
    delete timers.current[key];

    const result = await pushToServer(
      userId,
      key,
      serializeState(state),
      lastSyncTs.current[key],
    );

    if (result === 'pushed') {
      lastSyncTs.current[key] = new Date().toISOString();
      // await 중 더 새로운 상태가 큐잉되지 않았을 때만 pending 제거
      if (pendingStates.current[key] === state) delete pendingStates.current[key];
    } else if (result === 'skipped') {
      if (pendingStates.current[key] === state) delete pendingStates.current[key];
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
    // result === 'error': pendingStates[key] 유지 → 다음 flush/visibilitychange 시 재시도
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
      isSyncing.current = true;
      // H3: 계정 전환 방어 — 이전 사용자 데이터가 남아있으면 먼저 초기화
      if (userIdRef.current && userIdRef.current !== userId) {
        resetAllStores();
      }
      userIdRef.current = userId;
      try {
        const { keptLocal } = await syncAllStores(userId);
        const now = new Date().toISOString();
        STORE_KEYS.forEach((k) => { lastSyncTs.current[k] = now; });
        // H1: 로컬이 서버보다 최신이라 보존된 스토어는 서버로 push (덮어쓰기 손실 방지)
        keptLocal.forEach((key) => schedulePush(key, getStoreState(key)));
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
        // H3: 로그아웃 시 로컬 데이터 초기화 — 공용 기기에서 다음 사용자 계정으로
        // 이전 사용자의 학습 기록이 새는 것을 막는다. isSyncing 가드로 reset 중
        // subscribe→push 발동을 차단.
        isSyncing.current = true;
        resetAllStores();
        isSyncing.current = false;
        userIdRef.current = null;
        lastSyncTs.current = {};
        pendingStates.current = {};
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
