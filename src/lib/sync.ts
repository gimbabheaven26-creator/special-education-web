/**
 * Supabase user_data 동기화 유틸
 * 인증 사용자의 Zustand 스토어 상태를 서버에 UPSERT/SELECT
 */

import { createClient } from '@/lib/supabase/browser';

export type StoreKey = 'study' | 'leitner' | 'quiz' | 'bookmark';

/** 함수 제거, 직렬화 가능한 데이터만 추출 */
export function serializeState(state: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(state).filter(([, v]) => typeof v !== 'function'),
  );
}

/** 스토어 데이터를 서버에 UPSERT (비로그인 시 no-op) */
export async function pushStore(key: StoreKey, data: Record<string, unknown>): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from('user_data').upsert(
    { user_id: user.id, store_key: key, data, updated_at: new Date().toISOString() },
    { onConflict: 'user_id,store_key' },
  );
  if (error) console.error(`[sync] push ${key} failed:`, error.message);
}

/** 서버에서 스토어 데이터 조회 (없으면 null) */
export async function pullStore(
  key: StoreKey,
): Promise<{ data: Record<string, unknown>; updatedAt: string } | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_data')
    .select('data, updated_at')
    .eq('user_id', user.id)
    .eq('store_key', key)
    .maybeSingle();

  if (error) {
    console.error(`[sync] pull ${key} failed:`, error.message);
    return null;
  }
  if (!data) return null;
  return { data: data.data as Record<string, unknown>, updatedAt: data.updated_at as string };
}
