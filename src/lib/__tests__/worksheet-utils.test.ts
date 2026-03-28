import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateWorksheetId,
  saveWorksheet,
  loadWorksheet,
} from '@/lib/worksheet-utils';
import type { WorksheetConfig } from '@/lib/worksheet-utils';

// localStorage 모킹
const storageMock: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => storageMock[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    storageMock[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete storageMock[key];
  }),
  key: vi.fn((index: number) => Object.keys(storageMock)[index] ?? null),
  get length() {
    return Object.keys(storageMock).length;
  },
  clear: vi.fn(() => {
    for (const key of Object.keys(storageMock)) {
      delete storageMock[key];
    }
  }),
};

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

function makeWorksheet(overrides: Partial<WorksheetConfig> = {}): WorksheetConfig {
  return {
    id: 'SP-BH-0001',
    subject: 'behavior-support',
    topicId: 'topic-1',
    topicName: '행동 지원',
    type: 'fill_in',
    questionCount: 5,
    questions: [],
    createdAt: '2026-03-29T10:00:00Z',
    ...overrides,
  };
}

describe('worksheet-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    for (const key of Object.keys(storageMock)) {
      delete storageMock[key];
    }
  });

  // ─── generateWorksheetId ──────────────────────────────────────
  describe('generateWorksheetId', () => {
    it('behavior-support → SP-BH-NNNN 형식', () => {
      const id = generateWorksheetId('behavior-support');
      expect(id).toMatch(/^SP-BH-\d{4}$/);
    });

    it('introduction → SP-IN-NNNN', () => {
      const id = generateWorksheetId('introduction');
      expect(id).toMatch(/^SP-IN-\d{4}$/);
    });

    it('존재하지 않는 과목 → SP-XX-NNNN', () => {
      const id = generateWorksheetId('nonexistent');
      expect(id).toMatch(/^SP-XX-\d{4}$/);
    });

    it('빈 문자열 → SP-XX-NNNN', () => {
      const id = generateWorksheetId('');
      expect(id).toMatch(/^SP-XX-\d{4}$/);
    });

    it('숫자 부분이 1~9999 범위', () => {
      const id = generateWorksheetId('laws');
      const numPart = parseInt(id.split('-')[2], 10);
      expect(numPart).toBeGreaterThanOrEqual(1);
      expect(numPart).toBeLessThanOrEqual(9999);
    });

    it('매 호출마다 ID를 생성한다 (형식 일관성)', () => {
      const ids = Array.from({ length: 10 }, () => generateWorksheetId('curriculum'));
      for (const id of ids) {
        expect(id).toMatch(/^SP-CR-\d{4}$/);
      }
    });
  });

  // ─── saveWorksheet + loadWorksheet ────────────────────────────
  describe('saveWorksheet', () => {
    it('학습지를 localStorage에 저장한다', () => {
      const ws = makeWorksheet();
      saveWorksheet(ws);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'worksheet-SP-BH-0001',
        JSON.stringify(ws),
      );
    });

    it('저장 후 loadWorksheet로 읽을 수 있다', () => {
      const ws = makeWorksheet({ id: 'SP-CR-0042' });
      saveWorksheet(ws);

      const loaded = loadWorksheet('SP-CR-0042');
      expect(loaded).toEqual(ws);
    });

    it('setItem 예외 시 에러를 던지지 않는다', () => {
      localStorageMock.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => saveWorksheet(makeWorksheet())).not.toThrow();
    });
  });

  describe('loadWorksheet', () => {
    it('존재하지 않는 ID → null', () => {
      expect(loadWorksheet('SP-XX-9999')).toBeNull();
    });

    it('잘못된 JSON 저장되어 있으면 null', () => {
      storageMock['worksheet-broken'] = '{invalid json';
      expect(loadWorksheet('broken')).toBeNull();
    });

    it('여러 학습지를 개별 키로 저장/로드', () => {
      const ws1 = makeWorksheet({ id: 'SP-BH-0001' });
      const ws2 = makeWorksheet({ id: 'SP-IN-0002', subject: 'introduction' });
      saveWorksheet(ws1);
      saveWorksheet(ws2);

      expect(loadWorksheet('SP-BH-0001')).toEqual(ws1);
      expect(loadWorksheet('SP-IN-0002')).toEqual(ws2);
    });
  });
});
