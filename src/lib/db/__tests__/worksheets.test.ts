import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import {
  getWorksheetsBySubject,
  getWorksheetsByTopic,
  getWorksheetTopics,
  getAllWorksheetTopics,
  getWorksheetTopicById,
} from '../worksheets';
import { createClient } from '@/lib/supabase/server';
import { mockCreateClient } from './mock-supabase';

const worksheetRow = {
  id: 'w1',
  topic_id: 't1',
  subject: 'laws',
  type: 'fill_in',
  difficulty: 1,
  question: '특수교육대상자 선정 기관은 ___이다.',
  answer: '교육장 또는 교육감',
  explanation: '장특법 제15조',
  source: 'KICE 2023',
  tags: ['선정', '배치'],
};

const topicRow = {
  id: 't1',
  subject: 'laws',
  name: '선정과 배치',
};

beforeEach(() => { vi.clearAllMocks(); });

describe('getWorksheetsBySubject', () => {
  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await getWorksheetsBySubject('laws')).toEqual([]);
  });

  it('정상 조회 시 WorksheetQuestionRow[] 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [worksheetRow], error: null,
    });
    const result = await getWorksheetsBySubject('laws');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('w1');
    expect(result[0].type).toBe('fill_in');
  });
});

describe('getWorksheetsByTopic', () => {
  it('과목+토픽 조회', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [worksheetRow], error: null,
    });
    const result = await getWorksheetsByTopic('laws', 't1');
    expect(result[0].topic_id).toBe('t1');
  });

  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await getWorksheetsByTopic('laws', 't1')).toEqual([]);
  });
});

describe('getWorksheetTopics', () => {
  it('과목별 토픽 조회', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [topicRow], error: null,
    });
    const result = await getWorksheetTopics('laws');
    expect(result[0].name).toBe('선정과 배치');
  });

  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await getWorksheetTopics('laws')).toEqual([]);
  });
});

describe('getAllWorksheetTopics', () => {
  it('전체 토픽 조회', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: [topicRow, { ...topicRow, id: 't2', name: '통합교육' }], error: null,
    });
    expect(await getAllWorksheetTopics()).toHaveLength(2);
  });

  it('DB 에러 시 빈 배열', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('fail'),
    });
    expect(await getAllWorksheetTopics()).toEqual([]);
  });
});

describe('getWorksheetTopicById', () => {
  it('존재하는 ID 시 토픽 반환', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: topicRow, error: null,
    });
    const result = await getWorksheetTopicById('t1');
    expect(result?.id).toBe('t1');
  });

  it('없는 ID 시 null', async () => {
    mockCreateClient(createClient as ReturnType<typeof vi.fn>, {
      data: null, error: new Error('not found'),
    });
    expect(await getWorksheetTopicById('nonexistent')).toBeNull();
  });
});
