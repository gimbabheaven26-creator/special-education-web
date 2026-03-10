import type { QuizQuestion } from '@/types/quiz';

export const behaviorSupportQuizzes: QuizQuestion[] = [
  {
    id: 'bs-q1',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'multiple',
    question: '정적 강화(positive reinforcement)에 해당하는 것은?',
    options: [
      '문제행동 후 혐오자극을 제거하는 것',
      '바람직한 행동 후 선호하는 자극을 제공하는 것',
      '문제행동 후 선호하는 자극을 제거하는 것',
      '바람직한 행동 후 혐오자극을 제시하는 것',
    ],
    answer: 1,
    explanation: '정적 강화는 바람직한 행동이 나타난 후 선호하는 자극(강화제)을 제공하여 해당 행동의 발생 빈도를 증가시키는 것입니다.',
    difficulty: 1,
    source: 'Cooper, Heron & Heward (2020)',
  },
  {
    id: 'bs-q2',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'ox',
    question: '소거(extinction)란 강화를 중단하여 행동의 빈도를 감소시키는 절차이다.',
    answer: 'O',
    explanation: '소거는 이전에 강화되던 행동에 대해 강화를 더 이상 제공하지 않음으로써 행동의 빈도를 감소시키는 절차입니다.',
    difficulty: 1,
  },
  {
    id: 'bs-q3',
    subject: 'behavior-support',
    chapter: 'pbs',
    type: 'multiple',
    question: '긍정적 행동지원(PBS)의 3단계 예방 모델에서 1차 예방(보편적 지원)의 대상은?',
    options: [
      '심각한 행동 문제를 보이는 학생 (약 5%)',
      '위험군 학생 (약 15%)',
      '전체 학생 (약 80%)',
      '특수교육대상자만',
    ],
    answer: 2,
    explanation: 'PBS의 3단계 모델에서 1차 예방(보편적 지원)은 전체 학생의 약 80%를 대상으로 하며, 학교 전체 차원의 기대 행동 교수와 강화 시스템을 운영합니다.',
    difficulty: 2,
    source: '특수교육법 제2조',
  },
  {
    id: 'bs-q4',
    subject: 'behavior-support',
    chapter: 'fba',
    type: 'fill_in',
    question: '행동의 기능을 파악하기 위해 선행사건(A), 행동(B), 후속결과(C)를 관찰하는 방법을 ( ) 기록법이라 한다.',
    answer: 'ABC',
    explanation: 'ABC 기록법은 선행사건(Antecedent), 행동(Behavior), 후속결과(Consequence)를 관찰·기록하여 행동의 기능을 분석하는 방법입니다.',
    difficulty: 1,
    source: 'Cooper, Heron & Heward (2020)',
    tags: { disability: '정서행동장애' },
  },
  {
    id: 'bs-q5',
    subject: 'behavior-support',
    chapter: 'intervention',
    type: 'multiple',
    question: '토큰 경제(token economy)에 대한 설명으로 올바르지 않은 것은?',
    options: [
      '토큰은 그 자체로 강화 기능이 있다',
      '토큰을 모아 후원강화제와 교환할 수 있다',
      '집단 상황에서 적용 가능하다',
      '반응대가(response cost)와 함께 사용할 수 있다',
    ],
    answer: 0,
    explanation: '토큰은 그 자체로는 강화 기능이 없는 조건강화제(conditioned reinforcer)입니다. 토큰을 모아 후원강화제(backup reinforcer)와 교환할 때 강화 효과가 발생합니다.',
    difficulty: 2,
  },
  {
    id: 'bs-q6',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'fill_in',
    question: 'Baer, Wolf & Risley(1968)가 제시한 ABA의 ( )가지 차원 중, 행동 변화가 다양한 상황·시간·행동으로 지속되어야 함을 의미하는 차원은 ( )이다.',
    answer: '7 / 일반성',
    explanation: 'ABA의 7가지 차원은 응용적, 행동적, 분석적, 기술적, 개념적 체계, 효과적, 일반성입니다. 일반성(Generality) 차원은 행동 변화가 특정 상황에 국한되지 않고 다른 환경·시간·행동으로 일반화되어야 함을 의미합니다.',
    difficulty: 2,
    source: 'Baer, Wolf & Risley (1968)',
    tags: {
      disability: '정서행동장애',
    },
  },
  {
    id: 'bs-q7',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'fill_in',
    question: '행동 후 혐오자극이 제거되어 행동의 빈도가 증가하는 것은 ( )이고, 행동 후 선호자극이 제거되어 행동의 빈도가 감소하는 것은 ( )이다.',
    answer: '부적 강화 / 부적 벌',
    explanation: '강화와 벌의 구분: 강화는 행동 빈도 증가, 벌은 행동 빈도 감소를 의미합니다. 정적(positive)은 자극을 더함(+), 부적(negative)은 자극을 제거(-)를 의미합니다. 따라서 혐오자극 제거→빈도 증가는 부적 강화이고, 선호자극 제거→빈도 감소는 부적 벌입니다.',
    difficulty: 2,
    tags: {
      disability: '지적장애',
    },
  },
  {
    id: 'bs-q8',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'ox',
    question: '소거 폭발(extinction burst)이란 소거 절차 적용 초기에 행동의 빈도와 강도가 일시적으로 증가하는 현상으로, 이때 소거를 중단하면 간헐적 강화 효과로 인해 행동이 더욱 강화될 수 있다.',
    answer: 'O',
    explanation: '소거 폭발은 소거 초기에 나타나는 정상적인 현상입니다. 이때 교사가 소거를 포기하고 행동에 반응하면 간헐적 강화(intermittent reinforcement)가 이루어져 행동이 더욱 강하고 지속적으로 유지됩니다. 소거 폭발 시에도 일관성 있게 소거를 유지하는 것이 중요합니다.',
    difficulty: 2,
  },
  {
    id: 'bs-q9',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'descriptive',
    caseContext: `다음은 중학교 특수학급 담임 이 교사의 관찰 일지이다.

[학생 B(13세, 자폐성장애 1급)]
- 수업 장면: 이 교사가 B에게 수학 문제 풀기를 지시함
- 행동: B가 책상을 손바닥으로 세게 치며 큰 소리를 냄
- 교사 반응: 이 교사는 B가 흥분했다고 판단하여 즉시 수학 문제를 거두고 B가 좋아하는 퍼즐 활동을 제공함
- 결과: B의 책상 치기 행동이 점차 빈번해지고 있음`,
    question: '(1) 위 사례를 3항 수반성(A-B-C)으로 분석하시오. (2) B의 책상 치기 행동이 증가하는 이유를 강화의 원리로 설명하시오. (3) 이 교사가 취해야 할 적절한 행동 중재 방향을 제시하시오.',
    answer: `(1) 3항 수반성 분석
- 선행자극(A): 이 교사가 수학 문제 풀기를 지시함
- 행동(B): 책상을 손바닥으로 세게 치며 큰 소리를 냄
- 후속자극(C): 수학 문제가 제거되고 선호하는 퍼즐 활동이 제공됨

(2) 강화 원리 설명
B의 책상 치기 행동은 두 가지 강화를 동시에 받고 있다.
- 부적 강화: 행동 후 혐오자극(수학 문제)이 제거되어 행동 빈도가 증가함
- 정적 강화: 행동 후 선호자극(퍼즐 활동)이 제공되어 행동 빈도가 증가함
이 두 가지 강화가 중첩되어 책상 치기 행동이 점점 빈번해지는 것이다.

(3) 적절한 행동 중재 방향
- 문제행동에 대한 강화 중단(소거): 책상 치기 행동에 더 이상 수학 문제 회수나 퍼즐 제공으로 반응하지 않는다.
- 기능적 의사소통 훈련(FCT): B가 도움 요청이나 휴식 요구를 적절한 방법(언어, AAC 등)으로 표현하도록 교수한다.
- 선행사건 수정: 수학 과제의 난이도를 조절하거나, 과제 전 예고를 통해 혐오자극의 강도를 줄인다.`,
    explanation: '이 사례는 문제행동이 정적 강화(선호 활동 제공)와 부적 강화(혐오 과제 제거)를 동시에 받아 유지되는 전형적인 패턴입니다. 기능적 행동평가(FBA)를 통해 행동의 기능(회피, 관심, 물건 획득 등)을 파악하고, 그에 맞는 중재를 적용하는 것이 PBS의 핵심입니다.',
    difficulty: 3,
    tags: {
      disability: '자폐성장애',
    },
  },
  {
    id: 'bs-q10',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'fill_in',
    question: '소거 후 일정 시간이 지난 뒤 이전에 소거된 행동이 일시적으로 다시 나타나는 현상을 ( )이라 하며, 이는 소거가 완전히 끝난 것이 아님을 의미한다.',
    answer: '자발적 회복',
    explanation: '자발적 회복(spontaneous recovery)은 소거 완료 후에도 일정 시간이 지나면 소거된 행동이 일시적으로 다시 나타나는 현상입니다. 이때에도 동일한 소거 절차를 적용하면 이전보다 빠르게 행동이 감소합니다. 소거가 한 번에 완전히 이루어지지 않음을 보여 주는 현상입니다.',
    difficulty: 2,
    tags: {
      disability: '정서행동장애',
    },
  },
];
