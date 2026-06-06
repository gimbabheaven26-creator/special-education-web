import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  FileText,
  PenLine,
  Search,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '용어당',
  description: '이음진 용어당에서 한 용어를 개념, 기출 감각, 동형문제 씨앗으로 이어 봅니다.',
};

type TermMission = {
  title: string;
  subject: string;
  minutes: number;
  ticket: string;
  definition: string;
  distinction: string;
  conceptBridge: string[];
  examSense: string[];
  analogSeed: {
    condition: string;
    task: string;
    guardrail: string;
  };
};

const missions: TermMission[] = [
  {
    title: '기능적 행동평가',
    subject: '정서행동장애',
    minutes: 7,
    ticket: '행동의 모양보다 행동이 유지되는 이유를 먼저 묻는 용어',
    definition:
      '문제행동이 언제, 어떤 단서 뒤에, 어떤 결과로 유지되는지 확인해 행동의 기능을 가설로 세우는 평가 절차입니다.',
    distinction:
      '행동 이름을 붙이는 작업이 아니라 선행사건, 행동, 후속결과를 이어 보고 중재 방향을 결정하는 작업입니다.',
    conceptBridge: ['ABC 기록', '기능 가설', '긍정적 행동지원', '대체행동 교수'],
    examSense: [
      '선지에 행동의 형태만 나오면 기능 판단 근거가 부족한지 본다.',
      '관찰 기록과 면담, 직접 관찰을 함께 쓰는지 확인한다.',
      '처벌보다 환경 조정과 대체행동 지도를 연결하는지 본다.',
    ],
    analogSeed: {
      condition: '점심시간 전 자해 행동이 반복되고, 행동 뒤 과제가 지연되는 사례',
      task: '기능 가설을 쓰고 대체행동 및 선행사건 중재를 고르게 하기',
      guardrail: '장애명이나 행동 강도만으로 기능을 단정하지 않게 만들기',
    },
  },
  {
    title: '개별화교육계획',
    subject: '특수교육법',
    minutes: 8,
    ticket: '지원이 좋은 말로 끝나지 않게 책임과 평가를 문서화하는 용어',
    definition:
      '특수교육대상자의 현재 수행 수준, 교육목표, 교육내용, 방법, 평가계획, 지원 책임을 합의해 기록하는 교육 계획입니다.',
    distinction:
      '상담 기록이나 일반 수업 계획이 아니라 학생별 목표와 제공할 지원을 공식적으로 묶는 실행 문서입니다.',
    conceptBridge: ['현재 수행 수준', '장단기 목표', 'IEP 회의', '관련서비스'],
    examSense: [
      '회의 구성원과 작성 시기, 평가 주기를 함께 묻는지 본다.',
      '목표가 관찰 가능한 행동과 조건으로 표현되는지 확인한다.',
      '배치 장소보다 필요한 지원과 접근권 보장이 앞서는지 본다.',
    ],
    analogSeed: {
      condition: '학기 초 통합학급 배치 후 읽기 접근 지원이 누락된 사례',
      task: 'IEP 회의에서 수정해야 할 목표, 지원, 평가 방법을 고르게 하기',
      guardrail: '담임의 선의나 보호자 요청만으로 법적 절차를 대체하지 않게 만들기',
    },
  },
  {
    title: '보편적 학습설계',
    subject: '특수교육공학',
    minutes: 6,
    ticket: '개별 사후 보완보다 처음부터 여러 접근 경로를 여는 설계 용어',
    definition:
      '다양한 학습자가 접근하고 표현하고 참여할 수 있도록 수업 목표, 자료, 방법, 평가를 처음부터 유연하게 설계하는 접근입니다.',
    distinction:
      '특정 학생에게만 보조도구를 붙이는 조치가 아니라 전체 수업 구조에 선택지와 접근성을 심는 설계입니다.',
    conceptBridge: ['다중 표상', '다중 표현', '다중 참여', '접근성'],
    examSense: [
      '수업 후 보충이 아니라 설계 초기부터 선택지를 제공하는지 본다.',
      '매체 다양화가 목표 낮추기와 섞이지 않았는지 확인한다.',
      '평가 표현 방식의 다양성과 핵심 목표 유지가 함께 있는지 본다.',
    ],
    analogSeed: {
      condition: '시각 자료 중심 과학 수업에서 감각 접근이 제한된 사례',
      task: '목표를 낮추지 않고 표상, 참여, 표현 선택지를 고르게 하기',
      guardrail: '단순 배려나 난이도 완화로 오답을 유도하지 않게 만들기',
    },
  },
];

function pickMission(rawQuery: string | string[] | undefined): TermMission {
  const query = Array.isArray(rawQuery) ? rawQuery[0] : rawQuery;
  if (!query) return missions[0];
  return missions.find((mission) => query.includes(mission.title)) ?? missions[0];
}

