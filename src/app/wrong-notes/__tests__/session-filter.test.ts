/**
 * 세션 필터 로직 단위 테스트.
 *
 * WrongNotesClient에서 사용하는 sessionFilter 조건을
 * 순수 함수로 추출해 검증한다.
 */
import { describe, it, expect } from 'vitest';

interface MinimalWrongNote {
  questionId: string;
  sessionId?: string;
}

function filterBySession<T extends MinimalWrongNote>(
  notes: T[],
  sessionFilter: string,
): T[] {
  if (sessionFilter === 'all') return notes;
  return notes.filter((n) => n.sessionId === sessionFilter);
}

describe('세션 필터', () => {
  const notes: MinimalWrongNote[] = [
    { questionId: 'q1', sessionId: 'diag-2026-03-23-1' },
    { questionId: 'q2', sessionId: 'diag-2026-03-23-2' },
    { questionId: 'q3', sessionId: 'diag-2026-03-23-1' },
    { questionId: 'q4' }, // sessionId 없음
  ];

  it('"all"이면 전체 노트를 반환한다', () => {
    const result = filterBySession(notes, 'all');
    expect(result).toHaveLength(4);
    expect(result).toEqual(notes);
  });

  it('특정 세션 ID로 필터링하면 해당 세션의 노트만 반환한다', () => {
    const result = filterBySession(notes, 'diag-2026-03-23-1');
    expect(result).toHaveLength(2);
    expect(result.map((n) => n.questionId)).toEqual(['q1', 'q3']);
  });

  it('다른 세션 ID로 필터링하면 해당 세션의 노트만 반환한다', () => {
    const result = filterBySession(notes, 'diag-2026-03-23-2');
    expect(result).toHaveLength(1);
    expect(result[0].questionId).toBe('q2');
  });

  it('존재하지 않는 세션 ID로 필터링하면 빈 배열을 반환한다', () => {
    const result = filterBySession(notes, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('sessionId가 없는 노트는 세션 필터에 포함되지 않는다', () => {
    const result = filterBySession(notes, 'diag-2026-03-23-1');
    expect(result.find((n) => n.questionId === 'q4')).toBeUndefined();
  });

  it('원본 배열을 변경하지 않는다 (immutability)', () => {
    const original = [...notes];
    filterBySession(notes, 'diag-2026-03-23-1');
    expect(notes).toEqual(original);
  });
});
