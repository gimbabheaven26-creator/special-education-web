/**
 * Supabase user_data 동기화 유틸 (v2)
 * 인증 사용자의 Zustand 스토어 상태를 서버에 UPSERT/SELECT
 */

import { createClient } from '@/lib/supabase/browser';
import { storeSchemas } from './sync-schemas';

export type StoreKey = 'study' | 'leitner' | 'quiz' | 'bookmark' | 'onboarding' | 'focus';

/** 모든 동기화 대상 스토어 키 (단일 소스) */
export const STORE_KEYS: readonly StoreKey[] = [
  'study', 'quiz', 'leitner', 'bookmark', 'onboarding', 'focus',
];

/**
 * 각 스토어의 zustand persist localStorage 키 (단일 소스).
 * MigrationModal 등 다른 모듈은 반드시 이 상수를 import 해서 키를 일치시킨다.
 */
export const STORE_LS_KEYS: Record<StoreKey, string> = {
  study: 'special-edu-study',
  leitner: 'leitner-cards',
  quiz: 'quiz-data',
  bookmark: 'bookmarks',
  onboarding: 'special-edu-onboarding',
  focus: 'focus-store',
};

// ─── 로컬 수정 타임스탬프 영속화 (H1: pull stale-write 방지) ──────────────────
// lastSyncTs는 in-memory ref라 리로드 시 소멸 → 로컬이 서버보다 최신인지 알 방법이
// 없었다. 로컬 변경 시각을 localStorage에 영속화하여 로그인 pull 시 비교한다.

const LOCAL_TS_PREFIX = 'sew-local-ts-';

/** 스토어의 마지막 로컬 수정 시각을 기록 (ISO 문자열) */
export function setLocalModified(key: StoreKey, ts: string = new Date().toISOString()): void {
  try {
    localStorage.setItem(LOCAL_TS_PREFIX + key, ts);
  } catch {
    // localStorage 사용 불가 — 무시 (비교 생략 → 서버 우선)
  }
}

/** 스토어의 마지막 로컬 수정 시각 조회 (없으면 null) */
export function getLocalModified(key: StoreKey): string | null {
  try {
    return localStorage.getItem(LOCAL_TS_PREFIX + key);
  } catch {
    return null;
  }
}

/** 모든 로컬 수정 타임스탬프 삭제 (로그아웃 시) */
export function clearLocalModified(): void {
  for (const key of STORE_KEYS) {
    try {
      localStorage.removeItem(LOCAL_TS_PREFIX + key);
    } catch {
      // 무시
    }
  }
}

/** 함수 제거, 직렬화 가능한 데이터만 추출 */
export function serializeState(state: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(state).filter(([, v]) => typeof v !== 'function'),
  );
}

// ─── Legacy API (keep for backward compat) ───────────────────────────────────

/** 스토어 데이터를 서버에 UPSERT (비로그인 시 no-op) */
export async function pushStore(key: StoreKey, data: Record<string, unknown>): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await pushToServer(user.id, key, data);
}

/** 서버에서 스토어 데이터 조회 (없으면 null) */
export async function pullStore(
  key: StoreKey,
): Promise<{ data: Record<string, unknown>; updatedAt: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const result = await pullFromServer(user.id, key);
  if (!result) return null;
  // re-fetch updated_at from server
  const { data } = await supabase
    .from('user_data')
    .select('updated_at')
    .eq('user_id', user.id)
    .eq('store_key', key)
    .maybeSingle();
  return { data: result, updatedAt: (data as Record<string, string> | null)?.updated_at ?? new Date().toISOString() };
}

// ─── v2 API ──────────────────────────────────────────────────────────────────

/**
 * 특정 스토어 데이터를 userId 기준으로 서버에 UPSERT.
 * localUpdatedAt을 제공하면 서버의 updated_at과 비교하여 서버가 더 최신이면 덮어쓰기를 건너뛴다.
 * user_data.store_key 체크 제약이 'onboarding'을 포함하지 않으면 gracefully 실패.
 */
/**
 * 특정 스토어 데이터를 userId 기준으로 서버에 UPSERT.
 * localUpdatedAt을 제공하면 서버의 updated_at과 비교하여 서버가 더 최신이면 덮어쓰기를 건너뛴다.
 * user_data.store_key 체크 제약이 'onboarding'을 포함하지 않으면 gracefully 실패.
 *
 * @returns 'pushed' — 서버에 기록됨
 * @returns 'skipped' — 서버가 더 최신이라 건너뜀
 * @returns 'error' — 서버 오류
 */
export async function pushToServer(
  userId: string,
  key: StoreKey,
  data: Record<string, unknown>,
  localUpdatedAt?: string,
): Promise<'pushed' | 'skipped' | 'error'> {
  const supabase = createClient();

  // 로컬 타임스탬프가 있으면 서버와 비교하여 stale write 방지
  if (localUpdatedAt) {
    const { data: existing } = await supabase
      .from('user_data')
      .select('updated_at')
      .eq('user_id', userId)
      .eq('store_key', key)
      .maybeSingle();
    if (existing) {
      const serverTs = (existing as { updated_at: string }).updated_at;
      if (serverTs > localUpdatedAt) {
        // 서버 데이터가 더 최신 — 오래된 로컬 데이터로 덮어쓰기 건너뜀
        return 'skipped';
      }
    }
  }

  const { error } = await supabase.from('user_data').upsert(
    { user_id: userId, store_key: key, data, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,store_key' },
  );
  if (error) {
    // 23514 = check constraint violation (store_key enum not yet expanded)
    if (error.code !== '23514') {
      console.error(`[sync] push ${key} failed:`, error.message);
    }
    return 'error';
  }
  return 'pushed';
}

/**
 * 특정 스토어 데이터를 서버에서 조회.
 */
export async function pullFromServer(
  userId: string,
  key: StoreKey,
): Promise<Record<string, unknown> | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('data')
    .eq('user_id', userId)
    .eq('store_key', key)
    .maybeSingle();

  if (error) {
    console.error(`[sync] pull ${key} failed:`, error.message);
    return null;
  }
  if (!data) return null;
  return (data as { data: Record<string, unknown> }).data;
}

