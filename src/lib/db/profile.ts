// src/lib/profile.ts
// Server-only. Do NOT import in 'use client' files.

import { createClient } from '@/lib/supabase/server';

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  display_name: string;
  nickname: string;
  role: UserRole;
  show_in_ranking: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * 현재 로그인 사용자의 profile을 가져온다.
 * 미로그인이면 null 반환.
 */
export async function getMyProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, nickname, role, show_in_ranking, created_at, updated_at')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;
  return data as UserProfile;
}

/**
 * 닉네임을 업데이트한다. 현재 로그인 사용자에게만 적용.
 */
export async function upsertNickname(nickname: string): Promise<{ error: string | null }> {
  if (!nickname.trim()) return { error: '닉네임을 입력해주세요.' };
  if (nickname.length > 20) return { error: '닉네임은 20자 이하여야 합니다.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('profiles')
    .update({ nickname: nickname.trim(), updated_at: new Date().toISOString() })
    .eq('id', user.id);

  return { error: error?.message ?? null };
}

/**
 * 현재 사용자가 admin인지 확인한다.
 */
export async function isAdmin(): Promise<boolean> {
  const profile = await getMyProfile();
  return profile?.role === 'admin';
}

/**
 * 현재 사용자의 랭킹 참여 여부를 조회한다.
 */
export async function getRankingOptIn(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('profiles')
    .select('show_in_ranking')
    .eq('id', user.id)
    .single();

  return data?.show_in_ranking === true;
}

/**
 * 현재 사용자의 랭킹 참여 여부를 변경한다.
 */
export async function updateRankingOptIn(show: boolean): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: '로그인이 필요합니다.' };

  const { error } = await supabase
    .from('profiles')
    .update({ show_in_ranking: show, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  return { error: error?.message ?? null };
}
