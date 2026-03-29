import { describe, it, expect } from 'vitest';
import {
  buildSystemPrompt,
  buildUserPrompt,
  calculateWeeks,
  type GenerationInput,
} from '@/lib/ai/prompts';

describe('calculateWeeks', () => {
  it('1주 차이를 정확히 계산한다', () => {
    expect(calculateWeeks('2026-03-01', '2026-03-08')).toBe(1);
  });

  it('16주(한 학기) 계산', () => {
    expect(calculateWeeks('2026-03-02', '2026-06-22')).toBe(16);
  });

  it('같은 날이면 1주 반환', () => {
    expect(calculateWeeks('2026-03-01', '2026-03-01')).toBe(1);
  });

  it('52주 상한', () => {
    expect(calculateWeeks('2025-01-01', '2027-01-01')).toBe(52);
  });

  it('시작이 종료보다 크면 1주 반환', () => {
    expect(calculateWeeks('2026-06-01', '2026-03-01')).toBe(1);
  });
});

describe('buildSystemPrompt', () => {
  it('시스템 프롬프트에 핵심 규칙이 포함된다', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('IEP');
    expect(prompt).toContain('기본교육과정');
    expect(prompt).toContain('개인정보');
    expect(prompt).toContain('JSON');
  });
});

describe('buildUserPrompt', () => {
  const baseInput: GenerationInput = {
    grade: '중1',
    disabilityType: '지적장애',
    subject: '국어',
    goals: [
      {
        achievement_standard_id: 'uuid-1',
        achievement_standard_code: '09국어01-01',
        description: '듣기 목표 달성',
        target_level: '보통',
        standardContent: '일상생활과 관련된 말을 듣고 내용을 이해한다.',
      },
    ],
    periodStart: '2026-03-02',
    periodEnd: '2026-06-22',
    totalWeeks: 16,
  };

  it('학년, 장애유형, 교과, 주차 수가 포함된다', () => {
    const prompt = buildUserPrompt(baseInput);
    expect(prompt).toContain('중1');
    expect(prompt).toContain('지적장애');
    expect(prompt).toContain('국어');
    expect(prompt).toContain('16주');
  });

  it('성취기준 코드와 내용이 포함된다', () => {
    const prompt = buildUserPrompt(baseInput);
    expect(prompt).toContain('09국어01-01');
    expect(prompt).toContain('일상생활과 관련된 말을 듣고');
  });

  it('목표 수준이 포함된다', () => {
    const prompt = buildUserPrompt(baseInput);
    expect(prompt).toContain('보통');
  });

  it('장애유형이 null이면 미입력으로 표시', () => {
    const input = { ...baseInput, disabilityType: null };
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain('미입력');
  });

  it('여러 목표를 모두 포함한다', () => {
    const input: GenerationInput = {
      ...baseInput,
      goals: [
        ...baseInput.goals,
        {
          achievement_standard_id: 'uuid-2',
          achievement_standard_code: '09국어02-01',
          description: '읽기 목표',
          target_level: '기초',
          standardContent: '글을 읽고 핵심 내용을 파악한다.',
        },
      ],
    };
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain('목표 1');
    expect(prompt).toContain('목표 2');
    expect(prompt).toContain('09국어02-01');
  });
});

describe('buildUserPrompt - JSON 스키마', () => {
  it('출력 스키마에 weekly_plans 필드가 포함된다', () => {
    const input: GenerationInput = {
      grade: '중2',
      disabilityType: null,
      subject: '수학',
      goals: [
        {
          achievement_standard_id: 'uuid-1',
          achievement_standard_code: '09수학01-01',
          description: '수 세기',
          target_level: '기초',
          standardContent: '100까지 수를 세고 읽을 수 있다.',
        },
      ],
      periodStart: '2026-03-01',
      periodEnd: '2026-03-29',
      totalWeeks: 4,
    };
    const prompt = buildUserPrompt(input);
    expect(prompt).toContain('weekly_plans');
    expect(prompt).toContain('week_number');
    expect(prompt).toContain('activity');
    expect(prompt).toContain('materials');
    expect(prompt).toContain('evaluation_method');
  });
});
