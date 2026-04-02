-- scenario_composite 샘플 데이터 3문제
-- REQ-007/008 스키마 검증용 — 카이란이 Supabase SQL Editor에서 실행
-- 2026-04-02

-- ────────────────────────────────────────────────────
-- 1. 교육과정 (curriculum) — IEP 목표 수립 + 교육과정 수정
-- ────────────────────────────────────────────────────
INSERT INTO quiz_questions (
  id, subject, chapter, type, question, case_context,
  answer, explanation, difficulty, source, tags,
  sub_questions, subjects
) VALUES (
  'sc-cur-q1',
  'curriculum',
  'iep',
  'scenario_composite',
  '다음 사례를 읽고 물음에 답하시오.',
  '초등학교 3학년 통합학급에 재학 중인 지적장애 학생 민호의 현행 수준은 다음과 같다.
• 국어: 받침 없는 2음절 단어를 80% 정확도로 읽을 수 있으나, 받침 있는 단어는 30% 수준
• 수학: 10 이내의 덧셈은 구체물을 사용하면 가능하나, 20 이내 연산은 미도달
• 사회성: 또래에게 먼저 인사할 수 있으나, 놀이 참여 시 차례 지키기가 어려움
담임교사 김 교사는 이 학생의 IEP를 수립하고, 3학년 국어 교육과정을 수정하여 지도하고자 한다.',
  '하위 질문 참조',
  '이 문제는 IEP 목표 수립의 SMART 원칙과 교육과정 수정의 4단계(동일-수정-대안-중복)를 통합적으로 평가한다. 실제 KICE 전공A에서 IEP+교육과정 수정은 매년 출제되는 핵심 융합 주제이다.',
  3,
  'KICE 실전형 샘플',
  '{"disability": "지적장애", "year": 2026}'::jsonb,
  '[
    {
      "id": "sc-cur-q1-1",
      "question": "민호의 국어 영역에 대한 IEP 장기 목표 1가지와 단기 목표 2가지를 SMART 원칙에 따라 작성하시오.",
      "type": "descriptive",
      "answer": "장기 목표: 민호는 1학기 말까지 받침 있는 2음절 단어 20개를 80% 정확도로 읽을 수 있다.\n단기 목표 1: 4주 이내에 ㄴ, ㄹ 받침이 있는 2음절 단어 10개를 3회 연속 70% 이상 정확도로 읽을 수 있다.\n단기 목표 2: 8주 이내에 ㄱ, ㅂ, ㅁ 받침이 있는 2음절 단어 10개를 3회 연속 70% 이상 정확도로 읽을 수 있다.",
      "explanation": "SMART 원칙: Specific(구체적), Measurable(측정 가능), Achievable(달성 가능), Relevant(관련성), Time-bound(시간 제한). 현행 수준(받침 없는 단어 80%)에서 한 단계 상위 목표를 설정한다."
    },
    {
      "id": "sc-cur-q1-2",
      "question": "김 교사가 3학년 국어 교육과정을 민호에게 적용하기 위해 사용할 수 있는 교육과정 수정 유형 2가지를 쓰고, 각각의 구체적 적용 예를 제시하시오.",
      "type": "descriptive",
      "answer": "(1) 수정(adaptation): 3학년 읽기 지문의 어휘 수준을 낮추고, 받침 있는 핵심 단어에 밑줄과 그림 단서를 추가하여 동일한 학습 활동에 참여하게 한다.\n(2) 대안(alternative): 3학년 글쓰기 활동 대신, 민호는 단어 카드를 조합하여 문장을 만드는 대체 과제를 수행한다.",
      "explanation": "교육과정 수정의 4단계: 동일(same) → 수정(adaptation) → 대안(alternative) → 중복(overlapping). 가능한 한 일반교육과정에 가까운 수준의 수정을 우선 적용한다."
    },
    {
      "id": "sc-cur-q1-3",
      "question": "민호의 사회성 목표(차례 지키기)를 국어 수업 활동에 중복교육과정(overlapping curriculum)으로 포함시키는 방법을 1가지 제시하시오.",
      "type": "fill_in",
      "answer": "모둠 읽기 활동에서 민호에게 순서 카드를 배부하고, 카드에 적힌 순서에 따라 한 문장씩 번갈아 읽는 활동을 통해 차례 지키기를 연습한다."
    }
  ]'::jsonb,
  ARRAY['curriculum', 'inclusive-education']
) ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  case_context = EXCLUDED.case_context,
  answer = EXCLUDED.answer,
  explanation = EXCLUDED.explanation,
  sub_questions = EXCLUDED.sub_questions,
  subjects = EXCLUDED.subjects;

