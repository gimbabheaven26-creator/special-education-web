import type { QuizQuestion } from '@/types/quiz';

export const inclusiveEducationQuizzes: QuizQuestion[] = [
  {
    id: 'inc-q1',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'multiple',
    question:
      '통합교육의 법적 근거가 되는 「장애인 등에 대한 특수교육법」에서 규정하는 통합교육의 정의로 옳은 것은?',
    options: [
      '장애학생이 일반학교에 물리적으로 배치되는 것',
      '특수교육대상자가 일반학교에서 장애유형·장애정도에 따라 차별 없이 또래와 함께 개개인의 교육적 요구에 적합한 교육을 받는 것',
      '장애학생이 특수학급 없이 일반학급에서만 교육받는 것',
      '장애학생과 비장애 학생이 같은 학교에 재학하는 것',
    ],
    answer: 1,
    explanation:
      '「장애인 등에 대한 특수교육법」 제2조 제6호에 따르면, 통합교육이란 특수교육대상자가 일반학교에서 장애유형·장애정도에 따라 차별을 받지 않고 또래와 함께 개개인의 교육적 요구에 적합한 교육을 받는 것을 의미합니다. 단순한 물리적 통합을 넘어 교육적 통합을 강조합니다.',
    difficulty: 1,
  },
  {
    id: 'inc-q2',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'ox',
    question:
      '완전통합(full inclusion)은 모든 장애 학생이 어떠한 지원 없이도 일반학급에서만 교육받아야 한다는 관점이다.',
    answer: 'X',
    explanation:
      '완전통합(full inclusion)은 모든 장애 학생이 필요한 지원을 받으면서 일반학급에서 교육받아야 한다는 관점입니다. 지원 없이 배치하는 것이 아니라, 필요한 지원·서비스를 일반학급 환경 내에서 제공하는 것을 지향합니다. 이는 최소제한환경(LRE) 개념과 연계됩니다.',
    difficulty: 2,
  },
  {
    id: 'inc-q3',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'multiple',
    question:
      '협력교수(co-teaching) 모델 중 한 명의 교사가 전체 학생을 가르치는 동안 다른 교사가 개별 학생을 관찰하거나 데이터를 수집하는 형태는?',
    options: [
      '팀 티칭(team teaching)',
      '스테이션 교수(station teaching)',
      '교수-지원(one teach, one support)',
      '대안교수(alternative teaching)',
    ],
    answer: 2,
    explanation:
      '교수-지원(one teach, one support) 모델은 한 명의 교사가 주된 수업을 담당하고 다른 교사가 학생들을 순회하며 지원하거나, 특정 학생의 행동 및 학습 데이터를 수집하는 형태입니다. 가장 흔하게 활용되는 협력교수 모델이지만, 지원 교사의 역할이 보조로 국한되지 않도록 주의해야 합니다.',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
  {
    id: 'inc-q4',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'fill_in',
    question:
      '협력교수 유형 중 학습 내용을 여러 장소(스테이션)로 나누고 학생들이 돌아가며 각 스테이션에서 학습하는 형태를 ( ) 교수라 하며, 이 형태는 교사 간 ( ) 관계를 강화하는 데 효과적이다.',
    answer: '스테이션 / 협력(동등한)',
    explanation:
      '스테이션 교수(station teaching)는 학습 내용을 2~3개의 스테이션으로 분리하고, 각 스테이션에 교사 또는 학생 주도 활동을 배치하여 학생들이 순환하며 학습하는 형태입니다. 두 교사가 각각 스테이션을 담당하여 동등한 역할을 수행합니다.',
    difficulty: 2,
  },
  {
    id: 'inc-q5',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'multiple',
    question:
      '보편적 학습설계(UDL: Universal Design for Learning)의 3가지 원리에 해당하지 않는 것은?',
    options: [
      '다양한 표상 수단 제공(multiple means of representation)',
      '다양한 행동 및 표현 수단 제공(multiple means of action and expression)',
      '다양한 참여 수단 제공(multiple means of engagement)',
      '다양한 평가 도구 제공(multiple means of assessment)',
    ],
    answer: 3,
    explanation:
      'CAST(Center for Applied Special Technology)가 제안한 UDL의 3가지 원리는 (1) 다양한 표상 수단 제공(무엇을 배우는가), (2) 다양한 행동 및 표현 수단 제공(어떻게 학습하는가), (3) 다양한 참여 수단 제공(왜 배우는가)입니다. "다양한 평가 도구 제공"은 UDL의 공식 원리에 포함되지 않습니다.',
    difficulty: 2,
  },
  {
    id: 'inc-q6',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'ox',
    question:
      'UDL(보편적 학습설계)은 사후에 개별 학생의 요구에 맞게 교육과정을 수정하는 것이 아니라, 처음부터 모든 학습자의 다양한 요구를 고려하여 교육과정을 설계하는 접근이다.',
    answer: 'O',
    explanation:
      'UDL은 사후 조정(retrofitting) 방식과 달리, 처음 설계 단계에서부터 다양한 학습자의 요구를 반영하여 유연한 교육과정을 만드는 사전 예방적(proactive) 접근입니다. 건축의 "보편적 설계(Universal Design)" 개념을 교육에 적용한 것으로, 장애학생뿐만 아니라 모든 학생에게 이익이 됩니다.',
    difficulty: 1,
  },
  {
    id: 'inc-q7',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'multiple',
    question:
      '협력교수 모델 중 대안교수(alternative teaching)의 특징으로 옳은 것은?',
    options: [
      '두 교사가 동등하게 전체 학생을 함께 가르친다',
      '한 교사가 소집단을 별도로 지도하고, 다른 교사는 나머지 학생을 지도한다',
      '학생들이 여러 스테이션을 순환하며 학습한다',
      '교과 내용을 두 교사가 반씩 나누어 담당한다',
    ],
    answer: 1,
    explanation:
      '대안교수(alternative teaching)는 한 교사가 전체 학생의 대부분을 지도하는 동안 다른 교사가 특정 학생들(선수학습 보충, 심화학습, 또는 특수교육대상자 등)로 구성된 소집단을 별도로 지도하는 형태입니다. 소집단에 항상 같은 학생이 배치되지 않도록 주의해야 합니다.',
    difficulty: 2,
  },
  {
    id: 'inc-q8',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'fill_in',
    question:
      '통합교육에서 장애학생이 일반학급에 배치될 수 있는 조건 중 하나인 ( )은(는) 지역사회 내에서 장애인이 비장애인과 함께 생활하는 것이 정상적인 상태임을 전제로 하는 원리로, 특수교육 역사에서 통합교육 발전의 이념적 토대가 되었다.',
    answer: '정상화(normalization)',
    explanation:
      '정상화(normalization) 원리는 Nirje와 Wolfensberger에 의해 발전되었으며, 장애인도 비장애인과 동일하거나 최대한 유사한 생활 양식과 조건을 누려야 한다는 철학입니다. 이 원리는 탈시설화, 지역사회 통합, 통합교육 운동의 이론적 기반이 되었습니다.',
    difficulty: 2,
  },
  {
    id: 'inc-q9',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'descriptive',
    caseContext: `다음은 중학교 1학년 통합학급 국어 수업 장면이다.

[학급 구성]
- 전체 학생 28명, 이 중 특수교육대상자 2명(지적장애, 청각장애)
- 단원: 설명문 읽고 요약하기

[현재 수업 방식]
- 교사가 교과서 본문을 읽어 주며 설명
- 판서 위주의 핵심어 정리
- 과제: 설명문을 읽고 중심 문장을 찾아 노트에 필기

[문제 상황]
- 지적장애 학생: 읽기 이해도 낮음, 추상적 내용 이해 어려움
- 청각장애 학생: 교사의 구두 설명 접근 제한, 보청기 착용 중`,
    question:
      '위 수업 상황에 UDL의 3가지 원리(다양한 표상 수단, 다양한 행동 및 표현 수단, 다양한 참여 수단)를 각각 적용한 구체적인 지원 방안을 각 1가지씩 제시하시오.',
    answer: `(1) 다양한 표상 수단 제공
설명문의 핵심 구조를 시각적 조직자(graphic organizer, 예: 마인드맵, 개념도)로 제시하고, 어려운 어휘에는 그림·사진 설명을 첨부한다. 청각장애 학생을 위해 자막이 있는 동영상이나 시각적 텍스트를 추가 제공하고, 지적장애 학생을 위해 내용을 단순화한 보조 읽기 자료를 준비한다.

(2) 다양한 행동 및 표현 수단 제공
중심 문장 찾기 과제를 학생의 능력 수준에 따라 선택할 수 있도록 한다. 지적장애 학생은 제시된 문장 중 고르는 선택형 과제, 청각장애 학생은 필기 외 그림이나 도식으로도 제출할 수 있도록 허용한다. 디지털 도구(타이핑, 음성 녹음)를 통한 표현도 허용한다.

(3) 다양한 참여 수단 제공
학생들이 스스로 읽기 속도나 방식을 선택할 수 있도록 자기 조절 기회를 제공하고, 짝 활동이나 소집단 협동학습을 통해 또래 지원이 이루어지도록 구성한다. 과제에 학생이 관심 있는 주제를 선택적으로 연계하거나 실생활 예시를 활용하여 동기를 높인다.`,
    explanation:
      'UDL의 목표는 모든 학습자가 학습 장벽 없이 접근할 수 있는 유연한 학습환경을 설계하는 것입니다. 특정 학생을 위한 개별 수정이 아니라, 처음부터 다양한 수단을 제공하여 모든 학생의 학습 참여를 극대화합니다.',
    difficulty: 3,
    tags: { disability: '지적장애' },
  },
  {
    id: 'inc-q10',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'fill_in',
    question:
      '통합교육에서 또래지원 전략 중, 장애학생과 비장애 학생이 짝을 이루어 서로 번갈아 가며 교사와 학생 역할을 수행하는 전략을 ( )이라 한다.',
    answer: '또래교수(peer tutoring)',
    explanation:
      '또래교수(peer tutoring)는 또래 간 상호 교수 활동으로, 장애학생이 학습자 역할뿐 아니라 교수자 역할도 경험하게 합니다. 짝 또래교수(peer-assisted learning strategies, PALS), 학급 전체 또래교수(classwide peer tutoring, CWPT) 등 다양한 형태가 있습니다. 사회적 통합과 학업 성취 모두에 효과적입니다.',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
];