function termHref(title: string) {
  return `/terms?q=${encodeURIComponent(title)}`;
}

export default function TermsPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const mission = pickMission(searchParams?.q);
  const otherMissions = missions.filter((item) => item.title !== mission.title);

  return (
    <main className="bg-stone-50 text-stone-950">
      <section className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="space-y-5">
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-stone-300 bg-white px-3 text-sm font-bold text-stone-700 hover:border-stone-900 hover:text-stone-950"
          >
            <ArrowLeft className="h-4 w-4" />
            입진장으로
          </Link>

          <header className="border-b border-stone-300 pb-5">
            <p className="text-xs font-black text-cyan-700">용어에서 출제로 가는 첫 관문</p>
            <h1 className="mt-2 text-3xl font-black tracking-normal text-stone-950">용어당</h1>
            <div className="mt-5 rounded-sm border border-stone-900 bg-[#101214] p-5 text-stone-50">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                <span className="rounded-sm bg-cyan-300 px-2 py-1 text-stone-950">{mission.subject}</span>
                <span className="rounded-sm border border-stone-700 px-2 py-1 text-stone-300">
                  {mission.minutes}분 이음권
                </span>
              </div>
              <h2 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">{mission.title}</h2>
              <p className="mt-4 text-base font-semibold leading-relaxed text-stone-300">
                {mission.ticket}
              </p>
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2" aria-label="용어당 핵심 판독">
            <div className="rounded-sm border border-stone-300 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                <Search className="h-4 w-4 text-cyan-700" />
                뜻
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-stone-700">{mission.definition}</p>
            </div>
            <div className="rounded-sm border border-stone-300 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                <PenLine className="h-4 w-4 text-cyan-700" />
                변별 문장
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-stone-700">{mission.distinction}</p>
            </div>
          </section>

          <section id="concept-bridge" className="rounded-sm border border-stone-300 bg-white p-5 scroll-mt-44">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-black">개념교</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-stone-600">
              이 용어를 혼자 외우지 않고, 함께 움직이는 개념으로 묶습니다.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {mission.conceptBridge.map((concept, index) => (
                <div key={concept} className="flex min-h-14 items-center gap-3 rounded-sm bg-stone-100 px-3">
                  <span className="font-mono text-xs font-black text-cyan-700">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-black text-stone-900">{concept}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="exam-sense" className="rounded-sm border border-stone-300 bg-white p-5 scroll-mt-44">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-black">기출진</h2>
            </div>
            <p className="mt-2 text-sm font-semibold text-stone-600">
              실제 문항을 보기 전, 선지에서 걸리는 감각을 먼저 세웁니다.
            </p>
            <ol className="mt-4 space-y-3">
              {mission.examSense.map((sense, index) => (
                <li key={sense} className="flex gap-3 rounded-sm border border-stone-200 bg-stone-50 p-3">
                  <span className="font-mono text-xs font-black text-cyan-700">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-semibold leading-relaxed text-stone-800">{sense}</span>
                </li>
              ))}
            </ol>
          </section>

          <section id="analog-seed" className="rounded-sm border border-stone-900 bg-stone-950 p-5 text-stone-50 scroll-mt-44">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-200" />
              <h2 className="text-xl font-black">동형문제 씨앗</h2>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-sm border border-stone-800 bg-stone-900 p-3">
                <p className="text-xs font-black text-cyan-200">상황</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-200">{mission.analogSeed.condition}</p>
              </div>
              <div className="rounded-sm border border-stone-800 bg-stone-900 p-3">
                <p className="text-xs font-black text-cyan-200">물음</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-200">{mission.analogSeed.task}</p>
              </div>
              <div className="rounded-sm border border-stone-800 bg-stone-900 p-3">
                <p className="text-xs font-black text-cyan-200">오답 방지선</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-200">{mission.analogSeed.guardrail}</p>
              </div>
            </div>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <section className="rounded-sm border border-stone-300 bg-white p-4">
            <p className="text-xs font-black text-stone-500">오늘의 남은 이음권</p>
            <div className="mt-3 space-y-2">
              {otherMissions.map((item) => (
                <Link
                  key={item.title}
                  href={termHref(item.title)}
                  className="group flex min-h-16 items-center justify-between gap-3 rounded-sm border border-stone-200 px-3 hover:border-cyan-500"
                >
                  <span>
                    <span className="block text-sm font-black text-stone-950">{item.title}</span>
                    <span className="mt-1 block text-xs font-semibold text-stone-500">{item.subject}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-cyan-700" />
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-sm border border-stone-900 bg-[#101214] p-4 text-stone-50">
            <p className="text-xs font-black text-cyan-200">이음진 원칙</p>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-300">
              이 화면은 기존 공부방의 검색 도구가 아니라, 한 용어를 시험장에서 쓸 수 있는 판단으로 바꾸는 통행권입니다.
            </p>
          </section>
        </aside>
      </section>
    </main>
  );
}
