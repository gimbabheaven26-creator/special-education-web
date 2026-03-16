'use client';

import { MatchingExercise, FillBlank, StepGuide } from '@/components/mdx';

const DISABILITY_MATCHING = [
  { term: '자폐스펙트럼장애', definition: '사회적 의사소통의 지속적 결함과 제한적·반복적 행동' },
  { term: '지적장애', definition: '지적 기능과 적응행동의 유의미한 제한' },
  { term: '정서·행동장애', definition: '학교생활 적응에 지장을 주는 정서·행동 문제가 지속' },
  { term: '학습장애', definition: '듣기, 말하기, 읽기, 쓰기, 수학 능력 중 특정 영역의 결함' },
  { term: '의사소통장애', definition: '조음, 유창성, 언어 이해·표현에 현저한 어려움' },
];

const LAW_TEXT = '「장애인 등에 대한 특수교육법」 제{{15조|조문 번호}}에 따르면, 특수교육대상자의 선정은 {{영유아|대상}} 또는 학생이 장애를 가지고 있거나 특수교육을 필요로 하는 사람으로 진단·평가된 경우 {{교육장|결정 주체}} 또는 교육감이 결정한다. 선정 절차에서는 {{보호자|신청 주체}}의 사전 동의를 받아야 하며, 진단·평가 결과는 {{30일|기한}} 이내에 통보해야 한다.';

const LAW_VARIANTS: Record<string, string[]> = {
  '15조': ['제15조', '15'],
  '영유아': ['영유아'],
  '교육장': ['교육장'],
  '보호자': ['학부모', '법정대리인'],
  '30일': ['30'],
};

const IEP_STEPS = [
  {
    title: '1단계: 현행 수준 파악',
    content: '학생의 현재 학업 성취 수준, 기능적 수행 수준을 다각도로 평가합니다.\n표준화 검사, 교육과정 기반 측정(CBM), 관찰, 면담 등 다양한 방법을 활용합니다.',
    checklist: [
      '학업 성취 수준 평가 완료',
      '적응행동 평가 완료',
      '보호자 면담 완료',
      '관련 서비스 요구 파악',
    ],
  },
  {
    title: '2단계: 연간 목표 설정',
    content: '현행 수준을 기반으로 1년간 달성할 교육 목표를 설정합니다.\n목표는 SMART 기준(구체적, 측정가능, 달성가능, 관련성, 시한)으로 작성합니다.',
    checklist: [
      '교과별 연간 목표 작성',
      '행동 목표 포함',
      'SMART 기준 충족 확인',
    ],
  },
  {
    title: '3단계: 단기 목표 및 교수 전략',
    content: '연간 목표를 달성하기 위한 단기 목표(학기/월 단위)와 구체적 교수 전략을 수립합니다.\n교수적 수정(교수 환경, 교수 방법, 교수 내용, 평가 방법)을 계획합니다.',
    checklist: [
      '단기 목표 세분화',
      '교수적 수정 계획 수립',
      '보조공학 기기 필요 여부 확인',
    ],
  },
  {
    title: '4단계: 관련 서비스 결정',
    content: '학생에게 필요한 관련 서비스(상담, 치료지원, 보조인력 등)를 결정합니다.\n서비스 제공 시작일, 빈도, 기간을 명시합니다.',
    checklist: [
      '필요한 관련 서비스 목록 작성',
      '서비스 제공 일정 확정',
      '관련 서비스 제공자 연계',
    ],
  },
  {
    title: '5단계: 평가 계획 수립',
    content: '목표 달성 여부를 평가할 방법과 시기를 미리 계획합니다.\n최소 학기 1회 이상 IEP를 점검하며, 필요 시 수정합니다.',
    checklist: [
      '평가 방법 결정 (관찰/검사/수행평가)',
      '평가 일정 수립',
      'IEP 팀 회의 일정 확정',
      '보호자 통보 계획',
    ],
  },
];

export default function InteractivePage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">인터랙티브 학습</h1>
        <p className="text-muted-foreground text-sm">
          능동적으로 참여하며 핵심 개념을 익히세요.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">장애 유형 매칭</h2>
        <MatchingExercise
          title="장애유형과 특성을 연결하세요"
          items={DISABILITY_MATCHING}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">법령 빈칸 채우기</h2>
        <FillBlank
          title="특수교육대상자 선정 (제15조)"
          text={LAW_TEXT}
          acceptableVariants={LAW_VARIANTS}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">IEP 작성 절차</h2>
        <StepGuide
          title="개별화교육계획(IEP) 작성 5단계"
          steps={IEP_STEPS}
        />
      </section>
    </main>
  );
}
