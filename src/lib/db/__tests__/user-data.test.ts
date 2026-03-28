import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import {
  getProfile,
  updateProfile,
  getUserData,
  upsertUserData,
  getAllUserData,
} from '../user-data';
import { createClient } from '@/lib/supabase/server';
import { mockCreateClient } from './mock-supabase';

const profileRow = {
  id: 'u1',
  display_name: '카이란',
  nickname: 'kairan',
  role: 'admin',
  email: 'kairan@test.com',
  avatar_url: null,
  exam_date: '2026-11-14',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-03-28T00:00:00Z',
};

const userDataRow = {
  id: 'ud1',
  user_id: 'u1',
  store_key: 'study',
  data: { totalMinutes: 120, streakDays: 5 },
  updated_at: '2026-03-28T00:00:00Z',
};

beforeEach(() => { vi.clearAllMocks(); });

describe('getProfile', () => {
  it('존재하는 유저 프로필 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: profileRow, error: null,
    });
    const result = await getProfile('u1');
    expect(result?.display_name).toBe('카이란');
    expect(result?.exam_date).toBe('2026-11-14');
  });

  it('없는 유저 시 null', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('not found'),
    });
    expect(await getProfile('nonexistent')).toBeNull();
  });
});

describe('updateProfile', () => {
  it('성공 시 true 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: null,
    });
    const result = await updateProfile('u1', { display_name: '새이름' });
    expect(result).toBe(true);
  });

  it('DB 에러 시 false 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('update failed'),
    });
    const result = await updateProfile('u1', { display_name: '새이름' });
    expect(result).toBe(false);
  });
});

describe('getUserData', () => {
  it('존재하는 데이터 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: userDataRow, error: null,
    });
    const result = await getUserData('u1', 'study');
    expect(result?.store_key).toBe('study');
    expect(result?.data).toEqual({ totalMinutes: 120, streakDays: 5 });
  });

  it('없는 데이터 시 null', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('not found'),
    });
    expect(await getUserData('u1', 'leitner')).toBeNull();
  });
});

describe('upsertUserData', () => {
  it('성공 시 true', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: null,
    });
    const result = await upsertUserData('u1', 'quiz', { score: 85 });
    expect(result).toBe(true);
  });

  it('DB 에러 시 false', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('upsert failed'),
    });
    const result = await upsertUserData('u1', 'quiz', { score: 85 });
    expect(result).toBe(false);
  });
});

describe('getAllUserData', () => {
  it('유저의 전체 데이터 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [
        userDataRow,
        { ...userDataRow, id: 'ud2', store_key: 'leitner', data: { box1: 10 } },
      ],
      error: null,
    });
    const result = await getAllUserData('u1');
    expect(result).toHaveLength(2);
  });

  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await getAllUserData('u1')).toEqual([]);
  });
});