-- ────────────────────────────────────────────────────
-- 2. 통합교육 (inclusive-education) — 협력교수 + 보편적 학습설계
-- ────────────────────────────────────────────────────
INSERT INTO quiz_questions (
  id, subject, chapter, type, question, case_context,
  answer, explanation, difficulty, source, tags,
  sub_questions, subjects
) VALUES (
  'sc-inc-q1',
  'inclusive-education',
  'co-teaching',
  'scenario_composite',
  '다음 사례를 읽고 물음에 답하시오.',
  '중학교 2학년 과학 수업에 ADHD 학생 1명과 자폐성장애 학생 1명이 통합되어 있다. 일반교사 박 교사와 특수교사 이 교사는 협력교수를 통해 "물질의 상태 변화" 단원을 지도하려 한다. 현재까지 두 교사는 일교대 교수(one teach, one observe) 방식만 사용해 왔으나, 학생들의 참여도가 낮아 다른 협력교수 유형을 시도하고자 한다.',
  '하위 질문 참조',
  '이 문제는 Cook & Friend의 6가지 협력교수 유형과 UDL 3원칙을 통합적으로 평가한다. KICE에서 협력교수 유형 비교 + 실제 적용 사례 서술은 빈출 패턴이다.',
  3,
  'KICE 실전형 샘플',
  '{"disability": "ADHD/자폐성장애", "year": 2026}'::jsonb,
  '[
    {
      "id": "sc-inc-q1-1",
      "question": "Cook과 Friend(1995)의 협력교수 유형 중, 이 수업 상황에 적합한 유형 2가지를 쓰고 각각의 운영 방법을 설명하시오.",
      "type": "descriptive",
      "answer": "(1) 스테이션 교수(station teaching): 교실을 3개 스테이션으로 나누어, 스테이션 1에서 박 교사가 상태 변화 개념 직접교수, 스테이션 2에서 이 교사가 소그룹 실험 활동 지원, 스테이션 3에서 학생들이 자기주도 학습지를 작성한다. 학생들은 로테이션하며 모든 스테이션을 경험한다.\n(2) 대안적 교수(alternative teaching): 이 교사가 ADHD·자폐성장애 학생을 포함한 소그룹(3~4명)을 별도로 구성하여, 시각 자료와 구체물을 활용한 사전 교수를 진행한 후 대그룹에 합류시킨다.",
      "explanation": "6가지 유형: 일교대/일보조(one teach-one assist), 일교대/일관찰(one teach-one observe), 스테이션 교수, 평행 교수, 대안적 교수, 팀 교수. 스테이션 교수는 소그룹 활동으로 참여도를 높이고, 대안적 교수는 사전 교수로 접근성을 확보한다."
    },
    {
      "id": "sc-inc-q1-2",
      "question": "보편적 학습설계(UDL)의 3가지 원칙을 쓰고, 이 수업에서 각 원칙을 적용하는 구체적 방법을 1가지씩 제시하시오.",
      "type": "descriptive",
      "answer": "(1) 다양한 표상 수단(representation): 물질의 상태 변화를 텍스트뿐 아니라 동영상, 분자 모형, 실물 시연(얼음→물→수증기)으로 제시한다.\n(2) 다양한 행동·표현 수단(action & expression): 학습 결과를 글쓰기 외에도 그림 그리기, 구두 발표, 분자 모형 조작 등 다양한 방법으로 표현할 수 있게 한다.\n(3) 다양한 참여 수단(engagement): ADHD 학생을 위해 실험 활동 시간을 10분 단위로 분절하고 체크리스트를 제공하며, 자폐성장애 학생에게는 활동 순서 시각 일정표를 제공한다.",
      "explanation": "UDL은 CAST(2018)가 제안한 프레임워크로, 장애 학생만을 위한 것이 아니라 모든 학습자의 접근성을 높이는 보편적 설계 원칙이다."
    }
  ]'::jsonb,
  ARRAY['inclusive-education', 'curriculum']
) ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  case_context = EXCLUDED.case_context,
  answer = EXCLUDED.answer,
  explanation = EXCLUDED.explanation,
  sub_questions = EXCLUDED.sub_questions,
  subjects = EXCLUDED.subjects;

