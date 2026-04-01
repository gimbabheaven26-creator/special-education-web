'use client';

import { MatchingExercise, FillBlank, StepGuide } from '@/components/mdx';

// ─── 장애 이해 ────────────────────────────────────────────────────────────────

const DISABILITY_MATCHING = [
  { term: '자폐스펙트럼장애', definition: '사회적 의사소통의 지속적 결함과 제한적·반복적 행동' },
  { term: '지적장애', definition: '지적 기능과 적응행동의 유의미한 제한' },
  { term: '정서·행동장애', definition: '학교생활 적응에 지장을 주는 정서·행동 문제가 지속' },
  { term: '학습장애', definition: '듣기, 말하기, 읽기, 쓰기, 수학 능력 중 특정 영역의 결함' },
  { term: '의사소통장애', definition: '조음, 유창성, 언어 이해·표현에 현저한 어려움' },
];

const ASSESSMENT_MATCHING = [
  { term: 'KISE-BAAT', definition: '읽기·쓰기·수학 기초학력 평가 (한국판 기초학력검사)' },
  { term: 'K-WISC-V', definition: '만 6~16세 아동 인지능력(지능) 평가' },
  { term: 'KNISE-SAB', definition: '적응행동 수준 측정 (국립특수교육원 적응행동검사)' },
  { term: 'K-CARS2', definition: '자폐스펙트럼장애 선별 및 진단 보조' },
  { term: 'BASA', definition: '교육과정 기반 측정(CBM)으로 학습 진전도 모니터링' },
];

// ─── 법령 ──────────────────────────────────────────────────────────────────────

const LAW_15_TEXT =
  '「장애인 등에 대한 특수교육법」 제{{15조|조문 번호}}에 따르면, 특수교육대상자의 선정은 {{영유아|대상}} 또는 학생이 장애를 가지고 있거나 특수교육을 필요로 하는 사람으로 진단·평가된 경우 {{교육장|결정 주체}} 또는 교육감이 결정한다. 선정 절차에서는 {{보호자|신청 주체}}의 사전 동의를 받아야 하며, 진단·평가 결과는 {{30일|기한}} 이내에 통보해야 한다.';

const LAW_15_VARIANTS: Record<string, string[]> = {
  '15조': ['제15조', '15'],
  '영유아': ['영유아'],
  '교육장': ['교육장'],
  '보호자': ['학부모', '법정대리인'],
  '30일': ['30'],
};

const LAW_17_TEXT =
  '「장애인 등에 대한 특수교육법」 제{{17조|조문 번호}}에 따르면, 특수교육대상자의 배치는 {{일반학교|우선 배치 장소}}의 일반학급, 특수학급 또는 {{특수학교|대안 배치 장소}}에 배치한다. 교육장 또는 교육감은 특수교육대상자를 {{거주지에서 가장 가까운|배치 기준}} 곳에 배치하여야 하며, {{보호자|동의 주체}}의 의견을 수렴하여야 한다.';

const LAW_17_VARIANTS: Record<string, string[]> = {
  '17조': ['제17조', '17'],
  '일반학교': ['일반학교'],
  '특수학교': ['특수학교'],
  '거주지에서 가장 가까운': ['가장 가까운', '거주지에서 가까운'],
  '보호자': ['학부모', '법정대리인'],
};

const LAW_22_TEXT =
  '「장애인 등에 대한 특수교육법」 제{{22조|조문 번호}}에 따르면, 각급학교의 장은 특수교육대상자의 교육적 요구에 적합한 {{개별화교육계획|문서명}}을 매 학년의 시작일부터 {{2주|기한}} 이내에 {{개별화교육지원팀|작성 주체}}이 작성하여야 한다. 개별화교육계획에는 인적사항, 현재 학습 수행수준, {{교육목표|포함 내용}}, 교육 내용·방법·평가계획 등이 포함되어야 한다.';

const LAW_22_VARIANTS: Record<string, string[]> = {
  '22조': ['제22조', '22'],
  '개별화교육계획': ['IEP'],
  '2주': ['14일', '2주일'],
  '개별화교육지원팀': ['IEP팀', 'IEP 팀'],
  '교육목표': ['교육 목표', '연간목표'],
};

// ─── 교수·학습 ─────────────────────────────────────────────────────────────────

const INSTRUCTION_MODIFICATION_MATCHING = [
  { term: '교수환경 수정', definition: '좌석 배치, 조명, 소음 조절 등 물리적 환경 변화' },
  { term: '교수방법 수정', definition: '시각적 단서, 또래 교수, 직접교수법 등 교수 전략 변경' },
  { term: '교수내용 수정', definition: '학습 목표의 양·난이도·추상성 조절' },
  { term: '평가방법 수정', definition: '시험 시간 연장, 대체 평가, 평가 기준 조정' },
];

