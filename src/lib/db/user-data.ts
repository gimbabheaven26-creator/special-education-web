import { createClient } from '@/lib/supabase/server';

export interface Profile {
  id: string;
  display_name: string;
  nickname?: string;
  role?: 'admin' | 'user';
  /** Added in migration 20260322000001 — optional until migration applied */
  email?: string;
  avatar_url?: string;
  exam_date?: string | null;
  created_at: string;
  updated_at: string;
}

export type StoreKey = 'study' | 'leitner' | 'quiz' | 'bookmark' | 'onboarding';

export interface UserDataRow {
  id: string;
  user_id: string;
  store_key: StoreKey;
  data: Record<string, unknown>;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'display_name'>>,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return !error;
}

export async function getUserData(
  userId: string,
  storeKey: StoreKey,
): Promise<UserDataRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .eq('store_key', storeKey)
    .single();
  if (error || !data) return null;
  return data as UserDataRow;
}

export async function upsertUserData(
  userId: string,
  storeKey: StoreKey,
  data: Record<string, unknown>,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from('user_data').upsert(
    {
      user_id: userId,
      store_key: storeKey,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,store_key' },
  );
  return !error;
}

export async function getAllUserData(userId: string): Promise<UserDataRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId);
  if (error || !data) return [];
  return data as UserDataRow[];
}
