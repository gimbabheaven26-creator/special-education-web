import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import {
  getQuizzesBySubject,
  getQuizzesByIds,
  getQuizzesByChapters,
  getAllQuizzes,
  getQuizzesByType,
  getQuizzesByChapter,
  getQuizCount,
  searchQuizzes,
} from '../quiz';
import { createClient } from '@/lib/supabase/server';
import { mockCreateClient } from './mock-supabase';

const quizRow = {
  id: 'q1',
  subject: 'laws',
  chapter: 'special-ed-law',
  type: 'ox',
  question: '통합교육은 의무인가?',
  case_context: null,
  options: null,
  answer: 'O',
  explanation: '장애인 등에 대한 특수교육법 제21조',
  wrong_explanations: null,
  difficulty: 2,
  source: 'KICE 2024',
  tags: ['법률', '통합교육'],
  sub_questions: null,
  image_url: null,
  subjects: ['laws', 'introduction'],
};

class RecordingQueryBuilder {
  select = vi.fn(() => this);
  or = vi.fn(() => this);
  in = vi.fn(() => this);
  limit = vi.fn(() => this);

  then<T>(
    resolve: (v: { data: unknown; error: unknown }) => T,
    reject?: (e: unknown) => T,
  ) {
    return Promise.resolve({ data: [quizRow], error: null }).then(resolve, reject);
  }
}

beforeEach(() => { vi.clearAllMocks(); });

describe('getQuizzesBySubject', () => {
  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await getQuizzesBySubject('laws')).toEqual([]);
  });

  it('정상 조회 시 QuizQuestion[] 매핑 (snake_case → camelCase)', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [quizRow], error: null,
    });
    const result = await getQuizzesBySubject('laws');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('q1');
    expect(result[0].caseContext).toBeUndefined(); // null → undefined
    expect(result[0].subjects).toEqual(['laws', 'introduction']);
    expect(result[0].wrongExplanations).toBeUndefined();
  });
});

describe('getQuizzesByIds', () => {
  it('빈 배열 입력 시 DB 호출 없이 빈 배열 반환', async () => {
    const result = await getQuizzesByIds([]);
    expect(result).toEqual([]);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('정상 조회 시 ID 기반 결과 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [quizRow], error: null,
    });
    const result = await getQuizzesByIds(['q1']);
    expect(result[0].id).toBe('q1');
  });
});

describe('getQuizzesByChapters', () => {
  it('여러 챕터 쌍을 단일 Supabase 쿼리로 조회', async () => {
    const builder = new RecordingQueryBuilder();
    const supabase = { from: vi.fn(() => builder) };
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const result = await getQuizzesByChapters([
      { subject: 'assessment', chapter: '지능검사' },
      { subject: 'laws', chapter: '특수교육법총칙과국가의무' },
    ]);

    expect(result).toHaveLength(1);
    expect(supabase.from).toHaveBeenCalledTimes(1);
    expect(builder.or).toHaveBeenCalledTimes(1);
    expect(builder.or).toHaveBeenCalledWith(
      'and(subject.eq.assessment,chapter.eq.지능검사),and(subject.eq.laws,chapter.eq.특수교육법총칙과국가의무)',
    );
    expect(builder.in).toHaveBeenCalledWith('ai_status', ['human', 'approved']);
    expect(builder.limit).toHaveBeenCalledWith(10000);
  });
});

describe('getAllQuizzes', () => {
  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('timeout'),
    });
    expect(await getAllQuizzes()).toEqual([]);
  });

  it('정상 조회 시 전체 퀴즈 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [quizRow, { ...quizRow, id: 'q2' }], error: null,
    });
    expect(await getAllQuizzes()).toHaveLength(2);
  });
});

describe('getQuizzesByType', () => {
  it('타입별 조회', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [quizRow], error: null,
    });
    const result = await getQuizzesByType('ox');
    expect(result[0].type).toBe('ox');
  });
});

describe('getQuizzesByChapter', () => {
  it('과목+챕터 조회', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [quizRow], error: null,
    });
    const result = await getQuizzesByChapter('laws', 'special-ed-law');
    expect(result[0].chapter).toBe('special-ed-law');
  });

  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await getQuizzesByChapter('laws', 'ch1')).toEqual([]);
  });
});

describe('getQuizCount', () => {
  it('과목별 카운트 집계', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [
        { subject: 'laws' },
        { subject: 'laws' },
        { subject: 'diagnosis' },
      ],
      error: null,
    });
    const counts = await getQuizCount();
    expect(counts['laws']).toBe(2);
    expect(counts['diagnosis']).toBe(1);
  });

  it('DB 에러 시 빈 객체', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await getQuizCount()).toEqual({});
  });
});

describe('searchQuizzes', () => {
  it('검색어로 퀴즈 조회', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [quizRow], error: null,
    });
    const result = await searchQuizzes('통합교육');
    expect(result).toHaveLength(1);
  });

  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await searchQuizzes('test')).toEqual([]);
  });
});