const UDL_MATCHING = [
  { term: '표상의 다양한 수단', definition: '학습 내용을 시각·청각·촉각 등 다양한 방식으로 제시' },
  { term: '행동과 표현의 다양한 수단', definition: '학습 결과를 말·글·그림·행동 등으로 표현할 수 있게 허용' },
  { term: '참여의 다양한 수단', definition: '학습 동기 유발과 자기조절 지원을 위한 선택권 제공' },
];

const IEP_STEPS = [
  {
    title: '1단계: 현행 수준 파악',
    content:
      '학생의 현재 학업 성취 수준, 기능적 수행 수준을 다각도로 평가합니다.\n표준화 검사, 교육과정 기반 측정(CBM), 관찰, 면담 등 다양한 방법을 활용합니다.',
    checklist: [
      '학업 성취 수준 평가 완료',
      '적응행동 평가 완료',
      '보호자 면담 완료',
      '관련 서비스 요구 파악',
    ],
  },
  {
    title: '2단계: 연간 목표 설정',
    content:
      '현행 수준을 기반으로 1년간 달성할 교육 목표를 설정합니다.\n목표는 SMART 기준(구체적, 측정가능, 달성가능, 관련성, 시한)으로 작성합니다.',
    checklist: ['교과별 연간 목표 작성', '행동 목표 포함', 'SMART 기준 충족 확인'],
  },
  {
    title: '3단계: 단기 목표 및 교수 전략',
    content:
      '연간 목표를 달성하기 위한 단기 목표(학기/월 단위)와 구체적 교수 전략을 수립합니다.\n교수적 수정(교수 환경, 교수 방법, 교수 내용, 평가 방법)을 계획합니다.',
    checklist: [
      '단기 목표 세분화',
      '교수적 수정 계획 수립',
      '보조공학 기기 필요 여부 확인',
    ],
  },
  {
    title: '4단계: 관련 서비스 결정',
    content:
      '학생에게 필요한 관련 서비스(상담, 치료지원, 보조인력 등)를 결정합니다.\n서비스 제공 시작일, 빈도, 기간을 명시합니다.',
    checklist: [
      '필요한 관련 서비스 목록 작성',
      '서비스 제공 일정 확정',
      '관련 서비스 제공자 연계',
    ],
  },
  {
    title: '5단계: 평가 계획 수립',
    content:
      '목표 달성 여부를 평가할 방법과 시기를 미리 계획합니다.\n최소 학기 1회 이상 IEP를 점검하며, 필요 시 수정합니다.',
    checklist: [
      '평가 방법 결정 (관찰/검사/수행평가)',
      '평가 일정 수립',
      'IEP 팀 회의 일정 확정',
      '보호자 통보 계획',
    ],
  },
];

// ─── 행동지원·전환교육 ────────────────────────────────────────────────────────

const PBS_STEPS = [
  {
    title: '1단계: 행동의 조작적 정의',
    content:
      '문제행동을 관찰 가능하고 측정 가능한 형태로 명확하게 정의합니다.\n"공격적이다"가 아니라 "수업 중 옆 친구의 팔을 때린다"처럼 구체화합니다.',
    checklist: [
      '행동을 관찰 가능한 용어로 기술',
      '행동의 시작과 끝 기준 설정',
      '비행동(하지 않는 것)과 구분',
    ],
  },
  {
    title: '2단계: 기능평가(FBA)',
    content:
      '문제행동의 기능(목적)을 파악합니다.\n행동의 선행사건(A), 행동(B), 후속결과(C)를 분석하여 행동의 기능을 추론합니다.',
    checklist: [
      'ABC 관찰 기록 수집',
      '행동의 기능 가설 수립 (관심 획득, 과제 회피, 감각 자극, 실물 획득)',
      '기능 가설 검증',
    ],
  },
  {
    title: '3단계: 행동지원계획(BSP) 수립',
    content:
      '기능평가 결과를 바탕으로 긍정적 행동지원 계획을 수립합니다.\n선행사건 중재, 대체행동 교수, 후속결과 중재를 포함합니다.',
    checklist: [
      '선행사건 수정 전략',
      '대체행동(동일 기능) 선정 및 교수',
      '강화 계획 수립',
      '위기 대응 계획',
    ],
  },
  {
    title: '4단계: 실행 및 모니터링',
    content:
      '수립한 계획을 일관성 있게 실행하고 행동 변화를 지속적으로 모니터링합니다.\n관련 인력 모두가 동일한 전략을 사용해야 합니다.',
    checklist: [
      '관련 인력 교육',
      '일관된 전략 적용',
      '행동 데이터 지속 수집',
    ],
  },
  {
    title: '5단계: 평가 및 수정',
    content:
      '행동 데이터를 분석하여 지원 계획의 효과를 평가합니다.\n효과적이지 않으면 기능평가부터 다시 검토합니다.',
    checklist: [
      '목표행동 감소 여부 확인',
      '대체행동 증가 여부 확인',
      '필요 시 계획 수정',
    ],
  },
];

