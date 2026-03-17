/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import {
  getCommunityQuestions,
  getCommunityQuestionById,
  getUserVoteForQuestion,
  createCommunityQuestion,
  setVote,
} from '@/lib/community-db';
import { createClient } from '@/lib/supabase/server';

// Supabase 쿼리 빌더 mock — select/eq/order는 this 반환, await 시 result 반환
class MockQueryBuilder {
  private result: { data: unknown; error: unknown };
  constructor(result: { data: unknown; error: unknown }) { this.result = result; }
  select(_: string) { return this; }
  eq(_k: string, _v: unknown) { return this; }
  order(_k: string, _opts?: unknown) { return this; }
  insert(_: unknown) { return this; }
  upsert(_: unknown, __?: unknown) { return this; }
  delete() { return this; }
  single() { return Promise.resolve(this.result); }
  then<T>(
    resolve: (v: { data: unknown; error: unknown }) => T,
    reject?: (e: unknown) => T,
  ) { return Promise.resolve(this.result).then(resolve, reject); }
  catch<T>(reject: (e: unknown) => T) { return Promise.resolve(this.result).catch(reject); }
  finally(fn: () => void) { return Promise.resolve(this.result).finally(fn); }
}

function makeSupabase(result: { data: unknown; error: unknown }) {
  return { from: vi.fn(() => new MockQueryBuilder(result)) };
}

const baseRow = {
  id: 'q1',
  author_id: 'u1',
  author_display_name: '홍길동',
  question_type: 'multiple',
  question_text: '다음 중 IEP의 구성 요소가 아닌 것은?',
  options: ['현행 수준', '연간 목표', '관련 서비스', '출결 현황'],
  correct_answer: '4',
  explanation: '출결 현황은 IEP 필수 항목이 아니다.',
  subject_id: 'introduction',
  chapter_id: null,
  status: 'pending',
  created_at: '2026-03-18T00:00:00Z',
  updated_at: '2026-03-18T00:00:00Z',
  question_votes: [{ count: '7' }],
};

describe('getCommunityQuestions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('DB 에러 시 빈 배열 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: new Error('fail') }),
    );
    const result = await getCommunityQuestions();
    expect(result).toEqual([]);
  });

  it('vote_count를 question_votes[0].count 문자열에서 파싱', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: [baseRow], error: null }),
    );
    const result = await getCommunityQuestions();
    expect(result[0].vote_count).toBe(7);
    expect(result[0].author_display_name).toBe('홍길동');
  });

  it('question_votes 빈 배열이면 vote_count = 0', async () => {
    const row = { ...baseRow, question_votes: [] };
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: [row], error: null }),
    );
    const result = await getCommunityQuestions();
    expect(result[0].vote_count).toBe(0);
  });

  it('sort=votes 옵션 시 vote_count 내림차순 정렬', async () => {
    const rows = [
      { ...baseRow, id: 'q1', question_votes: [{ count: '3' }] },
      { ...baseRow, id: 'q2', question_votes: [{ count: '10' }] },
    ];
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: rows, error: null }),
    );
    const result = await getCommunityQuestions({ sort: 'votes' });
    expect(result[0].vote_count).toBe(10);
    expect(result[1].vote_count).toBe(3);
  });
});

describe('getCommunityQuestionById', () => {
  it('없는 ID 시 null 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: new Error('not found') }),
    );
    const result = await getCommunityQuestionById('nonexistent');
    expect(result).toBeNull();
  });

  it('존재하는 ID 시 CommunityQuestion 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: baseRow, error: null }),
    );
    const result = await getCommunityQuestionById('q1');
    expect(result?.id).toBe('q1');
    expect(result?.vote_count).toBe(7);
  });
});

describe('getUserVoteForQuestion', () => {
  it('투표 없으면 null 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: null }),
    );
    const result = await getUserVoteForQuestion('q1', 'u1');
    expect(result).toBeNull();
  });

  it('투표 있으면 vote_type 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: { vote_type: 'up' }, error: null }),
    );
    const result = await getUserVoteForQuestion('q1', 'u1');
    expect(result).toBe('up');
  });
});

describe('createCommunityQuestion', () => {
  it('DB 에러 시 null 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: new Error('insert fail') }),
    );
    const result = await createCommunityQuestion(
      { question_type: 'ox', question_text: '맞냐', options: null,
        correct_answer: 'O', explanation: '', subject_id: 'laws', chapter_id: null },
      'u1', '홍길동',
    );
    expect(result).toBeNull();
  });

  it('성공 시 { id } 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: { id: 'new-q1' }, error: null }),
    );
    const result = await createCommunityQuestion(
      { question_type: 'ox', question_text: '맞냐', options: null,
        correct_answer: 'O', explanation: '', subject_id: 'laws', chapter_id: null },
      'u1', '홍길동',
    );
    expect(result?.id).toBe('new-q1');
  });
});

describe('setVote', () => {
  it('voteType=null 시 delete 경로 — 에러 없으면 { error: null }', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: null }),
    );
    const result = await setVote('q1', 'u1', null);
    expect(result.error).toBeNull();
  });

  it('voteType=up 시 upsert 경로 — DB 에러 있으면 에러 메시지 반환', async () => {
    (createClient as ReturnType<typeof vi.fn>).mockResolvedValue(
      makeSupabase({ data: null, error: new Error('upsert fail') }),
    );
    const result = await setVote('q1', 'u1', 'up');
    expect(result.error).toBe('upsert fail');
  });
});