/**
 * 특정 스토어 데이터를 서버 updated_at과 함께 조회.
 * H1: 로그인 pull 시 로컬 타임스탬프와 비교하기 위해 메타가 필요하다.
 */
export async function pullFromServerWithMeta(
  userId: string,
  key: StoreKey,
): Promise<{ data: Record<string, unknown>; updatedAt: string | null } | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', userId)
    .eq('store_key', key)
    .maybeSingle();

  if (error) {
    console.error(`[sync] pull ${key} failed:`, error.message);
    return null;
  }
  if (!data) return null;
  const row = data as { data: Record<string, unknown>; updated_at?: string | null };
  return { data: row.data, updatedAt: row.updated_at ?? null };
}

/**
 * 게스트 → 로그인 마이그레이션.
 * localStorage에 남아있는 5개 스토어 데이터를 서버에 일괄 push.
 */
export async function migrateGuestData(userId: string): Promise<void> {
  const promises: Promise<unknown>[] = [];
  for (const [key, lsKey] of Object.entries(STORE_LS_KEYS) as [StoreKey, string][]) {
    try {
      const raw = localStorage.getItem(lsKey);
      if (!raw) continue;
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') continue;
      // Zustand persist wraps state in { state: {...}, version: N }
      const state = (parsed as Record<string, unknown>).state;
      if (!state || typeof state !== 'object') continue;
      // 서버에 이미 데이터가 있으면 게스트 데이터로 덮어쓰지 않는다.
      // (기존 계정으로 로그인 시 계정 데이터 보호 — 완전한 병합은 후속 과제)
      promises.push(
        pullFromServer(userId, key).then((serverData) => {
          if (serverData) return undefined;
          return pushToServer(userId, key, serializeState(state as Record<string, unknown>));
        }),
      );
    } catch {
      // localStorage read/parse failure — skip
    }
  }
  await Promise.all(promises);
}

/**
 * 서버에서 6개 스토어 데이터를 pull 하여 각 Zustand 스토어에 hydrate.
 * 이 함수는 클라이언트에서만 호출 가능.
 */
export async function syncAllStores(userId: string): Promise<{ keptLocal: StoreKey[] }> {
  const [
    { useStudyStore },
    { useQuizStore },
    { useLeitnerStore },
    { useBookmarkStore },
    { useOnboardingStore },
    { useFocusStore },
  ] = await Promise.all([
    import('@/stores/useStudyStore'),
    import('@/stores/useQuizStore'),
    import('@/stores/useLeitnerStore'),
    import('@/stores/useBookmarkStore'),
    import('@/stores/useOnboardingStore'),
    import('@/stores/useFocusStore'),
  ]);

  const keys: StoreKey[] = ['study', 'quiz', 'leitner', 'bookmark', 'onboarding', 'focus'];
  const results = await Promise.allSettled(keys.map((k) => pullFromServerWithMeta(userId, k)));

  const storeSetters: Record<StoreKey, { setState: (d: unknown) => void }> = {
    study: { setState: (d) => useStudyStore.setState(d as Partial<ReturnType<typeof useStudyStore.getState>>) },
    quiz: { setState: (d) => useQuizStore.setState(d as Partial<ReturnType<typeof useQuizStore.getState>>) },
    leitner: { setState: (d) => useLeitnerStore.setState(d as Partial<ReturnType<typeof useLeitnerStore.getState>>) },
    bookmark: { setState: (d) => useBookmarkStore.setState(d as Partial<ReturnType<typeof useBookmarkStore.getState>>) },
    onboarding: { setState: (d) => useOnboardingStore.setState(d as Partial<ReturnType<typeof useOnboardingStore.getState>>) },
    focus: { setState: (d) => useFocusStore.setState(d as Partial<ReturnType<typeof useFocusStore.getState>>) },
  };

  const keptLocal: StoreKey[] = [];

  keys.forEach((key, i) => {
    const result = results[i];
    if (result.status === 'rejected') {
      console.warn(`[sync] pull ${key} failed:`, result.reason);
      return;
    }
    const server = result.value;
    if (!server) return;

    // H1: 로컬이 서버보다 최신이면 hydration을 건너뛰고 로컬을 보존한다.
    // (오프라인 학습 후 push 실패 → 다음 로그인 pull이 로컬 신규 데이터를 파괴하는 것 방지)
    const localTs = getLocalModified(key);
    if (localTs && server.updatedAt && localTs > server.updatedAt) {
      keptLocal.push(key);
      return;
    }

    const schema = storeSchemas[key];
    const parsed = schema.safeParse(server.data);
    if (parsed.success) {
      storeSetters[key].setState(parsed.data);
      // 로컬 타임스탬프를 서버와 동기화 (이후 push가 stale로 오인되지 않도록)
      if (server.updatedAt) setLocalModified(key, server.updatedAt);
    } else {
      console.warn(`[sync] ${key} data validation failed:`, parsed.error.issues);
    }
  });

  return { keptLocal };
}
