import type { QuizQuestion } from '@/types/quiz';

export const assessmentQuizzes: QuizQuestion[] = [
  {
    id: 'asmnt-q1',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'multiple',
    question:
      '특수교육대상자 선정·배치를 위한 진단·평가 절차를 올바르게 나열한 것은?',
    options: [
      '보호자 신청(또는 학교장 의뢰) → 진단·평가 실시 → 특수교육지원센터 심사 → 교육장(교육감) 배치 결정',
      '특수교육지원센터 심사 → 보호자 신청 → 진단·평가 → 교육청 배치',
      '담임교사 의뢰 → 학교장 승인 → 의뢰·신청 없이 배치',
      '진단·평가 → 보호자 신청 → 특수교육지원센터 심사 → 배치',
    ],
    answer: 0,
    explanation:
      '「장애인 등에 대한 특수교육법」 제14~15조에 따라, ① 보호자 또는 각급학교 장이 특수교육지원센터에 진단·평가를 의뢰/신청 → ② 특수교육지원센터에서 진단·평가 실시 → ③ 결과를 교육장(교육감)에게 보고 → ④ 교육장(교육감)이 특수교육운영위원회 심사를 거쳐 특수교육대상자 선정 및 배치 결정합니다.',
    difficulty: 2,
  },
  {
    id: 'asmnt-q2',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'ox',
    question:
      '규준참조검사(norm-referenced test)는 개인의 수행을 또래 집단의 평균 수행과 비교하여 상대적 위치를 파악하는 데 사용된다.',
    answer: 'O',
    explanation:
      '규준참조검사는 표준화된 비교 집단(규준)과 개인의 수행을 비교하여 백분위, 표준점수, 등가연령 등으로 상대적 위치를 나타냅니다. K-WISC, K-ABC, 기초학력검사(BASA) 등이 해당됩니다. 반면 준거참조검사(criterion-referenced test)는 미리 정해진 기준 대비 수행 여부를 평가합니다.',
    difficulty: 1,
  },
  {
    id: 'asmnt-q3',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'multiple',
    question:
      '교육과정중심측정(CBM: Curriculum-Based Measurement)의 특징으로 옳지 않은 것은?',
    options: [
      '학생의 진전도(progress)를 반복 측정하여 모니터링한다',
      '교육과정에서 직접 추출한 과제(탐침)를 사용한다',
      '학생의 결함 원인을 진단하여 장애를 분류하는 데 주목적이 있다',
      '반응중재(RTI) 모델에서 학생 반응 여부를 모니터링하는 데 활용된다',
    ],
    answer: 2,
    explanation:
      'CBM의 주목적은 장애 분류나 결함 원인 진단이 아니라 학생의 학업 진전도를 지속적으로 모니터링하여 교수의 효과를 점검하고 수정하는 데 있습니다. CBM은 짧고 신뢰할 수 있는 탐침(probe)을 사용하여 주·월 단위로 반복 측정합니다.',
    difficulty: 2,
    tags: { disability: '학습장애' },
  },
  {
    id: 'asmnt-q4',
    subject: 'assessment',
    chapter: 'fba',
    type: 'fill_in',
    question:
      '기능적 행동평가(FBA)에서 행동의 기능(목적)은 크게 환경 자극 ( )과 환경 자극 ( )로 구분하며, 이 두 범주는 다시 사회적 관심 획득, 물건/활동 획득, 감각 자극 획득 등으로 세분된다.',
    answer: '획득(정적 강화) / 회피·도피(부적 강화)',
    explanation:
      '행동의 기능은 크게 (1) 환경 자극 획득(정적 강화 기반): 관심, 물건, 활동, 감각 자극 획득 / (2) 환경 자극 회피·도피(부적 강화 기반): 과제, 사람, 감각 자극 회피로 분류됩니다. FBA 결과를 바탕으로 행동의 기능에 맞는 기능적 의사소통 훈련(FCT)이나 선행사건 수정이 계획됩니다.',
    difficulty: 2,
    tags: { disability: '자폐성장애' },
  },
  {
    id: 'asmnt-q5',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'multiple',
    question:
      '지적장애 진단을 위해 적응행동을 측정하는 대표적인 표준화 검사로, 개념적·사회적·실제적 영역을 평가하는 국내 검사는?',
    options: [
      'K-WISC-V',
      'K-ABC-II',
      'K-Vineland-3(바인랜드 적응행동척도)',
      'BASA(기초학습기능 수행평가체제)',
    ],
    answer: 2,
    explanation:
      'K-Vineland-3(한국판 바인랜드 적응행동척도)은 의사소통, 일상생활기술, 사회화, 운동기술 영역을 통해 개념적·사회적·실제적 적응행동을 측정하는 표준화 검사입니다. K-WISC-V는 지능검사, K-ABC-II는 인지능력 및 습득도 검사, BASA는 학업 기초 기능 평가에 사용됩니다. ⚠️ 용어 검증 필요: 검사 버전 및 국내 표준화 현황은 최신 자료를 확인하세요.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'asmnt-q6',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'ox',
    question:
      '반응중재(RTI: Response to Intervention) 모델에서 CBM(교육과정중심측정)은 2차 이상의 집중 중재에만 사용되고 1차(보편적) 수준에서는 사용되지 않는다.',
    answer: 'X',
    explanation:
      'RTI 모델에서 CBM은 1차(보편적 선별 검사), 2차(소집단 집중 중재 진전도 모니터링), 3차(개별 집중 중재 진전도 모니터링) 모든 단계에서 활용됩니다. 특히 1차 단계의 보편적 선별(universal screening)에서 위험군 학생을 조기 발견하는 데 CBM이 효과적으로 사용됩니다.',
    difficulty: 2,
    tags: { disability: '학습장애' },
  },
  {
    id: 'asmnt-q7',
    subject: 'assessment',
    chapter: 'fba',
    type: 'multiple',
    question:
      'FBA(기능적 행동평가)의 방법으로 간접적 방법에 해당하는 것을 모두 고른 것은?',
    options: [
      '직접관찰, ABC 기록',
      '면접, 평정척도, 설문지',
      '기능분석(실험분석), ABC 기록',
      '구조화된 관찰, 직접관찰',
    ],
    answer: 1,
    explanation:
      'FBA 방법은 (1) 간접적 방법: 교사·보호자 면접, 행동 평정척도, 설문지 등 / (2) 직접적 방법(자연적 관찰): ABC 기록, 산포도(scatter plot) 등 / (3) 실험적 방법(기능분석): 행동의 기능을 확인하기 위해 환경 조건을 체계적으로 조작하는 방법으로 구분됩니다. 간접적 방법은 실제 관찰 없이 보고에 의존하는 방법입니다.',
    difficulty: 3,
    tags: { disability: '자폐성장애' },
  },
  {
    id: 'asmnt-q8',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'fill_in',
    question:
      '표준화검사에서 원점수를 평균 100, 표준편차 15로 변환한 점수를 ( )라 하며, 지적장애 진단 기준으로 흔히 ( ) 이하의 점수를 기준으로 사용한다.',
    answer: '지능지수(IQ) / 70',
    explanation:
      '지능검사에서 평균 100, 표준편차 15의 표준점수를 지능지수(IQ)라 합니다. 지적장애 진단에서 지능 기준은 일반적으로 IQ 70(또는 75) 이하를 사용하나, 단독 기준이 아니라 적응행동 결함과 18세 이전 발현을 함께 충족해야 합니다. ⚠️ 용어 검증 필요: DSM-5와 AAIDD 기준, 국내 특수교육법 기준 간 차이가 있습니다.',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
  {
    id: 'asmnt-q9',
    subject: 'assessment',
    chapter: 'fba',
    type: 'descriptive',
    caseContext: `다음은 초등학교 2학년 특수학급 학생 지수(8세, 자폐성장애)에 관한 관찰 기록이다.

[관찰 기간] 2주간 국어 수업 장면
[행동] 지수는 자리에서 일어나 교실을 돌아다니는 행동을 보임 (1일 평균 8회)

[ABC 기록 예시]
- 월요일: A(교사가 쓰기 과제 제시) → B(자리 이탈) → C(교사가 지수를 불러 앉힘, 과제 잠시 중단)
- 화요일: A(교사가 그림 설명 지시) → B(자리 이탈) → C(교사가 쫓아가 손을 잡고 다시 앉힘)
- 수요일: A(독립 읽기 과제 제시) → B(자리 이탈) → C(교사가 지수에게 와서 함께 읽어줌)

[추가 정보]
- 자유시간, 좋아하는 활동(그림 그리기)에서는 자리 이탈 행동 거의 없음`,
    question:
      '(1) FBA의 간접·직접 방법을 각각 1가지씩 추가로 실시하여 수집해야 할 정보를 제시하시오. (2) ABC 기록 분석을 통해 지수의 자리 이탈 행동의 기능(가설)을 설명하시오. (3) 행동의 기능에 근거한 중재 방안 2가지를 제시하시오.',
    answer: `(1) 추가 FBA 방법
- 간접적 방법: 담임 교사 및 보호자 면접(인터뷰)을 통해 집에서의 자리 이탈 패턴, 과거 행동 이력, 선호/비선호 활동 목록 등 정보를 수집한다.
- 직접적 방법: 산포도(scatter plot) 기록을 통해 자리 이탈 행동이 특정 시간대, 과목, 교수 활동과 어떻게 연관되는지 시각적으로 분석한다.

(2) 행동의 기능 가설
ABC 기록을 분석하면, 선행자극이 공통적으로 "과제 제시"이고 후속 결과로 "교사의 관심(교사가 옴, 함께 활동해 줌)"과 "과제 일시 중단"이 나타납니다.
따라서 지수의 자리 이탈 행동은 다음 두 가지 기능을 가진다고 가설화할 수 있습니다.
- 교사 관심 획득(정적 강화): 자리 이탈 후 교사가 직접 찾아와 상호작용하는 결과 획득
- 과제 회피(부적 강화): 어렵거나 비선호 과제가 일시적으로 중단되는 결과 획득

(3) 기능 기반 중재 방안
① 기능적 의사소통 훈련(FCT): 지수가 "도와주세요" 또는 "쉬어도 돼요?"를 그림카드(AAC)나 제스처로 표현하도록 교수하여, 자리 이탈 없이도 도움·휴식을 요청할 수 있는 대체 기술을 가르친다.
② 선행사건 수정: 과제의 난이도를 지수의 수준에 맞게 조정하고(교수적 수정), 과제 시작 전 예고와 선택 기회를 제공하여 과제에 대한 혐오도를 낮춘다. 또한 적절한 수행에 교사 관심(칭찬)을 제공하여 과제 수행 중 관심 획득이 가능하도록 한다.`,
    explanation:
      'FBA는 문제행동의 기능을 파악하여 기능에 맞는 중재(function-based intervention)를 설계하는 것이 핵심입니다. 동일한 행동이라도 기능에 따라 중재 방법이 달라지며, 기능을 무시한 중재는 효과가 제한적입니다.',
    difficulty: 3,
    tags: { disability: '자폐성장애' },
  },
  {
    id: 'asmnt-q10',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'multiple',
    question:
      'CBM을 활용한 진전도 모니터링에서 학생의 진전도 선(trend line)이 목표선(goal line)보다 현저히 낮을 때 교사가 취해야 할 조치로 가장 적절한 것은?',
    options: [
      '목표를 낮추고 현재 중재를 계속 유지한다',
      '현재 중재 방법을 점검하고 수정하거나 보다 집중적인 지원으로 강화한다',
      '평가를 중단하고 학기 말에 재평가한다',
      '학생의 장애 정도 문제로 판단하여 별도 목표를 설정하지 않는다',
    ],
    answer: 1,
    explanation:
      'CBM 진전도 모니터링에서 학생의 데이터 선이 목표선 아래에 있으면, 현재 중재의 효과가 불충분하다는 신호입니다. 이때 교사는 중재 방법을 검토하고 수정하거나, 보다 집중적인 지원(예: RTI 2차 또는 3차 수준으로 강화)을 제공해야 합니다. CBM의 핵심 가치는 데이터에 기반한 교수 의사결정입니다.',
    difficulty: 2,
    tags: { disability: '학습장애' },
  },
  // ── Chapter: standardized-tests (q11–q17) ──
  {
    id: 'assess-q11',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'multiple',
    question:
      'K-WISC-V(한국 웩슬러 아동지능검사 5판)의 5가지 기본 지표에 해당하지 않는 것은?',
    options: [
      '언어이해(VCI)',
      '시공간(VSI)',
      '장기기억(LMI)',
      '처리속도(PSI)',
    ],
    answer: 2,
    explanation:
      'K-WISC-V의 5가지 기본 지표는 언어이해(VCI), 시공간(VSI), 유동추론(FRI), 작업기억(WMI), 처리속도(PSI)입니다. "장기기억(LMI)"은 K-WISC-V의 기본 지표에 포함되지 않습니다. K-WISC-IV에서 V로 개정되면서 지각추론(PRI)이 시공간(VSI)과 유동추론(FRI)으로 분화된 것이 주요 변화입니다.',
    difficulty: 1,
  },
  {
    id: 'assess-q12',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'fill_in',
    question:
      'K-ABC-II는 두 가지 이론적 모형에 기반하여 해석할 수 있다. 하나는 Cattell-Horn-Carroll의 ( ) 모형이고, 다른 하나는 Luria의 ( ) 모형이다.',
    answer: 'CHC(인지능력) / 신경심리학적 처리과정',
    explanation:
      'K-ABC-II(Kaufman 아동용 지능검사 2판)는 CHC(Cattell-Horn-Carroll) 이론에 기반한 인지능력 해석과 Luria의 신경심리학적 처리과정 해석을 모두 지원합니다. CHC 모형에서는 결정지능(Gc), 유동지능(Gf), 단기기억(Gsm), 시각처리(Gv), 장기저장 및 인출(Glr) 등을 측정하며, Luria 모형에서는 순차처리, 동시처리, 계획능력, 학습능력을 측정합니다.',
    difficulty: 2,
  },
  {
    id: 'assess-q13',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'ox',
    question:
      'ABAS(적응행동평가시스템)는 개념적(conceptual), 사회적(social), 실제적(practical)의 3개 영역으로 적응행동을 측정하며, 이는 AAIDD(미국 지적·발달장애 협회)의 적응행동 분류 체계와 일치한다.',
    answer: 'O',
    explanation:
      'ABAS(Adaptive Behavior Assessment System)는 AAIDD의 적응행동 분류 체계에 따라 개념적 기술(의사소통, 학업, 자기지시), 사회적 기술(사회성, 여가, 자기보호), 실제적 기술(자기관리, 가정생활, 지역사회 이용, 건강·안전, 직업) 영역을 평가합니다. 지적장애 진단 시 지능검사와 함께 적응행동 평가가 반드시 필요합니다.',
    difficulty: 2,
    tags: { disability: '지적장애' },
  },
  {
    id: 'assess-q14',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'multiple',
    question:
      '검사의 신뢰도(reliability) 유형과 그 의미가 바르게 연결된 것은?',
    options: [
      '검사-재검사 신뢰도 – 동일 검사를 서로 다른 채점자가 채점한 결과의 일관성',
      '반분 신뢰도 – 동일 검사를 일정 시간 간격 후 재실시하여 비교한 일관성',
      '채점자 간 신뢰도 – 두 명 이상의 채점자가 동일 반응을 채점한 결과의 일관성',
      '내적 일관성 신뢰도 – 동형 검사 두 개를 실시하여 비교한 일관성',
    ],
    answer: 2,
    explanation:
      '검사-재검사 신뢰도는 동일 검사를 시간 간격을 두고 재실시하여 비교하는 것이고, 반분 신뢰도는 검사 문항을 반으로 나누어 비교하는 것이며, 내적 일관성 신뢰도(Cronbach α)는 모든 문항 간 일관성을 검토하는 것입니다. 채점자 간 신뢰도(inter-rater reliability)는 두 명 이상의 채점자가 동일한 행동이나 반응을 평정한 결과의 일치 정도를 의미합니다.',
    difficulty: 2,
  },
  {
    id: 'assess-q15',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'fill_in',
    question:
      '검사가 측정하고자 하는 것을 실제로 측정하고 있는 정도를 ( )이라 하며, 검사 내용이 교육과정이나 학습 목표를 적절히 대표하는지를 나타내는 유형은 ( ) 타당도이다.',
    answer: '타당도(validity) / 내용(content)',
    explanation:
      '타당도는 검사가 의도한 목적에 맞게 정확히 측정하고 있는지를 나타내는 개념입니다. 내용 타당도(content validity)는 검사 문항이 측정하려는 영역의 내용을 얼마나 잘 대표하는지를 의미합니다. 이 외에 구인 타당도(construct validity), 준거 관련 타당도(criterion-related validity: 예측/공인 타당도)가 있습니다.',
    difficulty: 1,
  },
  {
    id: 'assess-q16',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'multiple',
    question:
      'K-WISC-V에서 유동추론(FRI) 지표가 유의하게 낮은 학생에 대한 설명으로 가장 적절한 것은?',
    options: [
      '시각적 자극을 처리하고 공간 관계를 파악하는 데 어려움을 보인다',
      '새로운 상황에서 규칙이나 패턴을 발견하고 논리적으로 추론하는 데 어려움을 보인다',
      '언어적 개념 형성, 어휘, 언어적 추론에 어려움을 보인다',
      '정보를 일시적으로 저장하고 조작하는 작업기억에 어려움을 보인다',
    ],
    answer: 1,
    explanation:
      '유동추론(Fluid Reasoning Index, FRI)은 새로운 상황에서 규칙을 발견하고, 개념을 형성하며, 귀납적·연역적 논리를 사용하는 능력을 측정합니다. 행렬추론, 무게비교 등의 소검사로 구성됩니다. 시공간은 VSI, 언어는 VCI, 작업기억은 WMI와 관련됩니다.',
    difficulty: 2,
  },
  {
    id: 'assess-q17',
    subject: 'assessment',
    chapter: 'standardized-tests',
    type: 'ox',
    question:
      'Vineland 적응행동척도는 직접 대상자에게 검사를 실시하는 수행형 검사로, 보호자나 교사의 보고는 사용하지 않는다.',
    answer: 'X',
    explanation:
      'Vineland 적응행동척도(Vineland Adaptive Behavior Scales)는 대상자를 잘 아는 보호자나 교사와의 반구조화된 면담(interview) 형식으로 실시합니다. 대상자에게 직접 과제를 수행시키는 것이 아니라, 일상생활에서의 적응행동 수행 정도를 보호자/교사가 보고하는 방식입니다. 의사소통, 일상생활기술, 사회화, 운동기술 영역을 평가합니다.',
    difficulty: 1,
    tags: { disability: '지적장애' },
  },
  // ── Chapter: cbm (q18–q23) ──
  {
    id: 'assess-q18',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'fill_in',
    question:
      'Deno(1985)가 제시한 CBM의 5가지 특성은 타당하고(valid), 신뢰할 수 있고(reliable), ( )하고, 비용이 적게 들며(inexpensive), 교사가 이해하기 쉽다(easily understood)이다.',
    answer: '간편하다(simple/efficient)',
    explanation:
      'Deno(1985)는 CBM이 갖추어야 할 5가지 특성으로 ① 타당성(valid) ② 신뢰성(reliable) ③ 간편성/효율성(simple and efficient to administer) ④ 저비용(inexpensive) ⑤ 이해 용이성(easily understood by teachers)을 제시하였습니다. 이러한 특성 덕분에 교사가 교실 현장에서 반복적으로 사용할 수 있습니다.',
    difficulty: 2,
    tags: { disability: '학습장애' },
  },
  {
    id: 'assess-q19',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'multiple',
    question:
      'CBM 진전도 모니터링에서 연속 4개의 데이터 포인트가 목표선(goal line) 위에 위치할 때 교사가 취해야 할 의사결정으로 가장 적절한 것은?',
    options: [
      '현재 중재를 유지하면서 데이터를 계속 수집한다',
      '중재가 성공적이므로 목표를 상향 조정한다',
      '중재 프로그램을 변경한다',
      '평가를 종료하고 더 이상 모니터링하지 않는다',
    ],
    answer: 1,
    explanation:
      'CBM 의사결정 규칙에 따르면, 연속 4개의 데이터 포인트가 목표선 위에 있으면 학생의 진전이 목표보다 빠르다는 의미이므로 목표를 상향 조정합니다. 반대로 연속 4개 포인트가 목표선 아래에 있으면 중재 방법을 수정합니다. 이러한 체계적 의사결정 규칙이 CBM의 핵심적 장점입니다.',
    difficulty: 2,
    tags: { disability: '학습장애' },
  },
  {
    id: 'assess-q20',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'ox',
    question:
      'RTI(반응중재) 모델에서 이중불일치(dual discrepancy) 모델이란, 학생의 학업 수행 수준이 또래보다 낮고 동시에 중재에 대한 진전 속도(기울기)도 또래보다 느린 경우를 의미한다.',
    answer: 'O',
    explanation:
      '이중불일치(dual discrepancy) 모델은 학습장애 판별을 위한 RTI 기반 기준으로, ① 학업 수행 수준(level)의 불일치: 학생의 성취가 또래 평균보다 유의하게 낮음, ② 성장률(slope/rate of improvement)의 불일치: 적절한 중재를 받았음에도 진전 속도가 또래보다 유의하게 느림의 두 가지 조건이 동시에 충족되어야 합니다.',
    difficulty: 3,
    tags: { disability: '학습장애' },
  },
  {
    id: 'assess-q21',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'multiple',
    question:
      'RTI 3단계 모델에서 각 단계(tier)의 설명이 올바르게 연결된 것은?',
    options: [
      '1단계 – 소집단 집중 중재, 2단계 – 보편적 교수, 3단계 – 특수교육 의뢰 심사',
      '1단계 – 보편적 양질의 교수, 2단계 – 소집단 보충 중재, 3단계 – 개별화된 집중 중재',
      '1단계 – 진단 평가, 2단계 – 보편적 교수, 3단계 – 소집단 중재',
      '1단계 – 개별화 중재, 2단계 – 소집단 중재, 3단계 – 전체 학급 교수',
    ],
    answer: 1,
    explanation:
      'RTI 3단계 모델: 1단계(Tier 1)는 전체 학생을 대상으로 한 보편적이고 양질의 교수(universal instruction), 2단계(Tier 2)는 1단계에서 충분한 진전을 보이지 않는 학생(약 15-20%)에 대한 소집단 보충 중재(targeted intervention), 3단계(Tier 3)는 2단계에서도 반응하지 않는 학생(약 5%)에 대한 개별화된 집중 중재(intensive intervention)입니다.',
    difficulty: 1,
    tags: { disability: '학습장애' },
  },
  {
    id: 'assess-q22',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'fill_in',
    question:
      'CBM에서 목표선(goal line)은 학생의 현재 수행 수준과 기대되는 ( )을 연결한 선이며, 추세선(trend line)은 실제 수집된 데이터의 ( )를 나타내는 선이다.',
    answer: '목표 수행 수준(장기 목표) / 진전 경향(기울기)',
    explanation:
      '목표선(goal line/aimline)은 학생의 현재 수행 수준(baseline)에서 장기 목표(long-term goal)를 직선으로 연결한 것으로, 기대되는 성장 경로를 나타냅니다. 추세선(trend line)은 실제 수집된 데이터 포인트들의 경향을 보여주는 선으로, 중앙분할법(split-middle method) 등으로 산출합니다. 이 두 선의 비교를 통해 교수 효과를 판단합니다.',
    difficulty: 3,
    tags: { disability: '학습장애' },
  },
  {
    id: 'assess-q23',
    subject: 'assessment',
    chapter: 'cbm',
    type: 'ox',
    question:
      'CBM 탐침(probe)은 학년 수준의 교육과정 전체에서 표집하여 제작하므로, 매번 동일한 문항을 반복 사용하는 것이 원칙이다.',
    answer: 'X',
    explanation:
      'CBM 탐침(probe)은 학년 수준 교육과정에서 동등한 난이도의 다양한 문항을 표집하여 매번 다른(동형의) 탐침을 사용합니다. 같은 문항을 반복 사용하면 연습 효과(practice effect)가 나타나 학생의 진전도를 정확히 파악할 수 없기 때문입니다. 이는 CBM이 표준화 검사와 달리 반복 측정에 적합한 이유 중 하나입니다.',
    difficulty: 2,
    tags: { disability: '학습장애' },
  },
  // ── Chapter: fba (q24–q30) ──
  {
    id: 'assess-q24',
    subject: 'assessment',
    chapter: 'fba',
    type: 'multiple',
    question:
      '행동의 기능(function of behavior) 분류에서 정적 강화 기반 기능에 해당하지 않는 것은?',
    options: [
      '사회적 관심 획득',
      '원하는 물건/활동 획득',
      '과제 또는 요구 회피',
      '감각 자극 획득(자동 강화)',
    ],
    answer: 2,
    explanation:
      '행동의 기능은 크게 정적 강화(획득) 기반과 부적 강화(회피/도피) 기반으로 나뉩니다. 정적 강화 기반: ① 사회적 관심 획득 ② 물건/활동 획득 ③ 감각 자극 획득(자동 강화). 부적 강화 기반: ① 과제/요구 회피 ② 사회적 상호작용 회피 ③ 감각 자극 회피. "과제 또는 요구 회피"는 부적 강화(환경의 혐오자극 제거)에 해당합니다.',
    difficulty: 1,
    tags: { disability: '정서행동장애' },
  },
  {
    id: 'assess-q25',
    subject: 'assessment',
    chapter: 'fba',
    type: 'fill_in',
    question:
      'Iwata 등(1982/1994)의 아날로그 기능분석(analog functional analysis)에서는 4가지 실험 조건을 체계적으로 교대 제시한다. 이 4가지 조건은 관심(attention), ( ), ( ), 통제/놀이(control/play) 조건이다.',
    answer: '요구/과제(demand/escape) / 혼자(alone)',
    explanation:
      'Iwata의 아날로그 기능분석 4조건: ① 관심(attention) 조건 – 관심 획득 기능 확인, 문제행동 발생 시에만 관심 제공 ② 요구/과제(demand/escape) 조건 – 과제 회피 기능 확인, 문제행동 발생 시 과제 철회 ③ 혼자(alone) 조건 – 자동 강화(감각 자극) 기능 확인, 자극이 없는 환경에서 혼자 둠 ④ 통제/놀이(control/play) 조건 – 비교 기준선, 선호 자극과 관심이 풍부하고 요구가 없는 조건.',
    difficulty: 3,
    tags: { disability: '자폐성장애' },
  },
  {
    id: 'assess-q26',
    subject: 'assessment',
    chapter: 'fba',
    type: 'multiple',
    question:
      'FBA의 세 가지 평가 방법(간접적, 직접적, 실험적)에 대한 설명으로 옳은 것은?',
    options: [
      '간접적 방법은 행동 기능에 대한 인과관계를 직접 검증할 수 있어 가장 정확하다',
      '직접적 방법(자연적 관찰)은 ABC 기록, 산포도 등을 사용하여 행동과 환경의 상관관계를 파악한다',
      '실험적 방법(기능분석)은 면접과 설문지를 통해 가설을 수립하는 단계이다',
      '세 가지 방법 중 직접적 방법만으로도 행동의 기능을 확정적으로 증명할 수 있다',
    ],
    answer: 1,
    explanation:
      '간접적 방법(면접, 설문지)은 가설 수립 단계로 정확성이 상대적으로 낮고, 직접적 방법(ABC 기록, 산포도 등 자연적 관찰)은 실제 환경에서 행동과 선행사건·후속결과의 상관관계를 파악합니다. 실험적 방법(기능분석)은 환경 변인을 체계적으로 조작하여 행동의 기능을 인과적으로 검증하는 가장 엄밀한 방법입니다.',
    difficulty: 2,
    tags: { disability: '정서행동장애' },
  },
  {
    id: 'assess-q27',
    subject: 'assessment',
    chapter: 'fba',
    type: 'ox',
    question:
      'ABC 분석에서 선행사건(Antecedent)이란 문제행동 직전에 발생하는 환경 사건이나 자극을 의미하며, 배경사건(setting event)은 선행사건과 동일한 개념이다.',
    answer: 'X',
    explanation:
      '선행사건(antecedent)은 문제행동 직전에 발생하는 즉각적인 환경 사건(예: 교사의 지시, 또래의 놀림)이고, 배경사건(setting event)은 선행사건보다 시간적·공간적으로 먼 맥락적 요인(예: 수면 부족, 약물 미복용, 아침 가정 내 갈등)으로 행동 발생 가능성에 영향을 미칩니다. 두 개념은 구분되며, 배경사건은 행동의 동기확립조작(MO)으로 기능합니다.',
    difficulty: 3,
    tags: { disability: '정서행동장애' },
  },
  {
    id: 'assess-q28',
    subject: 'assessment',
    chapter: 'fba',
    type: 'fill_in',
    question:
      'FBA에서 행동의 기능에 따른 중재를 설계할 때, 문제행동과 동일한 기능을 수행하는 적절한 대체행동을 가르치는 접근을 ( )이라 하며, 대표적으로 Carr와 Durand가 개발한 방법이다.',
    answer: '기능적 의사소통 훈련(FCT: Functional Communication Training)',
    explanation:
      '기능적 의사소통 훈련(FCT)은 Carr와 Durand(1985)가 개발한 중재 방법으로, 문제행동의 기능을 파악한 후 동일한 기능을 달성할 수 있는 적절한 의사소통 행동(예: 카드 제시, 말하기, 제스처)을 대체행동으로 가르치는 것입니다. 예를 들어, 관심 획득 기능의 문제행동이면 "같이 놀아주세요"라는 요청 행동을 가르칩니다.',
    difficulty: 2,
    tags: { disability: '자폐성장애' },
  },
  {
    id: 'assess-q29',
    subject: 'assessment',
    chapter: 'fba',
    type: 'multiple',
    question:
      '다음 중 Iwata의 아날로그 기능분석에서 "혼자(alone)" 조건의 목적과 절차가 올바르게 기술된 것은?',
    options: [
      '대상자에게 어려운 과제를 지속적으로 제시하여 회피 기능을 확인한다',
      '대상자에게 풍부한 관심과 선호 활동을 제공하여 기준선을 측정한다',
      '대상자를 자극이 없는 환경에 혼자 두어 자동 강화(감각 자극) 기능을 확인한다',
      '대상자에게 관심을 철회하고, 문제행동 시에만 관심을 제공하여 관심 획득 기능을 확인한다',
    ],
    answer: 2,
    explanation:
      '혼자(alone) 조건은 사회적 상호작용이나 외부 자극이 없는 빈 환경에서 대상자를 혼자 두어, 문제행동이 외부 강화 없이도 자체적인 감각 자극(자동 강화)에 의해 유지되는지를 확인합니다. 이 조건에서 문제행동이 높게 나타나면 자동 강화 기능을 시사합니다.',
    difficulty: 3,
    tags: { disability: '자폐성장애' },
  },
  {
    id: 'assess-q30',
    subject: 'assessment',
    chapter: 'fba',
    type: 'multiple',
    question:
      '산포도(scatter plot) 분석의 주된 목적으로 가장 적절한 것은?',
    options: [
      '행동의 기능을 실험적으로 검증하여 인과관계를 확립한다',
      '시간대별·활동별로 문제행동의 발생 패턴을 시각적으로 파악하여 환경적 맥락을 분석한다',
      '보호자와 교사에게 면접하여 행동의 역사와 배경 정보를 수집한다',
      '대체행동의 효과를 사전·사후로 비교 측정한다',
    ],
    answer: 1,
    explanation:
      '산포도(scatter plot)는 Touchette 등(1985)이 개발한 직접 관찰 도구로, 하루 시간대를 구간으로 나누어 각 구간에서 문제행동 발생 여부와 빈도를 기록합니다. 이를 통해 문제행동이 특정 시간대, 활동, 교사, 환경에서 집중적으로 발생하는 패턴을 시각적으로 파악하여 환경적 맥락(선행사건, 배경사건)에 대한 가설을 수립할 수 있습니다.',
    difficulty: 2,
    tags: { disability: '정서행동장애' },
  },
];
