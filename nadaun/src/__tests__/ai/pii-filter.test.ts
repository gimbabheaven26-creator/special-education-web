import { describe, it, expect } from 'vitest';
import { stripPii, stripPiiFromObject } from '@/lib/ai/pii-filter';

describe('stripPii', () => {
  it('학교명을 제거한다', () => {
    expect(stripPii('서울대학초등학교에서 공부함')).toBe('[학교명]에서 공부함');
    expect(stripPii('한빛중학교 특수학급')).toBe('[학교명] 특수학급');
    expect(stripPii('명문고등학교 졸업')).toBe('[학교명] 졸업');
  });

  it('전화번호를 제거한다', () => {
    expect(stripPii('연락처: 010-1234-5678')).toBe('연락처: [전화번호]');
    expect(stripPii('02-123-4567 로 연락')).toBe('[전화번호] 로 연락');
  });

  it('이메일을 제거한다', () => {
    expect(stripPii('teacher@school.kr 에게 문의')).toBe('[이메일] 에게 문의');
  });

  it('주소를 제거한다', () => {
    expect(stripPii('서울시 강남구 역삼동')).toBe('[주소] 역삼동');
    expect(stripPii('경기도 수원시 팔달구')).toBe('[주소] 팔달구');
  });

  it('PII가 없으면 원문 유지', () => {
    const text = '국어 듣기·말하기 성취기준에 따라 수업 진행';
    expect(stripPii(text)).toBe(text);
  });

  it('여러 PII를 동시에 제거한다', () => {
    const input = '한빛중학교 김선생(010-1234-5678)';
    const result = stripPii(input);
    expect(result).not.toContain('한빛중학교');
    expect(result).not.toContain('010-1234-5678');
  });
});

describe('stripPiiFromObject', () => {
  it('객체의 모든 string 값에서 PII를 제거한다', () => {
    const obj = {
      name: '김철수',
      school: '서울초등학교 3학년',
      grade: '중1',
    };
    const result = stripPiiFromObject(obj);
    expect(result.school).toBe('[학교명] 3학년');
    expect(result.grade).toBe('중1');
  });

  it('배열 내 string에서 PII를 제거한다', () => {
    const arr = ['서울초등학교', '일반 텍스트'];
    const result = stripPiiFromObject(arr);
    expect(result[0]).toBe('[학교명]');
    expect(result[1]).toBe('일반 텍스트');
  });

  it('중첩 객체를 재귀적으로 처리한다', () => {
    const obj = {
      goal: {
        description: '한빛중학교에서 듣기 수업',
      },
    };
    const result = stripPiiFromObject(obj);
    expect(result.goal.description).toBe('[학교명]에서 듣기 수업');
  });

  it('non-string 값은 그대로 유지한다', () => {
    const obj = { count: 5, flag: true, nothing: null };
    const result = stripPiiFromObject(obj);
    expect(result).toEqual(obj);
  });
});
