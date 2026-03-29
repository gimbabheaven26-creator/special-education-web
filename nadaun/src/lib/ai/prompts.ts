import type { IepGoal } from '@/types/students';

export interface GenerationInput {
  grade: string;
  disabilityType: string | null;
  subject: string;
  goals: Array<
    IepGoal & {
      standardContent: string;
    }
  >;
  periodStart: string;
  periodEnd: string;
  totalWeeks: number;
}

export interface GeneratedWeeklyPlan {
  week_number: number;
  achievement_standard_id: string | null;
  activity: string;
  materials: string;
  evaluation_method: string;
  notes: string;
}

export interface GenerationResult {
  weekly_plans: GeneratedWeeklyPlan[];
}

const WEEKLY_PLAN_SCHEMA = `{
  "weekly_plans": [
    {
      "week_number": 1,
      "achievement_standard_id": "성취기준 UUID 또는 null",
      "activity": "수업 활동 내용 (2~3문장)",
      "materials": "교재/교구/준비물",
      "evaluation_method": "평가 방법 (관찰, 수행, 포트폴리오 등)",
      "notes": "유의사항 또는 개별화 전략"
    }
  ]
}`;

export function buildSystemPrompt(): string {
  return `당신은 특수교육 전문가이며 IEP(개별화교육계획) 작성을 보조합니다.

역할:
- 기본교육과정 성취기준에 기반하여 주차별 수업 계획을 생성합니다.
- 학생의 장애 특성과 현행수준(목표 수준)을 고려합니다.
- 실제 특수학급 수업에서 바로 활용 가능한 구체적 활동을 제안합니다.

규칙:
1. 절대 학생 이름, 학교명, 개인정보를 생성하거나 언급하지 마세요.
2. 성취기준 코드와 내용을 정확히 반영하세요.
3. 활동은 구체적이고 실행 가능해야 합니다 (모호한 표현 금지).
4. 평가 방법은 특수교육 맥락에 맞게 (관찰, 수행평가, 포트폴리오 등).
5. 교재/교구는 실제 구할 수 있는 것만 언급하세요.
6. 반드시 순수 JSON만 출력하세요. 마크다운 코드블록(\`\`\`), 설명, 주석을 절대 포함하지 마세요. 첫 글자가 { 이어야 합니다.`;
}

export function buildUserPrompt(input: GenerationInput): string {
  const goalsText = input.goals
    .map(
      (g, i) =>
        `목표 ${i + 1}:
  - 성취기준: ${g.achievement_standard_code} — ${g.standardContent}
  - 목표 설명: ${g.description}
  - 목표 수준: ${g.target_level}
  - 성취기준 ID: ${g.achievement_standard_id}`
    )
    .join('\n\n');

  return `다음 IEP 정보를 기반으로 ${input.totalWeeks}주차 수업 계획을 생성해주세요.

학생 정보:
- 학년: ${input.grade}
- 장애유형: ${input.disabilityType ?? '미입력'}
- 교과: ${input.subject}
- 수업 기간: ${input.periodStart} ~ ${input.periodEnd} (${input.totalWeeks}주)

IEP 목표:
${goalsText}

요구사항:
- 총 ${input.totalWeeks}주차 계획을 생성하세요.
- 각 주차에 가장 적합한 성취기준 ID를 achievement_standard_id에 넣으세요.
- 목표가 여러 개면 주차별로 골고루 배분하세요.
- ${input.totalWeeks}주 동안 점진적으로 난이도가 올라가도록 설계하세요.
- 초반은 탐색/기초, 중반은 연습/적용, 후반은 심화/평가 구조로 구성하세요.

JSON 스키마:
${WEEKLY_PLAN_SCHEMA}

위 스키마에 맞는 JSON만 출력하세요.`;
}

/** 주차 수 계산 (기간 기반) */
export function calculateWeeks(periodStart: string, periodEnd: string): number {
  const start = new Date(periodStart);
  const end = new Date(periodEnd);
  const diffMs = end.getTime() - start.getTime();
  const diffWeeks = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(diffWeeks, 52));
}
