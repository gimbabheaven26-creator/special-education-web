import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowLeft,
  BookOpenCheck,
  Clock3,
  FileText,
  Landmark,
  PenLine,
  Route,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { getTermLensByQuery, type KiceRef, type TermLens } from '@/lib/ieumjin';
import TermPracticeClient from './TermPracticeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '용어당',
  description: '이음진 용어당에서 한 용어를 개념, 기출 감각, 동형문제 씨앗으로 이어 봅니다.',
};

function formatKiceRef(ref: Pick<KiceRef, 'year' | 'session' | 'number'>): string {
  return `${ref.year} ${ref.session} ${ref.number}번`;
}

function totalMinutes(lens: TermLens): number {
  return lens.twentyMinuteFlow.reduce((sum, step) => sum + step.minutes, 0);
}

export default function TermsPage({
  searchParams,
}: {
  searchParams?: { q?: string | string[] };
}) {
  const lens = getTermLensByQuery(searchParams?.q);
  const representativeRef = formatKiceRef(lens.examDna.representativeRef);

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
            <p className="text-xs font-black text-cyan-700">용어에서 답안으로 가는 첫 관문</p>
            <div className="mt-4 rounded-sm border border-stone-900 bg-[#101214] p-5 text-stone-50">
              <div className="flex flex-wrap items-center gap-2 text-xs font-black">
                <span className="rounded-sm bg-cyan-300 px-2 py-1 text-stone-950">{lens.subject}</span>
                <span className="rounded-sm border border-stone-700 px-2 py-1 text-stone-300">
                  {lens.status}
                </span>
                <span className="rounded-sm border border-stone-700 px-2 py-1 text-stone-300">
                  {totalMinutes(lens)}분 이음
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-normal sm:text-5xl">{lens.term.label}</h1>
              <p className="mt-3 text-sm font-semibold text-cyan-100">
                {lens.term.english} · {lens.term.aliases.join(' / ')}
              </p>
              <p className="mt-4 text-base font-semibold leading-relaxed text-stone-300">{lens.ticket}</p>
            </div>
          </header>

          <section className="grid gap-3 sm:grid-cols-2" aria-label="용어 렌즈 핵심 판독">
            <div className="rounded-sm border border-stone-300 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                <Landmark className="h-4 w-4 text-cyan-700" />
                공식 정의
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-stone-700">
                {lens.officialDefinition.summary}
              </p>
              <p className="mt-3 text-xs font-black text-cyan-700">NISE · 383398</p>
            </div>
            <div className="rounded-sm border border-stone-300 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                <PenLine className="h-4 w-4 text-cyan-700" />
                {lens.distinction.title}
              </div>
              <p className="mt-3 text-sm font-medium leading-relaxed text-stone-700">{lens.distinction.body}</p>
            </div>
          </section>

          <section className="rounded-sm border border-stone-300 bg-white p-5">
            <div className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-black">20분 이음</h2>
            </div>
            <ol className="mt-4 grid gap-3">
              {lens.twentyMinuteFlow.map((step, index) => (
                <li key={step.title} className="grid gap-2 rounded-sm border border-stone-200 bg-stone-50 p-3 sm:grid-cols-[72px_1fr]">
                  <span className="font-mono text-xs font-black text-cyan-700">
                    {String(index + 1).padStart(2, '0')} · {step.minutes}분
                  </span>
                  <span>
                    <span className="block text-sm font-black text-stone-950">{step.title}</span>
                    <span className="mt-1 block text-sm font-semibold leading-relaxed text-stone-700">
                      {step.prompt}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <section id="concept-bridge" className="rounded-sm border border-stone-300 bg-white p-5 scroll-mt-44">
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-black">개념교</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {lens.conceptBridge.map((concept, index) => (
                <div key={concept.title} className="rounded-sm border border-stone-200 bg-stone-50 p-3">
                  <p className="font-mono text-xs font-black text-cyan-700">{String(index + 1).padStart(2, '0')}</p>
                  <h3 className="mt-2 text-sm font-black text-stone-950">{concept.title}</h3>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-700">{concept.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="exam-sense" className="rounded-sm border border-stone-300 bg-white p-5 scroll-mt-44">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <h2 className="text-xl font-black">기출진</h2>
            </div>
            <div className="mt-4 rounded-sm border border-stone-900 bg-stone-950 p-4 text-stone-50">
              <p className="text-xs font-black text-cyan-200">{representativeRef}</p>
              <h3 className="mt-2 text-lg font-black">{lens.examDna.format}</h3>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-300">{lens.examDna.scene}</p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-black text-stone-500">자료</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-800">
                  {lens.examDna.materials.join(' · ')}
                </p>
              </div>
              <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-black text-stone-500">물음</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-800">
                  {lens.examDna.asks.join(' · ')}
                </p>
              </div>
              <div className="rounded-sm border border-stone-200 bg-stone-50 p-3">
                <p className="text-xs font-black text-stone-500">변형 축</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-800">
                  {lens.examDna.transformAxes.join(' · ')}
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-2">
              {lens.kiceRefs.map((ref) => (
                <div key={`${ref.year}-${ref.session}-${ref.number}`} className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-stone-200 px-3 py-2">
                  <span className="text-sm font-black text-stone-950">{formatKiceRef(ref)}</span>
                  <span className="text-xs font-bold text-stone-500">
                    {ref.type === 'fill_in' ? '단답형' : '서술형'} · {ref.points}점 · {ref.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <TermPracticeClient lens={lens} />

          <section id="analog-seed" className="rounded-sm border border-stone-900 bg-stone-950 p-5 text-stone-50 scroll-mt-44">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-200" />
              <h2 className="text-xl font-black">동형문제 씨앗</h2>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-sm border border-stone-800 bg-stone-900 p-3">
                <p className="text-xs font-black text-cyan-200">상황</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-200">{lens.analogSeed.condition}</p>
              </div>
              <div className="rounded-sm border border-stone-800 bg-stone-900 p-3">
                <p className="text-xs font-black text-cyan-200">물음</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-200">{lens.analogSeed.task}</p>
              </div>
              <div className="rounded-sm border border-stone-800 bg-stone-900 p-3">
                <p className="text-xs font-black text-cyan-200">오답 방지선</p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-stone-200">{lens.analogSeed.guardrail}</p>
              </div>
            </div>
          </section>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-40 lg:self-start">
          <section className="rounded-sm border border-stone-300 bg-white p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-cyan-700" />
              <h2 className="text-sm font-black text-stone-950">근거 묶음</h2>
            </div>
            <div className="mt-3 space-y-2">
              {lens.sources.map((source) => (
                <div key={`${source.kind}-${source.id}`} className="rounded-sm border border-stone-200 bg-stone-50 p-3">
                  <p className="text-xs font-black uppercase text-cyan-700">{source.kind}</p>
                  <p className="mt-1 text-sm font-black text-stone-950">{source.label}</p>
                  <p className="mt-1 break-all text-xs font-semibold text-stone-500">{source.path}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-sm border border-stone-900 bg-[#101214] p-4 text-stone-50">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-cyan-200" />
              <h2 className="text-sm font-black">답안 목표</h2>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-stone-300">{lens.answerGoal}</p>
          </section>
        </aside>
      </section>
    </main>
  );
}