const TRANSITION_STEPS = [
  {
    title: '1단계: 전환평가',
    content:
      '학생의 흥미, 적성, 강점, 현재 수행 수준을 다양한 방법으로 평가합니다.\n생태학적 평가, 직업적성 검사, 지역사회 기능 평가 등을 활용합니다.',
    checklist: [
      '흥미/적성 검사 실시',
      '현재 기능 수준 평가',
      '학생·보호자 면담',
      '지역사회 환경 분석',
    ],
  },
  {
    title: '2단계: 전환목표 설정',
    content:
      '평가 결과를 바탕으로 졸업 후 진로 목표를 설정합니다.\n고용, 교육/훈련, 독립생활, 지역사회 참여 영역을 포함합니다.',
    checklist: [
      '졸업 후 진로 비전 수립',
      '연간 전환 목표 작성',
      'IEP에 전환 목표 포함',
    ],
  },
  {
    title: '3단계: 전환서비스 계획',
    content:
      '목표 달성에 필요한 구체적 서비스와 활동을 계획합니다.\n학교 교육과정, 지역사회 경험, 직업 훈련 등을 연계합니다.',
    checklist: [
      '필요 서비스 목록 작성',
      '관련 기관 연계',
      '가족 지원 계획',
    ],
  },
  {
    title: '4단계: 서비스 실행',
    content:
      '계획한 전환서비스를 체계적으로 실행합니다.\n현장실습, 지역사회 체험, 일상생활 훈련 등을 실시합니다.',
    checklist: [
      '현장실습 실시',
      '진행 상황 모니터링',
      '필요 시 계획 수정',
    ],
  },
  {
    title: '5단계: 평가 및 후속 지원',
    content:
      '전환 목표 달성 여부를 평가하고 졸업 후 후속 지원을 연계합니다.\n졸업 후 적응 상태를 추적하고 필요한 지원을 연결합니다.',
    checklist: [
      '전환 목표 달성 평가',
      '졸업 후 지원 기관 연계',
      '사후관리 계획 수립',
    ],
  },
];

// ─── 페이지 컴포넌트 ──────────────────────────────────────────────────────────

export default function InteractiveClient() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">인터랙티브 학습</h1>
        <p className="text-muted-foreground text-sm">
          매칭·빈칸·절차 연습으로 핵심 개념을 능동적으로 익히세요.
        </p>
      </div>

      {/* ── 장애 이해 ── */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold border-b border-border pb-2">장애 이해</h2>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">장애 유형 매칭</h3>
          <MatchingExercise
            title="장애유형과 특성을 연결하세요"
            items={DISABILITY_MATCHING}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">진단·평가 도구 매칭</h3>
          <MatchingExercise
            title="검사도구와 측정 영역을 연결하세요"
            items={ASSESSMENT_MATCHING}
          />
        </section>
      </div>

      {/* ── 법령 ── */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold border-b border-border pb-2">법령</h2>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">특수교육대상자 선정 (제15조)</h3>
          <FillBlank
            title="빈칸을 채워 법 조문을 완성하세요"
            text={LAW_15_TEXT}
            acceptableVariants={LAW_15_VARIANTS}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">특수교육대상자 배치 (제17조)</h3>
          <FillBlank
            title="빈칸을 채워 법 조문을 완성하세요"
            text={LAW_17_TEXT}
            acceptableVariants={LAW_17_VARIANTS}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">개별화교육 (제22조)</h3>
          <FillBlank
            title="빈칸을 채워 법 조문을 완성하세요"
            text={LAW_22_TEXT}
            acceptableVariants={LAW_22_VARIANTS}
          />
        </section>
      </div>

      {/* ── 교수·학습 ── */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold border-b border-border pb-2">교수·학습</h2>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">교수적 수정 4유형</h3>
          <MatchingExercise
            title="수정 유형과 예시를 연결하세요"
            items={INSTRUCTION_MODIFICATION_MATCHING}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">보편적 학습설계(UDL) 3원칙</h3>
          <MatchingExercise
            title="UDL 원칙과 설명을 연결하세요"
            items={UDL_MATCHING}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">IEP 작성 절차</h3>
          <StepGuide
            title="개별화교육계획(IEP) 작성 5단계"
            steps={IEP_STEPS}
          />
        </section>
      </div>

      {/* ── 행동지원·전환교육 ── */}
      <div className="space-y-8">
        <h2 className="text-xl font-bold border-b border-border pb-2">
          행동지원·전환교육
        </h2>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">긍정적 행동지원(PBS) 절차</h3>
          <StepGuide
            title="긍정적 행동지원 5단계"
            steps={PBS_STEPS}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">전환교육 절차</h3>
          <StepGuide
            title="전환교육 계획 및 실행 5단계"
            steps={TRANSITION_STEPS}
          />
        </section>
      </div>
    </main>
  );
}
