'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, BookOpenCheck, FileText, Landmark, PenLine, Search, Sparkles } from 'lucide-react';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Header } from '@/components/layout/Header';
import { BottomTabBar } from '@/components/layout/BottomTabBar';
import { ConditionalReviewPanel } from '@/components/layout/ConditionalReviewPanel';
import { StudySessionTracker } from '@/components/StudySessionTracker';
import { SyncManager } from '@/components/SyncManager';
import { BetaFeedbackWidget } from '@/components/BetaFeedbackWidget';

const ieumjinTermsHref =
  '/terms?q=%EA%B8%B0%EB%8A%A5%EC%A0%81%20%ED%96%89%EB%8F%99%ED%8F%89%EA%B0%80';
const ieumjinConceptHref = `${ieumjinTermsHref}#concept-bridge`;
const ieumjinExamHref = `${ieumjinTermsHref}#exam-sense`;
const ieumjinAnalogHref = `${ieumjinTermsHref}#analog-seed`;

const ieumjinSteps = [
  { label: '용어당', detail: '뜻과 변별', href: ieumjinTermsHref, icon: Search },
  { label: '개념교', detail: '연결 개념', href: ieumjinConceptHref, icon: BookOpenCheck },
  { label: '기출진', detail: '선지 함정', href: ieumjinExamHref, icon: FileText },
  { label: '출제공방', detail: '동형 초안', href: ieumjinAnalogHref, icon: Sparkles },
];

function IeumjinChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="sticky top-0 z-50 border-b border-stone-800 bg-[#101214] text-stone-50 print:hidden">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-3 px-4 py-3 md:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 font-black tracking-normal">
              <span className="grid h-9 w-9 place-items-center rounded-sm bg-cyan-300 text-stone-950">
                <Landmark className="h-5 w-5" />
              </span>
              <span className="text-lg">이음진</span>
            </Link>
            <Link
              href={ieumjinTermsHref}
              className="hidden min-h-10 items-center gap-2 rounded-sm border border-cyan-300/40 px-3 text-xs font-black text-cyan-100 hover:border-cyan-200 hover:text-cyan-50 sm:inline-flex"
            >
              이음권 다시 열기
              <PenLine className="h-3.5 w-3.5" />
            </Link>
          </div>

          <section
            aria-label="이음진 미션 바"
            className="grid gap-3 border-t border-stone-800 pt-3 lg:grid-cols-[minmax(0,1fr)_auto]"
          >
            <div>
              <p className="text-xs font-bold text-cyan-200">오늘의 이음권</p>
              <p className="mt-1 text-base font-black text-stone-50 sm:text-lg">
                기능적 행동평가 20분 이음
              </p>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-stone-400">
                공식 출처, 연결 개념, 기출 DNA, 동형문제 씨앗을 한 줄로 이어 봅니다.
              </p>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="이음진 학습 순서">
              {ieumjinSteps.map((step) => {
                const Icon = step.icon;
                const content = (
                  <>
                    <Icon className="h-4 w-4 text-amber-200" />
                    <span>
                      <span className="block text-xs font-black text-stone-50">{step.label}</span>
                      <span className="block text-[10px] font-semibold text-stone-500">{step.detail}</span>
                    </span>
                    {step.href && <ArrowRight className="ml-auto h-3.5 w-3.5 text-stone-500" />}
                  </>
                );

                if (!step.href) {
                  return (
                    <span
                      key={step.label}
                      className="flex min-h-12 min-w-[132px] items-center gap-2 rounded-sm border border-stone-800 bg-stone-950 px-3"
                    >
                      {content}
                    </span>
                  );
                }

                return (
                  <Link
                    key={step.label}
                    href={step.href}
                    className="flex min-h-12 min-w-[132px] items-center gap-2 rounded-sm border border-stone-800 bg-stone-950 px-3 transition-colors hover:border-amber-200"
                  >
                    {content}
                  </Link>
                );
              })}
            </nav>
          </section>
        </div>
      </header>
      {children}
    </div>
  );
}

export function LayoutProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isIeumjinRoot = pathname === '/';
  const isIeumjinSurface = isIeumjinRoot || pathname === '/terms';

  if (isIeumjinRoot) {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  if (isIeumjinSurface) {
    return (
      <ThemeProvider>
        <IeumjinChrome>{children}</IeumjinChrome>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <Header />
      {children}
      <BottomTabBar />
      <ConditionalReviewPanel />
      <StudySessionTracker />
      <SyncManager />
      <BetaFeedbackWidget />
    </ThemeProvider>
  );
}
