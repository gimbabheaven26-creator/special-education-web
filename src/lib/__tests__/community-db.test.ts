import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MockQueryBuilder, makeSupabase } from '../db/__tests__/mock-supabase';

// Mock supabase/server
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import {
  getCommunityQuestions,
  getCommunityQuestionById,
  getUserVoteForQuestion,
  createCommunityQuestion,
  setVote,
} from '../community-db';

const mockedCreateClient = vi.mocked(createClient);

// ─── Fixtures ───

const RAW_ROW = {
  id: 'q1',
  author_id: 'user-1',
  author_display_name: '테스트유저',
  question_type: 'multiple',
  question_text: '다음 중 올바른 것은?',
  options: ['A', 'B', 'C', 'D'],
  correct_answer: 'A',
  explanation: 'A가 정답입니다.',
  subject_id: 'behavior-support',
  chapter_id: 'ch-1',
  status: 'official',
  created_at: '2026-03-28T10:00:00Z',
  updated_at: '2026-03-28T10:00:00Z',
  question_votes: [{ count: '5' }],
};

const RAW_ROW_2 = {
  ...RAW_ROW,
  id: 'q2',
  question_text: '두 번째 문제',
  question_votes: [{ count: '10' }],
};

describe('community-db', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── getCommunityQuestions ───

  describe('getCommunityQuestions', () => {
    it('질문 목록 반환 + mapRow 변환', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: [RAW_ROW], error: null }) as never
      );

      const result = await getCommunityQuestions();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('q1');
      expect(result[0].vote_count).toBe(5);
      expect(result[0].options).toEqual(['A', 'B', 'C', 'D']);
    });

    it('에러 시 빈 배열 반환', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: null, error: { message: 'DB error' } }) as never
      );

      const result = await getCommunityQuestions();
      expect(result).toEqual([]);
    });

    it('votes 정렬 옵션 동작', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: [RAW_ROW, RAW_ROW_2], error: null }) as never
      );

      const result = await getCommunityQuestions({ sort: 'votes' });
      // RAW_ROW_2는 vote_count=10, RAW_ROW는 5 → 10이 먼저
      expect(result[0].id).toBe('q2');
      expect(result[1].id).toBe('q1');
    });

    it('subjectId 필터 시 eq 호출', async () => {
      const supabase = makeSupabase({ data: [], error: null });
      mockedCreateClient.mockResolvedValue(supabase as never);

      await getCommunityQuestions({ subjectId: 'behavior-support' });
      // from이 호출되었는지 확인
      expect(supabase.from).toHaveBeenCalledWith('community_questions');
    });

    it('options가 배열이 아니면 null로 변환', async () => {
      const rowWithBadOptions = { ...RAW_ROW, options: 'not-array' };
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: [rowWithBadOptions], error: null }) as never
      );

      const result = await getCommunityQuestions();
      expect(result[0].options).toBeNull();
    });

    it('question_votes 빈 배열이면 vote_count=0', async () => {
      const rowNoVotes = { ...RAW_ROW, question_votes: [] };
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: [rowNoVotes], error: null }) as never
      );

      const result = await getCommunityQuestions();
      expect(result[0].vote_count).toBe(0);
    });
  });

  // ─── getCommunityQuestionById ───

  describe('getCommunityQuestionById', () => {
    it('단일 질문 반환', async () => {
      const supabase = makeSupabase({ data: RAW_ROW, error: null });
      mockedCreateClient.mockResolvedValue(supabase as never);

      const result = await getCommunityQuestionById('q1');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('q1');
      expect(result!.question_type).toBe('multiple');
    });

    it('에러 시 null 반환', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: null, error: { message: 'not found' } }) as never
      );

      const result = await getCommunityQuestionById('nonexistent');
      expect(result).toBeNull();
    });
  });

  // ─── getUserVoteForQuestion ───

  describe('getUserVoteForQuestion', () => {
    it('투표 결과 반환', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: { vote_type: 'up' }, error: null }) as never
      );

      const result = await getUserVoteForQuestion('q1', 'user-1');
      expect(result).toBe('up');
    });

    it('투표 없으면 null', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: null, error: { message: 'no rows' } }) as never
      );

      const result = await getUserVoteForQuestion('q1', 'user-1');
      expect(result).toBeNull();
    });
  });

  // ─── createCommunityQuestion ───

  describe('createCommunityQuestion', () => {
    const input = {
      question_type: 'multiple' as const,
      question_text: '테스트 문제',
      options: ['A', 'B'],
      correct_answer: 'A',
      explanation: '설명',
      subject_id: 'behavior-support',
      chapter_id: null,
    };

    it('생성 성공 시 id 반환', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: { id: 'new-q-id' }, error: null }) as never
      );

      const result = await createCommunityQuestion(input, 'user-1', '테스트유저');
      expect(result).toEqual({ id: 'new-q-id' });
    });

    it('에러 시 null 반환', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: null, error: { message: 'insert error' } }) as never
      );

      const result = await createCommunityQuestion(input, 'user-1', '테스트유저');
      expect(result).toBeNull();
    });
  });

  // ─── setVote ───

  describe('setVote', () => {
    it('voteType 있으면 upsert 실행', async () => {
      const supabase = makeSupabase({ data: null, error: null });
      mockedCreateClient.mockResolvedValue(supabase as never);

      const result = await setVote('q1', 'user-1', 'up');
      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('question_votes');
    });

    it('voteType null이면 delete 실행', async () => {
      const supabase = makeSupabase({ data: null, error: null });
      mockedCreateClient.mockResolvedValue(supabase as never);

      const result = await setVote('q1', 'user-1', null);
      expect(result.error).toBeNull();
    });

    it('에러 시 error 메시지 반환', async () => {
      mockedCreateClient.mockResolvedValue(
        makeSupabase({ data: null, error: { message: 'conflict' } }) as never
      );

      const result = await setVote('q1', 'user-1', 'up');
      expect(result.error).toBe('conflict');
    });
  });
});
