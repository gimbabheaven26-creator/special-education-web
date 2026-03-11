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
  // ── Chapter: aba (q11–q17) ──
  {
    id: 'behav-q11',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'multiple',
    question:
      '간헐강화계획(intermittent reinforcement schedule)에서 일정한 횟수의 반응 후 강화를 제공하는 것은?',
    options: [
      '고정비율(FR) 계획',
      '변동비율(VR) 계획',
      '고정간격(FI) 계획',
      '변동간격(VI) 계획',
    ],
    answer: 0,
    explanation:
      '고정비율(FR: Fixed Ratio) 계획은 정해진 횟수의 반응이 나타난 후 강화를 제공합니다(예: FR5 = 5회 반응 후 강화). 변동비율(VR)은 평균적으로 일정 횟수 반응 후 강화하되 매번 다릅니다. 고정간격(FI)은 일정 시간 경과 후 첫 반응에 강화, 변동간격(VI)은 평균적으로 일정 시간 간격 후 강화합니다. VR과 VI 계획은 소거에 가장 저항적입니다.',
    difficulty: 1,
  },
  {
    id: 'behav-q12',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'fill_in',
    question:
      '촉구(prompt)의 위계에서 가장 침습적(intrusive)인 것은 ( ) 촉구이고, 가장 비침습적(least intrusive)인 것은 ( ) 촉구이다.',
    answer: '신체적(physical) / 자연적 단서(natural cue) 또는 제스처(gestural)',
    explanation:
      '촉구의 침습성 위계(가장 침습적→비침습적): 전신체적 촉구(full physical) → 부분 신체적 촉구(partial physical) → 모델링(model) → 언어적 촉구(verbal) → 시각적/제스처 촉구(visual/gestural) → 자연적 단서. 촉구 용암법(fading)은 가장 침습적 촉구에서 시작하여 점진적으로 줄이거나(most-to-least), 최소 촉구에서 시작하여 필요시 강화(least-to-most)하는 방식이 있습니다.',
    difficulty: 2,
  },
  {
    id: 'behav-q13',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'ox',
    question:
      '용암법(fading)은 촉구를 점진적으로 줄여 자연적 자극만으로 행동이 발생하도록 하는 절차이고, 행동형성(shaping)은 목표 행동에 점진적으로 근접하는 반응을 차별 강화하는 절차이다.',
    answer: 'O',
    explanation:
      '용암법(fading)은 보조 자극(촉구)을 점진적으로 제거하여 자연적 자극(natural cue)만으로 정반응이 유지되도록 하는 자극 변화 절차입니다. 행동형성(shaping)은 목표 행동을 아직 수행하지 못할 때, 목표에 접근하는 연속적 근사치(successive approximations)를 차별 강화하여 새로운 행동을 형성하는 절차입니다.',
    difficulty: 2,
  },
  {
    id: 'behav-q14',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'multiple',
    question:
      '행동연쇄(chaining)에서 과제분석의 마지막 단계부터 가르치기 시작하는 방법은?',
    options: [
      '전진연쇄(forward chaining)',
      '후진연쇄(backward chaining)',
      '전체 과제 제시(total task presentation)',
      '동시 촉구(simultaneous prompting)',
    ],
    answer: 1,
    explanation:
      '후진연쇄(backward chaining)는 과제분석의 마지막 단계부터 교수하여, 학생이 최종 단계를 독립적으로 수행→강화를 받도록 합니다. 이전 단계들은 교사가 수행합니다. 전진연쇄(forward chaining)는 첫 단계부터 시작하여 순차적으로 교수합니다. 전체 과제 제시법은 모든 단계를 매 시행마다 연습합니다. 후진연쇄는 즉각적인 강화 경험을 제공하여 동기 유발에 효과적입니다.',
    difficulty: 2,
  },
  {
    id: 'behav-q15',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'fill_in',
    question:
      '강화계획 중 소거 저항이 가장 높아 문제행동 유지에 관여하기 쉬운 것은 ( ) 계획이며, 이는 강화가 예측 불가능한 시점에 제공되기 때문이다.',
    answer: '변동비율(VR) 또는 변동간격(VI)',
    explanation:
      '변동비율(VR) 계획과 변동간격(VI) 계획은 강화 시점이 예측 불가능하여 소거에 가장 저항적입니다. 이는 마치 도박 기계(slot machine)와 같은 원리입니다. 따라서 문제행동이 간헐적으로 강화되는 경우 소거가 어려워지며, 소거 절차 적용 시 일관성이 특히 중요합니다.',
    difficulty: 2,
  },
  {
    id: 'behav-q16',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'multiple',
    question:
      '다음 중 부적 강화(negative reinforcement)의 사례로 가장 적절한 것은?',
    options: [
      '학생이 문제행동을 보이면 교사가 관심을 준다',
      '학생이 과제를 완수하면 스티커를 받는다',
      '학생이 소리를 지르면 어려운 과제가 철회된다 → 소리 지르기 행동 증가',
      '학생이 떠들면 쉬는 시간이 줄어든다 → 떠드는 행동 감소',
    ],
    answer: 2,
    explanation:
      '부적 강화는 행동 후 혐오자극이 제거(-)되어 행동 빈도가 증가하는 것입니다. "소리를 지르면 어려운 과제(혐오자극)가 철회되어 소리 지르기 행동이 증가"하는 것은 전형적인 부적 강화 사례입니다. ①은 정적 강화(관심 획득), ②는 정적 강화(선호 자극 제공), ④는 부적 벌(선호 자극 제거→행동 감소)입니다.',
    difficulty: 1,
  },
  {
    id: 'behav-q17',
    subject: 'behavior-support',
    chapter: 'aba',
    type: 'ox',
    question:
      '변별자극(SD)은 강화가 가용한 조건을 신호하는 선행자극이며, S-delta(SΔ)는 강화가 가용하지 않은 조건을 신호하는 선행자극이다.',
    answer: 'O',
    explanation:
      '변별자극(SD: discriminative stimulus)은 특정 행동에 대해 강화가 가용함을 나타내는 선행자극입니다. 예를 들어, 초록 신호등(SD)은 횡단보도를 건너는 행동에 대한 강화(안전하게 이동)가 가용함을 신호합니다. S-delta(SΔ)는 행동에 대한 강화가 가용하지 않음을 나타내는 선행자극(예: 빨간 신호등)입니다. 자극 변별(stimulus discrimination)은 SD와 SΔ를 구분하여 반응하는 것입니다.',
    difficulty: 3,
  },
  // ── Chapter: pbs (q18–q23) ──
  {
    id: 'behav-q18',
    subject: 'behavior-support',
    chapter: 'pbs',
    type: 'fill_in',
    question:
      'SWPBS(학교 차원 긍정적 행동지원)에서 학교의 기대행동을 장소별로 정리한 도표를 ( )이라 하며, 이를 통해 전체 학생에게 명시적으로 기대행동을 교수한다.',
    answer: '기대행동 매트릭스(behavior expectation matrix)',
    explanation:
      '기대행동 매트릭스(behavior expectation matrix)는 학교의 핵심 가치(예: 존중, 책임, 안전)를 교실, 복도, 식당, 운동장 등 장소별로 구체적인 기대행동으로 정의한 도표입니다. 예: "복도에서 존중" = "조용히 오른쪽으로 걷기". 이 매트릭스를 전체 교직원이 공유하고 학생에게 직접 교수·강화합니다.',
    difficulty: 2,
  },
  {
    id: 'behav-q19',
    subject: 'behavior-support',
    chapter: 'pbs',
    type: 'multiple',
    question:
      'SWPBS 2단계(targeted intervention)에서 행동 위험군 학생에게 적용하는 대표적인 중재인 CICO(Check-In/Check-Out)의 핵심 절차는?',
    options: [
      '학생이 매일 아침 지정된 성인에게 등교 확인을 받고, 하교 시 하루의 행동 수행 결과를 확인·피드백 받는다',
      '학생에게 개별 심리 상담을 주 3회 실시한다',
      '문제행동 발생 시 즉시 교장실로 보내어 반성문을 쓰게 한다',
      '학생을 소집단으로 묶어 매주 1회 사회적 기술 훈련을 실시한다',
    ],
    answer: 0,
    explanation:
      'CICO(Check-In/Check-Out, 등·하교 확인)는 SWPBS 2단계의 대표적 중재입니다. 학생은 매일 아침 지정된 성인(멘토)에게 등교 확인(check-in)을 받고 일일행동카드(Daily Progress Report)를 받습니다. 하루 동안 각 수업에서 교사가 행동을 평정하고, 하교 시 멘토에게 결과를 확인(check-out)받습니다. 이를 통해 구조화된 피드백과 긍정적 성인 관계를 제공합니다.',
    difficulty: 2,
  },
  {
    id: 'behav-q20',
    subject: 'behavior-support',
    chapter: 'pbs',
    type: 'ox',
    question:
      '긍정적 행동지원(PBS)에서 대체행동 교수(FCT: Functional Communication Training)는 문제행동과 동일한 기능을 수행하는 적절한 의사소통 행동을 가르치는 것이며, 이를 위해 먼저 FBA를 통해 행동의 기능을 파악해야 한다.',
    answer: 'O',
    explanation:
      'FCT(기능적 의사소통 훈련)는 FBA로 파악된 문제행동의 기능에 기반하여, 같은 기능을 수행할 수 있는 사회적으로 적절한 의사소통 행동을 대체행동으로 교수합니다. 예: 과제 회피 기능 → "쉬고 싶어요" 카드 사용, 관심 획득 기능 → "같이 놀아주세요" 표현. FBA 없이 FCT를 적용하면 기능이 맞지 않아 효과가 제한됩니다.',
    difficulty: 2,
    tags: { disability: '자폐성장애' },
  },
  {
    id: 'behav-q21',
    subject: 'behavior-support',
    chapter: 'pbs',
    type: 'multiple',
    question:
      '행동중재계획(BIP: Behavior Intervention Plan)의 필수 구성요소에 해당하지 않는 것은?',
    options: [
      'FBA 결과에 기반한 행동의 기능 가설',
      '선행사건 수정(예방) 전략',
      '학생의 IQ 점수 및 학업 성취 등급',
      '대체행동 교수 전략 및 후속결과 전략',
    ],
    answer: 2,
    explanation:
      'BIP의 필수 구성요소: ① 표적행동의 조작적 정의 ② FBA 결과(행동의 기능 가설) ③ 선행사건 수정(예방) 전략 ④ 대체행동/바람직한 행동 교수 전략 ⑤ 후속결과 전략(강화 및 소거 절차) ⑥ 위기 관리 계획 ⑦ 모니터링 및 평가 계획. 학생의 IQ 점수나 학업 성취 등급은 BIP의 필수 구성요소가 아닙니다.',
    difficulty: 2,
  },
  {
    id: 'behav-q22',
    subject: 'behavior-support',
    chapter: 'pbs',
    type: 'fill_in',
    question:
      'SWPBS 3단계 모델에서 1단계(보편적 지원)는 전체 학생의 약 ( )%를, 2단계(표적 집단 지원)는 약 ( )%를, 3단계(개별화 집중 지원)는 약 ( )%를 대상으로 한다.',
    answer: '80 / 15 / 5',
    explanation:
      'SWPBS의 3단계 예방 모델은 공중보건 모형에 기반합니다. 1단계(universal/primary): 전체 학생의 약 80%에게 효과적인 학교 전체 차원의 보편적 예방 지원, 2단계(targeted/secondary): 보편적 지원만으로 불충분한 위험군 학생 약 15%에 대한 소집단 표적 중재, 3단계(intensive/tertiary): 심각한 행동 문제를 보이는 학생 약 5%에 대한 개별화된 집중 중재(FBA/BIP 포함).',
    difficulty: 1,
  },
  {
    id: 'behav-q23',
    subject: 'behavior-support',
    chapter: 'pbs',
    type: 'ox',
    question:
      'PBS(긍정적 행동지원)는 문제행동을 벌(punishment)로 억제하는 것이 아니라, 환경 재구성, 기술 교수, 강화 시스템을 통해 바람직한 행동을 증진하고 문제행동의 발생을 예방하는 접근이다.',
    answer: 'O',
    explanation:
      'PBS(긍정적 행동지원)는 응용행동분석(ABA)의 원리를 기반으로 하되, 벌 중심의 사후적 대응보다는 환경 수정(선행사건 중심), 대체행동 및 사회적 기술 교수, 체계적 강화 시스템을 통해 문제행동을 예방하고 삶의 질을 향상시키는 것을 강조합니다. IDEA에서는 행동 문제가 있는 학생에게 FBA와 PBS를 적용하도록 규정하고 있습니다.',
    difficulty: 1,
  },
  // ── Chapter: intervention (q24–q30) ──
  {
    id: 'behav-q24',
    subject: 'behavior-support',
    chapter: 'intervention',
    type: 'multiple',
    question:
      '토큰 경제(token economy) 시스템의 필수 구성요소에 해당하지 않는 것은?',
    options: [
      '토큰(조건강화제)',
      '후원강화제(backup reinforcer)와 교환 비율',
      '표적 행동의 명확한 정의',
      '학생의 의료 기록 및 투약 정보',
    ],
    answer: 3,
    explanation:
      '토큰 경제의 필수 구성요소: ① 토큰(조건강화제): 점수, 스티커, 칩 등 ② 후원강화제(backup reinforcer): 토큰과 교환할 수 있는 실제 강화제 ③ 교환 비율 및 시기 ④ 표적 행동의 명확한 정의 ⑤ 토큰 제공 규칙. 반응대가(response cost: 문제행동 시 토큰 회수)를 함께 사용할 수도 있습니다. 의료 기록은 토큰 경제의 구성요소가 아닙니다.',
    difficulty: 1,
  },
  {
    id: 'behav-q25',
    subject: 'behavior-support',
    chapter: 'intervention',
    type: 'fill_in',
    question:
      '자기관리(self-management) 중재에서 학생이 자신의 행동 발생 여부를 스스로 관찰·기록하는 것을 ( )이라 하고, 스스로 기준을 충족했을 때 강화를 제공하는 것을 ( )이라 한다.',
    answer: '자기점검(self-monitoring) / 자기강화(self-reinforcement)',
    explanation:
      '자기관리(self-management) 전략에는 ① 자기점검(self-monitoring): 자신의 행동을 관찰하고 기록 ② 자기평가(self-evaluation): 행동을 기준과 비교하여 평가 ③ 자기강화(self-reinforcement): 기준 충족 시 스스로 강화 제공 ④ 자기교수(self-instruction): 과제 수행 절차를 스스로 언어화. 이러한 전략은 외부 강화에 대한 의존을 줄이고 자율성을 높이는 데 효과적입니다.',
    difficulty: 2,
    tags: { disability: '학습장애' },
  },
  {
    id: 'behav-q26',
    subject: 'behavior-support',
    chapter: 'intervention',
    type: 'multiple',
    question:
      '행동계약(behavioral contract)의 구성 요소로 적절하지 않은 것은?',
    options: [
      '표적 행동의 명시적 기술',
      '행동 수행에 따른 보상(강화제)',
      '계약 불이행 시의 체벌 조항',
      '계약 당사자(학생, 교사, 보호자 등)의 서명',
    ],
    answer: 2,
    explanation:
      '행동계약의 5가지 기본 요소: ① 표적 행동의 구체적 기술 ② 행동 수행 기준(준거) ③ 강화제 및 제공 조건 ④ 계약 기간 ⑤ 계약 당사자의 서명. 행동계약은 긍정적 접근에 기반하며 체벌 조항은 포함되지 않습니다. 필요시 반응대가(response cost) 조항을 포함할 수 있으나, 이는 체벌이 아닌 토큰 회수 등의 절차입니다.',
    difficulty: 1,
  },
  {
    id: 'behav-q27',
    subject: 'behavior-support',
    chapter: 'intervention',
    type: 'ox',
    question:
      '인지적 행동수정(cognitive behavior modification)에서 Meichenbaum의 자기교수훈련(self-instructional training)은 학생이 과제 수행 과정에서 자신에게 말하는 내적 언어(inner speech)를 체계적으로 활용하도록 교수하는 방법이다.',
    answer: 'O',
    explanation:
      'Meichenbaum의 자기교수훈련(self-instructional training)은 5단계로 구성됩니다: ① 인지적 모델링(교사가 소리 내어 자기교수하며 시범) → ② 외현적 외부 안내(학생이 교사의 언어적 지시를 따라 수행) → ③ 외현적 자기안내(학생이 소리 내어 스스로 지시하며 수행) → ④ 점차 소리를 줄여감(소근소근) → ⑤ 내현적 자기교수(속으로 자기교수하며 수행). 이 절차는 충동성 조절, 주의집중 향상에 효과적입니다.',
    difficulty: 3,
    tags: { disability: '정서행동장애' },
  },
  {
    id: 'behav-q28',
    subject: 'behavior-support',
    chapter: 'intervention',
    type: 'fill_in',
    question:
      '사회적 기술 훈련의 일반적 절차를 순서대로 나열하면: 교수(직접 교수/설명) → ( ) → 리허설(역할극/연습) → ( ) → 일반화 촉진이다.',
    answer: '모델링(시범 보이기) / 피드백(수행에 대한 교정적 피드백 및 강화)',
    explanation:
      '사회적 기술 훈련(social skills training)의 일반적 절차: ① 교수(direct instruction): 기술의 중요성 설명, 단계 제시 → ② 모델링(modeling): 교사나 또래가 올바른 수행 시범 → ③ 리허설(rehearsal): 역할극, 연습 기회 제공 → ④ 피드백(feedback): 수행에 대한 구체적 피드백과 강화 → ⑤ 일반화(generalization): 다양한 상황에서의 적용 촉진. 이 절차는 Gresham 등의 사회적 기술 중재 모형에 기반합니다.',
    difficulty: 2,
  },
  {
    id: 'behav-q29',
    subject: 'behavior-support',
    chapter: 'intervention',
    type: 'multiple',
    question:
      '자기점검(self-monitoring)에 대한 설명으로 옳지 않은 것은?',
    options: [
      '학생이 외부 관찰자 없이도 자신의 행동을 관찰하고 기록할 수 있다',
      '자기점검 자체만으로도 행동 변화를 유발하는 반응성(reactivity) 효과가 있다',
      '자기점검은 반드시 교사가 실시간으로 감독해야만 효과가 있다',
      'ADHD 학생의 주의집중 행동 증진에 효과적으로 활용될 수 있다',
    ],
    answer: 2,
    explanation:
      '자기점검(self-monitoring)은 학생이 독립적으로 자신의 행동을 관찰·기록하는 자기관리 전략으로, 교사의 실시간 감독 없이도 효과적입니다. 오히려 학생의 자율성과 독립성을 높이는 것이 자기점검의 장점입니다. 자기점검 자체가 행동에 대한 자각을 높여 반응성(reactivity) 효과로 행동 변화를 유발할 수 있습니다.',
    difficulty: 2,
    tags: { disability: '학습장애' },
  },
  {
    id: 'behav-q30',
    subject: 'behavior-support',
    chapter: 'intervention',
    type: 'multiple',
    question:
      '인지적 행동수정(CBM: Cognitive Behavior Modification)의 주요 전략에 해당하지 않는 것은?',
    options: [
      '자기교수(self-instruction)',
      '문제해결 훈련(problem-solving training)',
      '분노 관리(anger management)',
      '감각통합 치료(sensory integration therapy)',
    ],
    answer: 3,
    explanation:
      '인지적 행동수정(CBM)의 주요 전략: ① 자기교수훈련(Meichenbaum) ② 문제해결 훈련 ③ 분노 관리/분노 대체 훈련 ④ 사회적 기술 훈련 ⑤ 인지적 재구조화 등. 감각통합 치료는 작업치료 영역의 접근으로, 인지적 행동수정 전략에는 포함되지 않습니다. CBM은 사고(인지)가 행동과 정서에 영향을 미친다는 전제에서 출발합니다.',
    difficulty: 3,
    tags: { disability: '정서행동장애' },
  },
];
