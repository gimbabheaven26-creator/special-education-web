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
    source: 'KICE 기출 빈출 주제 (통합교육)',
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
    source: 'KICE 기출 빈출 주제 (협력교수)',
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
    source: 'KICE 기출 빈출 주제 (보편적 학습설계/UDL)',
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
    source: 'KICE 기출 빈출 주제 (보편적 학습설계/UDL)',
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
    source: 'KICE 기출 빈출 주제 (협력교수)',
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
    source: 'KICE 기출 빈출 주제 (또래지원)',
  },
  // ── theory 챕터 추가 문항 ──
  {
    id: 'incl-q11',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'multiple',
    question:
      'Deno(1970)가 제안한 특수교육 배치의 연속체(cascade) 모형에서 가장 제한이 적은 환경부터 가장 제한적인 환경의 순서로 올바른 것은?',
    options: [
      '일반학급 → 특수학급 → 특수학교 → 시설/병원',
      '특수학교 → 특수학급 → 일반학급 → 시설/병원',
      '시설/병원 → 특수학교 → 일반학급 → 특수학급',
      '일반학급 → 특수학교 → 특수학급 → 시설/병원',
    ],
    answer: 0,
    explanation:
      'Deno의 cascade 모형은 최소제한환경(LRE) 원칙에 따라 배치를 연속체로 제시합니다. 가장 제한이 적은 환경(일반학급)에서 가장 제한적인 환경(시설/병원) 순으로: 일반학급(지원 포함) → 일반학급+순회교육 → 특수학급(시간제/전일제) → 특수학교 → 가정/병원/시설입니다. 이 모형은 학생의 요구에 따라 적절한 배치를 결정하되, 가능한 한 최소제한환경에 배치해야 함을 강조합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (최소제한환경)',
  },
  {
    id: 'incl-q12',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'fill_in',
    question:
      '1980년대 미국에서 Will이 주도한 ( )은(는) 일반교육과 특수교육의 이원화된 체제를 비판하고, 일반교육이 장애학생에 대한 책임을 공유해야 한다고 주장한 운동이다.',
    answer: '일반교육주도(REI: Regular Education Initiative)',
    explanation:
      'REI(Regular Education Initiative)는 1986년 당시 미국 교육부 특수교육·재활서비스국 차관보였던 Madeline Will이 주도한 운동입니다. 일반교육과 특수교육의 이원화된 체제가 장애학생에게 불이익을 준다고 비판하며, 일반교육이 경도 장애학생에 대한 교육적 책임을 주도적으로 담당해야 한다고 주장했습니다. 이후 완전통합(full inclusion) 운동으로 발전하는 계기가 되었습니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'incl-q13',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'multiple',
    question:
      '통합교육의 세 가지 차원(물리적, 사회적, 교수적 통합) 중, 장애학생과 비장애학생 간의 우정 형성과 긍정적 상호작용을 강조하는 차원은?',
    options: [
      '물리적 통합(physical integration)',
      '사회적 통합(social integration)',
      '교수적 통합(instructional integration)',
      '행정적 통합(administrative integration)',
    ],
    answer: 1,
    explanation:
      '통합교육의 세 가지 차원은 (1) 물리적 통합: 장애학생이 일반학교·학급에 물리적으로 배치, (2) 사회적 통합: 장애학생이 또래와 우정을 형성하고 긍정적 상호작용에 참여, (3) 교수적 통합: 장애학생이 일반교육과정에 의미 있게 참여하고 개별화된 교수 지원을 받음입니다. 물리적 통합만으로는 진정한 통합이 아니며, 사회적·교수적 통합이 함께 이루어져야 합니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제 (통합교육)',
  },
  {
    id: 'incl-q14',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'ox',
    question:
      'REI(일반교육주도)와 완전통합(full inclusion)은 동일한 입장으로, 둘 다 모든 장애학생이 일반학급에서만 교육받아야 한다고 주장한다.',
    answer: 'X',
    explanation:
      'REI와 완전통합은 구별되는 입장입니다. REI(Will, 1986)는 주로 경도 장애학생을 대상으로 일반교육이 교육적 책임을 공유해야 한다고 주장하며, 연속적 배치 체제를 유지합니다. 반면 완전통합(Stainback & Stainback)은 장애 정도에 관계없이 모든 학생이 일반학급에서 필요한 지원을 받으며 교육받아야 한다고 주장하며, 분리 배치 자체를 반대합니다. 완전통합에 대해서는 중증 장애학생의 요구를 충분히 충족할 수 있는지에 대한 논쟁이 존재합니다.',
    difficulty: 3,
    source: 'KICE 기출 빈출 주제',
  },
  {
    id: 'incl-q15',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'fill_in',
    question:
      '통합교육의 조건 중 장애학생이 일반학교·학급에 단순히 배치되는 것을 ( ) 통합이라 하고, 교육과정과 교수활동에 의미 있게 참여하는 것을 ( ) 통합이라 한다.',
    answer: '물리적 / 교수적',
    explanation:
      '물리적 통합은 장애학생을 일반학교·학급에 배치하는 것이며, 이것만으로는 진정한 통합이 아닙니다. 교수적 통합은 장애학생이 일반교육과정에 의미 있게 참여하고, 개별화된 교수적 지원(교수적 수정, 보조공학, 협력교수 등)을 받으며 학습하는 것을 의미합니다. 물리적 통합 → 사회적 통합 → 교수적 통합이 모두 이루어져야 진정한 통합교육이라 할 수 있습니다.',
    difficulty: 1,
  },
  {
    id: 'incl-q16',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'multiple',
    question:
      '최소제한환경(LRE) 원칙에 대한 설명으로 옳지 않은 것은?',
    options: [
      '장애학생은 가능한 한 비장애 또래와 함께 교육받아야 한다',
      '보충적 보조와 서비스를 제공해도 일반학급에서의 교육이 적절하지 않을 때만 분리 배치가 가능하다',
      '모든 장애학생은 반드시 일반학급에 배치되어야 한다',
      '배치 결정은 개별 학생의 IEP에 기초해야 한다',
    ],
    answer: 2,
    explanation:
      '최소제한환경(LRE) 원칙은 "모든 장애학생이 반드시 일반학급에 배치되어야 한다"는 것이 아닙니다. LRE는 가능한 한 비장애 또래와 함께 교육받되, 보충적 보조와 서비스를 제공해도 일반학급에서의 교육이 만족스럽게 달성되지 않을 경우에만 분리 배치가 정당화된다는 원칙입니다. 배치 결정은 개별 학생의 IEP에 기초하여 개별적으로 이루어져야 합니다.',
    difficulty: 2,
  },
  // ── co-teaching 챕터 추가 문항 ──
  {
    id: 'incl-q17',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'multiple',
    question:
      'Friend & Cook이 제시한 협력교수의 6가지 모델에 해당하지 않는 것은?',
    options: [
      '교수-지원(one teach, one support), 스테이션 교수(station teaching)',
      '병행교수(parallel teaching), 대안교수(alternative teaching)',
      '팀 티칭(team teaching), 교수-관찰(one teach, one observe)',
      '개별교수(individual teaching), 분리교수(separate teaching)',
    ],
    answer: 3,
    explanation:
      'Friend & Cook의 협력교수 6가지 모델은 (1) 교수-관찰(one teach, one observe), (2) 교수-지원(one teach, one assist/support), (3) 스테이션 교수(station teaching), (4) 병행교수(parallel teaching), (5) 대안교수(alternative teaching), (6) 팀 티칭(team teaching)입니다. "개별교수"나 "분리교수"는 협력교수의 모델에 포함되지 않습니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제 (협력교수)',
  },
  {
    id: 'incl-q18',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'fill_in',
    question:
      '협력교수 모델 중 학급을 두 집단으로 나누어 두 교사가 동일한 내용을 동시에 가르치는 형태를 ( ) 교수라 하며, 이 모델은 소집단 지도와 학생의 ( )을(를) 높이는 데 효과적이다.',
    answer: '병행(parallel) / 참여도(참여 기회)',
    explanation:
      '병행교수(parallel teaching)는 학급을 두 집단으로 나누고, 두 교사가 같은 내용을 동시에 가르치는 형태입니다. 집단 크기가 절반으로 줄어들어 학생의 참여 기회가 증가하고, 교사-학생 상호작용이 활발해집니다. 두 교사가 서로 다른 교수 방법을 사용하여 동일한 목표를 달성할 수도 있습니다. 단, 두 교사 간 수업 내용과 속도의 조율이 필요합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (협력교수)',
  },
  {
    id: 'incl-q19',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'multiple',
    question:
      '다음 중 팀 티칭(team teaching) 모델에 대한 설명으로 옳은 것은?',
    options: [
      '한 교사가 소집단을 별도로 지도하고, 다른 교사는 나머지 학생을 지도한다',
      '두 교사가 동시에 전체 학생을 대상으로 함께 가르치며, 수업의 주도권을 공유한다',
      '학생들이 여러 스테이션을 순환하며 각 교사에게 학습한다',
      '한 교사가 주로 가르치고, 다른 교사는 관찰만 한다',
    ],
    answer: 1,
    explanation:
      '팀 티칭(team teaching)은 두 교사가 동시에 전체 학생을 대상으로 함께 가르치는 가장 협력적인 형태입니다. 두 교사가 수업의 주도권을 공유하며, 서로 보완하거나 번갈아가며 설명합니다. 이 모델은 두 교사 간 높은 수준의 신뢰와 의사소통이 필요하며, 가장 동등한 관계를 구현하는 협력교수 모델입니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제 (협력교수)',
  },
  {
    id: 'incl-q20',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'ox',
    question:
      '협력교수의 성공을 위해서는 일반교사와 특수교사 간 동등한 관계, 공동 계획 시간 확보, 행정적 지원이 필수적이며, 특수교사가 보조교사 역할에 머물러서는 안 된다.',
    answer: 'O',
    explanation:
      '협력교수가 성공하려면 (1) 동등한 관계: 두 교사가 대등한 위치에서 책임을 공유, (2) 공동 계획 시간: 수업 계획, 역할 분담, 평가 등을 함께 논의할 시간 확보, (3) 행정적 지원: 교무 일정 조정, 협력교수 교실 지정 등 학교 차원의 지원, (4) 전문성 개발: 협력교수 모델에 대한 공동 연수가 필요합니다. 특수교사가 단순 보조 역할에 머물면 교수-지원 모델만 반복되어 효과적인 협력교수가 이루어지지 않습니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (협력교수)',
  },
  {
    id: 'incl-q21',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'multiple',
    question:
      '협력교수 모델 중 교수-관찰(one teach, one observe)이 가장 적합한 상황은?',
    options: [
      '새 학기 초에 학생들의 학습 특성과 행동 패턴을 파악하고자 할 때',
      '장애학생에게 즉각적인 개별 지원이 필요할 때',
      '수업 내용을 소집단 활동으로 나누어 운영할 때',
      '두 교사가 동등하게 전체 수업을 진행할 때',
    ],
    answer: 0,
    explanation:
      '교수-관찰(one teach, one observe) 모델은 한 교사가 수업을 진행하는 동안 다른 교사가 특정 학생의 행동, 학습 참여도, 상호작용 패턴 등을 체계적으로 관찰하고 데이터를 수집하는 형태입니다. 새 학기 초에 학생들의 특성을 파악하거나, 특정 중재의 효과를 평가하거나, IEP 관련 데이터를 수집할 때 가장 적합합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (협력교수)',
  },
  {
    id: 'incl-q22',
    subject: 'inclusive-education',
    chapter: 'co-teaching',
    type: 'fill_in',
    question:
      '협력교수에서 대안교수(alternative teaching)를 적용할 때, 소집단에 항상 ( ) 학생만 배치되지 않도록 구성원을 ( )해야 한다.',
    answer: '같은(동일한/장애) / 순환(교체/변경)',
    explanation:
      '대안교수에서 소집단 구성 시 가장 주의해야 할 점은 특정 학생(특히 장애학생)만 항상 소집단에 배치되는 것을 피하는 것입니다. 이를 위해 소집단의 구성원을 매 수업마다 순환(rotation)하고, 선수학습 보충뿐만 아니라 심화학습, 프로젝트 활동 등 다양한 목적으로 소집단을 구성하여 낙인(stigma)을 방지해야 합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (협력교수)',
  },
  // ── udl 챕터 추가 문항 ──
  {
    id: 'incl-q23',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'multiple',
    question:
      'CAST의 UDL 프레임워크에서 3가지 원리와 뇌 네트워크의 대응으로 옳은 것은?',
    options: [
      '표상 수단 - 정의적 네트워크, 행동·표현 수단 - 인식 네트워크, 참여 수단 - 전략적 네트워크',
      '표상 수단 - 인식 네트워크, 행동·표현 수단 - 전략적 네트워크, 참여 수단 - 정의적 네트워크',
      '표상 수단 - 전략적 네트워크, 행동·표현 수단 - 정의적 네트워크, 참여 수단 - 인식 네트워크',
      '표상 수단 - 인식 네트워크, 행동·표현 수단 - 정의적 네트워크, 참여 수단 - 전략적 네트워크',
    ],
    answer: 1,
    explanation:
      'UDL의 3가지 원리는 각각 뇌의 3가지 네트워크에 대응합니다. (1) 다양한 표상 수단(무엇을 배우는가) - 인식 네트워크(recognition networks): 정보를 감지하고 의미를 부여, (2) 다양한 행동·표현 수단(어떻게 학습하는가) - 전략적 네트워크(strategic networks): 학습을 계획하고 실행, (3) 다양한 참여 수단(왜 배우는가) - 정의적 네트워크(affective networks): 동기와 흥미를 조절.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (보편적 학습설계/UDL)',
  },
  {
    id: 'incl-q24',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'fill_in',
    question:
      'UDL의 3가지 원리 중 "다양한 표상 수단 제공"의 하위 지침 3가지는 지각을 위한 옵션 제공, ( )을(를) 위한 옵션 제공, ( )을(를) 위한 옵션 제공이다.',
    answer: '언어와 상징(언어·수학적 표현·기호) / 이해(comprehension)',
    explanation:
      'UDL 원리 1(다양한 표상 수단)의 3가지 하위 지침은 (1) 지각을 위한 옵션 제공: 정보를 다양한 감각 채널(시각, 청각, 촉각)로 제시, (2) 언어와 상징을 위한 옵션 제공: 어휘, 기호, 수식 등을 명확히 하고 대안 제시, (3) 이해를 위한 옵션 제공: 배경지식 활성화, 패턴·관계 강조, 정보 처리와 전이 지원입니다. 3원리 × 3지침 = 9개 지침이 UDL 프레임워크의 핵심입니다.',
    difficulty: 3,
    source: 'KICE 기출 빈출 주제 (보편적 학습설계/UDL)',
  },
  {
    id: 'incl-q25',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'ox',
    question:
      'UDL(보편적 학습설계)은 장애학생만을 위한 특수교육 접근법이며, 교수적 수정(instructional adaptation)과 동일한 개념이다.',
    answer: 'X',
    explanation:
      'UDL과 교수적 수정은 구별되는 개념입니다. UDL은 장애학생뿐만 아니라 모든 학습자의 다양한 요구를 처음부터 교육과정 설계에 반영하는 사전적(proactive) 접근입니다. 교수적 수정은 개별 학생의 요구에 맞추어 교육과정을 사후적(reactive)으로 조정하는 접근입니다. UDL은 보편적 설계 원리에 기반하여 모든 학생의 학습 접근성을 높이는 것이 목적이며, 특수교육에만 국한되지 않습니다.',
    difficulty: 1,
    source: 'KICE 기출 빈출 주제 (보편적 학습설계/UDL)',
  },
  {
    id: 'incl-q26',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'multiple',
    question:
      'UDL의 "다양한 참여 수단 제공" 원리에 해당하는 실천 방안은?',
    options: [
      '텍스트를 음성으로 변환하여 제공한다',
      '학생이 다양한 방법(글쓰기, 말하기, 그리기)으로 과제를 수행할 수 있도록 한다',
      '학생이 학습 주제나 활동을 선택할 수 있도록 하여 자율성과 동기를 높인다',
      '핵심 개념을 그래픽 조직자로 시각화하여 제시한다',
    ],
    answer: 2,
    explanation:
      '다양한 참여 수단 제공은 정의적 네트워크(affective networks)에 대응하며, 학생의 흥미와 동기를 유지·향상시키는 데 초점을 둡니다. 학습 주제나 활동의 선택권 부여, 자기 조절 전략 지도, 협동학습, 실생활 연계 등이 포함됩니다. 음성 변환은 표상 수단, 다양한 과제 수행 방법은 행동·표현 수단, 그래픽 조직자는 표상 수단에 해당합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (보편적 학습설계/UDL)',
  },
  {
    id: 'incl-q27',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'fill_in',
    question:
      'UDL의 3가지 원리에 대응하는 뇌 네트워크를 쓰시오. 표상 수단 → ( ) 네트워크, 행동·표현 수단 → ( ) 네트워크, 참여 수단 → ( ) 네트워크',
    answer: '인식(recognition) / 전략적(strategic) / 정의적(affective)',
    explanation:
      'UDL은 뇌과학 연구에 기반하여 3가지 원리를 설정했습니다. (1) 인식 네트워크(recognition networks): 감각 정보를 처리하고 패턴을 인식 → 다양한 표상 수단 제공, (2) 전략적 네트워크(strategic networks): 행동을 계획·실행·점검 → 다양한 행동·표현 수단 제공, (3) 정의적 네트워크(affective networks): 동기, 흥미, 정서를 조절 → 다양한 참여 수단 제공.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제 (보편적 학습설계/UDL)',
  },
  {
    id: 'incl-q28',
    subject: 'inclusive-education',
    chapter: 'udl',
    type: 'multiple',
    question:
      'UDL의 9가지 지침 중 "다양한 행동 및 표현 수단 제공"의 하위 지침에 해당하는 것은?',
    options: [
      '지각을 위한 옵션, 언어·상징을 위한 옵션, 이해를 위한 옵션',
      '흥미 유발을 위한 옵션, 노력과 끈기 유지를 위한 옵션, 자기 조절을 위한 옵션',
      '신체적 행동을 위한 옵션, 표현·의사소통을 위한 옵션, 실행 기능을 위한 옵션',
      '배경지식 활성화, 패턴 강조, 정보 전이 지원',
    ],
    answer: 2,
    explanation:
      'UDL 원리 2(다양한 행동 및 표현 수단)의 3가지 하위 지침은 (1) 신체적 행동을 위한 옵션: 반응 방법, 접근 도구의 다양화, (2) 표현·의사소통을 위한 옵션: 다양한 매체와 도구를 활용한 표현, (3) 실행 기능을 위한 옵션: 목표 설정, 계획 수립, 진행 점검 지원입니다. 선택지 1은 원리 1(표상), 선택지 2는 원리 3(참여)의 하위 지침입니다.',
    difficulty: 3,
    source: 'KICE 기출 빈출 주제 (보편적 학습설계/UDL)',
  },
  {
    id: 'incl-q29',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'multiple',
    question:
      '통합교육의 효과에 대한 연구 결과로 가장 적절하지 않은 것은?',
    options: [
      '장애학생의 사회적 기술과 또래 상호작용이 향상될 수 있다',
      '비장애학생의 장애에 대한 인식과 수용 태도가 개선될 수 있다',
      '적절한 교수적 지원이 제공되면 장애학생의 학업 성취도 향상에 기여할 수 있다',
      '통합교육은 항상 모든 장애학생에게 분리교육보다 우월한 결과를 가져온다',
    ],
    answer: 3,
    explanation:
      '통합교육은 적절한 지원이 수반될 때 장애학생의 사회적 기술, 학업 성취, 자존감 향상에 기여할 수 있고, 비장애학생의 장애 인식 개선에도 효과적입니다. 그러나 "항상 모든 장애학생에게 분리교육보다 우월하다"는 주장은 연구에 의해 지지되지 않습니다. 통합교육의 효과는 지원의 질, 교사의 전문성, 학교 문화, 개별 학생의 요구 등 다양한 요인에 의해 달라집니다.',
    difficulty: 2,
  },
  {
    id: 'incl-q30',
    subject: 'inclusive-education',
    chapter: 'theory',
    type: 'fill_in',
    question:
      '통합교육의 발전 과정에서 Stainback & Stainback(1984)이 주장한 ( )은(는) 장애의 유무와 정도에 관계없이 모든 학생이 일반학급에서 교육받아야 하며, 분리 배치는 부당하다는 입장이다.',
    answer: '완전통합(full inclusion)',
    explanation:
      '완전통합(full inclusion)은 Stainback & Stainback 등이 주장한 입장으로, 모든 학생이 장애의 유무·정도와 관계없이 연령에 적합한 일반학급에서 필요한 지원과 서비스를 받으며 교육받아야 한다는 관점입니다. 분리 배치 자체를 반대하며, 모든 지원이 일반학급 내에서 제공되어야 한다고 주장합니다. 이에 대해 Kauffman 등은 배치의 연속체(continuum of placements)가 필요하다고 반론합니다.',
    difficulty: 2,
    source: 'KICE 기출 빈출 주제',
  },
];
