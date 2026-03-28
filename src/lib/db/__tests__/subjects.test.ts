import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));
vi.mock('@/lib/concepts', () => ({ getConceptsForSubject: vi.fn() }));

import { getSubjects, getSubjectBySlug } from '../subjects';
import { createClient } from '@/lib/supabase/server';
import { getConceptsForSubject } from '@/lib/concepts';
import { mockCreateClient } from './mock-supabase';

const mockConcepts = [
  {
    subject: 'diagnosis',
    slug: 'intelligence-tests',
    title: '진단평가 — 지능 검사',
    description: '지능 검사 개요',
    order: 1,
    kiceKeywords: ['지능', 'IQ'],
  },
];

const subjectRow = {
  slug: 'diagnosis',
  title: '진단평가',
  description: '진단평가 과목',
  icon: '🔍',
  color: '#4A90D9',
  sort_order: 1,
};

beforeEach(() => {
  vi.clearAllMocks();
  (getConceptsForSubject as ReturnType<typeof vi.fn>).mockReturnValue(mockConcepts);
});

describe('getSubjects', () => {
  it('DB 에러 시 빈 배열 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null,
      error: new Error('connection failed'),
    });
    const result = await getSubjects();
    expect(result).toEqual([]);
  });

  it('정상 조회 시 Subject[] 매핑 — chapters에 stripSubjectPrefix 적용', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [subjectRow],
      error: null,
    });
    const result = await getSubjects();
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe('diagnosis');
    expect(result[0].order).toBe(1);
    // "진단평가 — 지능 검사" → "지능 검사" (stripSubjectPrefix)
    expect(result[0].chapters[0].title).toBe('지능 검사');
    expect(result[0].chapters[0].keywords).toEqual(['지능', 'IQ']);
  });

  it('접두어 없는 title은 그대로 유지', async () => {
    (getConceptsForSubject as ReturnType<typeof vi.fn>).mockReturnValue([
      { ...mockConcepts[0], title: '지능 검사' },
    ]);
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [subjectRow],
      error: null,
    });
    const result = await getSubjects();
    expect(result[0].chapters[0].title).toBe('지능 검사');
  });
});

describe('getSubjectBySlug', () => {
  it('없는 slug 시 null 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null,
      error: new Error('not found'),
    });
    const result = await getSubjectBySlug('nonexistent');
    expect(result).toBeNull();
  });

  it('정상 조회 시 Subject 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: subjectRow,
      error: null,
    });
    const result = await getSubjectBySlug('diagnosis');
    expect(result?.slug).toBe('diagnosis');
    expect(result?.title).toBe('진단평가');
    expect(result?.chapters).toHaveLength(1);
  });
});
