'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Filter,
  ListChecks,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const domains = ['특수교육공학', '정서행동장애', '지적장애'] as const;
const difficulties = ['중', '상', '하'] as const;
const formats = ['사례형', '절차 배열', '용어 구분'] as const;

export function QbankBuilder() {
  const [domain, setDomain] = useState<(typeof domains)[number]>('특수교육공학');
  const [difficulty, setDifficulty] = useState<(typeof difficulties)[number]>('중');
  const [format, setFormat] = useState<(typeof formats)[number]>('사례형');

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 py-6 lg:px-6">
        <Link
          href="/next"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          SEW Next
        </Link>

        <header className="mt-4 flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Custom Qbank builder</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">SEW Next Qbank</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              영역, 난도, 형식을 조합해 기출 커버리지 빈틈을 줄이는 커스텀 세션을 만듭니다.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="text-xs font-semibold text-muted-foreground">예상 분량</p>
            <p className="mt-1 text-2xl font-bold text-primary">10문항</p>
            <p className="mt-1 text-xs text-muted-foreground">25분 · 해설 즉시 공개</p>
          </div>
        </header>

        <section className="grid gap-4 py-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            <FilterGroup title="영역" icon={Filter}>
              {domains.map((item) => (
                <FilterButton key={item} active={domain === item} onClick={() => setDomain(item)}>
                  {item}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup title="난도" icon={SlidersHorizontal}>
              {difficulties.map((item) => (
                <FilterButton key={item} active={difficulty === item} onClick={() => setDifficulty(item)}>
                  {item}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup title="문항 형식" icon={ListChecks}>
              {formats.map((item) => (
                <FilterButton key={item} active={format === item} onClick={() => setFormat(item)}>
                  {item}
                </FilterButton>
              ))}
            </FilterGroup>
          </div>

          <aside className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-bold">선택된 세션</h2>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow label="영역" value={domain} />
              <SummaryRow label="난도" value={difficulty} />
              <SummaryRow label="형식" value={format} />
              <SummaryRow label="AI 점검" value="커버리지 빈틈 경고" />
            </dl>
            <Link
              href="/next/practice?mode=custom"
              className="mt-5 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              커스텀 세션 시작
              <ArrowRight className="h-4 w-4" />
            </Link>
          </aside>
        </section>
      </div>
    </main>
  );
}

function FilterGroup({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold">{title}</h2>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'min-h-[40px] rounded-lg border px-3 py-2 text-sm font-semibold transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-semibold text-foreground">{value}</dd>
    </div>
  );
}