-- ────────────────────────────────────────────────────
-- 3. 특수교육학 개론 (introduction) — 장애 유형 감별 + 교육적 지원
-- ────────────────────────────────────────────────────
INSERT INTO quiz_questions (
  id, subject, chapter, type, question, case_context,
  answer, explanation, difficulty, source, tags,
  sub_questions, subjects
) VALUES (
  'sc-intro-q1',
  'introduction',
  'disability-types',
  'scenario_composite',
  '다음 사례를 읽고 물음에 답하시오.',
  '초등학교 1학년 수현이는 다음과 같은 특성을 보인다.
• 또래와 눈 맞춤이 거의 없고, 이름을 불러도 반응하지 않는 경우가 많다
• 자동차 바퀴를 반복적으로 돌리며 30분 이상 같은 행동을 지속한다
• 새로운 일과 변경 시 심한 울음과 자해 행동(머리 때리기)을 보인다
• 언어 표현은 2어문 조합 수준이며, 반향어(echolalia)가 빈번하다
• 감각적으로 특정 소리(화장실 핸드드라이어)에 극도로 민감하게 반응한다

수현이의 어머니는 담임교사에게 "우리 아이가 지적장애인지, 자폐성장애인지 모르겠다"고 상담을 요청하였다.',
  '하위 질문 참조',
  '이 문제는 자폐성장애의 DSM-5 진단기준과 지적장애와의 감별, 감각처리 특성, 교육적 지원을 통합적으로 평가한다. KICE에서 사례 기반 장애 특성 분석은 가장 빈출되는 문항 유형이다.',
  3,
  'KICE 실전형 샘플',
  '{"disability": "자폐성장애", "year": 2026}'::jsonb,
  '[
    {
      "id": "sc-intro-q1-1",
      "question": "DSM-5의 자폐스펙트럼장애 진단기준에서 제시하는 2가지 핵심 영역을 쓰고, 사례에서 각 영역에 해당하는 행동 특성을 2가지씩 찾아 쓰시오.",
      "type": "descriptive",
      "answer": "핵심 영역 A — 사회적 의사소통 및 사회적 상호작용의 지속적 결함: (1) 또래와 눈 맞춤이 거의 없음 (2) 이름을 불러도 반응하지 않음(사회적 상호성 결함)\n핵심 영역 B — 제한적이고 반복적인 행동, 관심, 활동: (1) 자동차 바퀴를 반복적으로 돌리는 상동 행동 (2) 일과 변경 시 심한 저항(동일성에 대한 고집)",
      "explanation": "DSM-5(2013)에서 자폐스펙트럼장애는 이전의 자폐성장애, 아스퍼거증후군, PDD-NOS를 통합한 단일 진단명이다. 영역 A의 3가지 하위 기준(사회적-정서적 상호성, 비언어적 의사소통, 관계 발전·유지)과 영역 B의 4가지 하위 기준(상동 행동, 동일성 고집, 제한된 관심, 감각 반응) 중 각각 일정 수 이상 충족해야 한다."
    },
    {
      "id": "sc-intro-q1-2",
      "question": "자폐성장애와 지적장애가 공존할 수 있는 이유를 1가지 쓰고, 두 장애를 감별할 때 핵심적으로 구분되는 특성 1가지를 설명하시오.",
      "type": "fill_in",
      "answer": "공존 이유: 자폐성장애 아동의 약 31~55%가 지적장애를 동반하므로 두 장애는 공존(comorbidity)할 수 있다. 감별 핵심: 지적장애는 전반적 인지 기능의 제한이 주요 특성인 반면, 자폐성장애는 사회적 의사소통의 질적 결함과 제한적·반복적 행동이 핵심이다. 지적장애만 있는 경우 사회적 관심과 상호작용 시도가 인지 수준에 비례하여 나타나지만, 자폐성장애는 인지 수준과 무관하게 사회적 상호작용의 질적 어려움을 보인다."
    },
    {
      "id": "sc-intro-q1-3",
      "question": "수현이의 감각 과민 반응(핸드드라이어 소리)에 대한 교육적 지원 방법을 2가지 제시하시오.",
      "type": "descriptive",
      "answer": "(1) 환경 수정: 학교 화장실에서 핸드드라이어 대신 종이 타월을 비치하거나, 수현이가 사용하는 화장실의 핸드드라이어를 일시 정지시켜 감각 자극을 사전에 제거한다.\n(2) 감각 조절 도구 제공: 소음 차단 귀마개(이어머프)를 휴대하게 하여, 예기치 않은 소리 자극에 대해 자기조절 전략을 사용할 수 있도록 지원한다.",
      "explanation": "감각처리 특성은 DSM-5 진단기준 B-4(감각 자극에 대한 과잉 또는 과소 반응)에 해당한다. Dunn(2014)의 감각처리 모델에 따르면, 감각 과민 반응(sensory over-responsivity)은 낮은 신경학적 역치와 능동적 자기조절 전략의 조합으로 설명된다."
    }
  ]'::jsonb,
  ARRAY['introduction', 'assessment']
) ON CONFLICT (id) DO UPDATE SET
  question = EXCLUDED.question,
  case_context = EXCLUDED.case_context,
  answer = EXCLUDED.answer,
  explanation = EXCLUDED.explanation,
  sub_questions = EXCLUDED.sub_questions,
  subjects = EXCLUDED.subjects;
