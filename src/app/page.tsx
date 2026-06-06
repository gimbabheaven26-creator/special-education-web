import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpenCheck,
  FileText,
  Landmark,
  PenLine,
  Search,
  Sparkles,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '이음진',
  description: '용어에서 개념, 기출, AI 동형문제까지 이어지는 특수교육 임용 수험지입니다.',
};

const todaysTerms = [
  {
    title: '기능적 행동평가',
    subject: '정서행동장애',
    clue: '행동의 형태가 아니라 유지 기능을 묻는 사례형 함정',
    href: '/terms?q=%EA%B8%B0%EB%8A%A5%EC%A0%81%20%ED%96%89%EB%8F%99%ED%8F%89%EA%B0%80',
  },
  {
    title: '개별화교육계획',
    subject: '특수교육법',
    clue: '회의 구성, 현재 수행 수준, 지원 책임이 함께 움직이는 법령 축',
    href: '/terms?q=%EA%B0%9C%EB%B3%84%ED%99%94%EA%B5%90%EC%9C%A1%EA%B3%84%ED%9A%8D',
  },
  {
    title: '보편적 학습설계',
    subject: '특수교육공학',
    clue: '전체 수업 설계와 개별 보조공학 지원을 가르는 응용형 용어',
    href: '/terms?q=%EB%B3%B4%ED%8E%B8%EC%A0%81%20%ED%95%99%EC%8A%B5%EC%84%A4%EA%B3%84',
  },
];

const primaryTermHref = todaysTerms[0].href;

const gates = [
  {
    name: '용어당',
    detail: '뜻과 변별 기준',
    href: primaryTermHref,
    icon: Search,
  },
  {
    name: '개념교',
    detail: '묶어 외울 구조',
    href: `${primaryTermHref}#concept-bridge`,
    icon: BookOpenCheck,
  },
  {
    name: '기출진',
    detail: '물음의 방식',
    href: `${primaryTermHref}#exam-sense`,
    icon: FileText,
  },
  {
    name: '출제공방',
    detail: '동형 문제 초안',
    href: `${primaryTermHref}#analog-seed`,
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#101214] text-stone-50">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:px-8 lg:py-8">
        <div className="flex min-h-[calc(100vh-3rem)] flex-col justify-between gap-8">
          <header className="border-b border-stone-700/70 pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-stone-50 px-3 py-1 text-stone-950">입진증</span>
              <span className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-cyan-100">
                2027 특수교육 임용
              </span>
            </div>

            <h1 className="mt-8 text-6xl font-black tracking-normal text-stone-50 sm:text-7xl lg:text-8xl">
              이음진
            </h1>
            <p className="mt-5 max-w-3xl text-xl font-semibold leading-relaxed text-stone-200">
              한 용어를 들고 들어와 개념의 다리를 건너고, 기출의 물음 앞에서 다시 확인하는 수험지.
            </p>
          </header>

          <section>
            <p className="text-xs font-black text-cyan-200">오늘의 통행 용어</p>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {todaysTerms.map((term, index) => (
                <Link
                  key={term.title}
                  href={term.href}
                  className="group rounded-sm border border-stone-700 bg-stone-900/70 p-4 transition-colors hover:border-cyan-300 hover:bg-stone-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-stone-400">{term.subject}</p>
                      <h2 className="mt-2 text-2xl font-black text-stone-50">{term.title}</h2>
                    </div>
                    <span className="font-mono text-sm font-bold text-cyan-200">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <p className="mt-4 min-h-[48px] text-sm leading-relaxed text-stone-300">{term.clue}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-100">
                    용어 열기
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>

          <section className="grid gap-3 border-t border-stone-700/70 pt-5 sm:grid-cols-4">
            {gates.map((gate) => {
              const Icon = gate.icon;
              return (
                <Link
                  key={gate.name}
                  href={gate.href}
                  className="group flex min-h-[112px] flex-col justify-between rounded-sm border border-stone-700 bg-stone-950 p-4 transition-colors hover:border-amber-200"
                >
                  <span className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-amber-200" />
                    <ArrowRight className="h-4 w-4 text-stone-500 transition-transform group-hover:translate-x-0.5 group-hover:text-amber-200" />
                  </span>
                  <span>
                    <span className="block text-lg font-black text-stone-50">{gate.name}</span>
                    <span className="mt-1 block text-xs font-semibold text-stone-400">{gate.detail}</span>
                  </span>
                </Link>
              );
            })}
          </section>
        </div>

        <aside className="border border-stone-700 bg-stone-950 p-5 lg:min-h-[calc(100vh-4rem)]">
          <div className="flex items-center gap-3 border-b border-stone-800 pb-5">
            <div className="grid h-11 w-11 place-items-center bg-stone-900">
              <Landmark className="h-5 w-5 text-amber-200" />
            </div>
            <div>
              <p className="text-xs font-bold text-stone-500">수험지 표식</p>
              <p className="text-xl font-black">용어에서 출제로</p>
            </div>
          </div>

          <dl className="mt-6 space-y-5 text-sm">
            <div>
              <dt className="text-stone-500">오늘의 입구</dt>
              <dd className="mt-1 font-bold text-stone-100">기능적 행동평가</dd>
            </div>
            <div>
              <dt className="text-stone-500">건너갈 다리</dt>
              <dd className="mt-1 font-bold text-stone-100">ABC 기록 · 기능 가설 · 긍정적 행동지원</dd>
            </div>
            <div>
              <dt className="text-stone-500">마지막 관문</dt>
              <dd className="mt-1 font-bold text-stone-100">기출 선지의 함정 구조를 바꾼 동형 문제</dd>
            </div>
          </dl>

          <Link
            href={todaysTerms[0].href}
            className="mt-8 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-sm bg-cyan-300 px-4 py-3 text-sm font-black text-stone-950 hover:bg-cyan-200"
          >
            오늘의 이음 시작
            <PenLine className="h-4 w-4" />
          </Link>
        </aside>
      </section>
    </div>
  );
}
