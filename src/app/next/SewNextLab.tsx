'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  FileText,
  LineChart,
  Library,
  ListChecks,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  aiInterventions,
  dailyPrescription,
  explanationBlocks,
  practiceModes,
  readinessMetrics,
  reviewQueue,
  roadmapPhases,
  topNavigation,
  weakDomains,
  type MetricTone,
  type PracticeMode,
  type PracticeModeId,
  type ReadinessStatus,
  type RoadmapStatus,
} from '@/lib/sew-next/prototype-data';

const toneStyles: Record<MetricTone, string> = {
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300',
  amber: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300',
  rose: 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300',
  sky: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300',
};

const statusStyles: Record<ReadinessStatus, string> = {
  strong: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  watch: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  risk: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
};

const roadmapStyles: Record<RoadmapStatus, string> = {
  live: 'border-emerald-300 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30',
  building: 'border-sky-300 bg-sky-50 dark:border-sky-900/60 dark:bg-sky-950/30',
  planned: 'border-border bg-card',
};

const modeIcons: Record<PracticeModeId, React.ComponentType<{ className?: string }>> = {
  adaptive: Target,
  custom: ListChecks,
  mock: FileText,
  review: Brain,
};

function statusLabel(status: ReadinessStatus) {
  if (status === 'strong') return '안정';
  if (status === 'watch') return '관찰';
  return '위험';
}

function roadmapLabel(status: RoadmapStatus) {
  if (status === 'live') return 'live';
  if (status === 'building') return 'building';
  return 'planned';
}

function MetricCard({ metric }: { metric: (typeof readinessMetrics)[number] }) {
  return (
    <div className={cn('rounded-lg border p-3', toneStyles[metric.tone])}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold">{metric.label}</p>
        <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-medium">
          {metric.delta}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold">
        {metric.value}
        <span className="text-sm font-semibold">{metric.unit}</span>
      </p>
      <p className="mt-1 text-[11px] leading-relaxed opacity-85">{metric.note}</p>
    </div>
  );
}

function ModePanel({ mode }: { mode: PracticeMode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-primary">{mode.label}</p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{mode.title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{mode.subtitle}</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-right">
          <p className="text-xs text-muted-foreground">{mode.duration}</p>
          <p className="text-sm font-semibold text-foreground">{mode.questionCount}</p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {mode.steps.map((step) => (
          <div key={step} className="rounded-lg bg-muted/40 px-3 py-2 text-xs font-medium text-foreground">
            {step}
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-dashed border-border p-3">
        <div className="flex items-start gap-2">
          <Bot className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <div>
            <p className="text-xs font-semibold text-foreground">AI-Human layer</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{mode.aiTouch}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">{mode.evidence}</p>
        <button className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
          {mode.primaryAction}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}

export function SewNextLab() {
  const [activeMode, setActiveMode] = useState<PracticeModeId>('adaptive');
  const activePracticeMode = useMemo(
    () => practiceModes.find((mode) => mode.id === activeMode) ?? practiceModes[0],
    [activeMode],
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Readiness cockpit prototype</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">SEW Next</h1>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              특수교육 임용 준비도를 중심으로 Qbank, 해설, 복습, 모의고사를 한 화면에서 조종합니다.
            </p>
          </div>
          <nav className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
            {topNavigation.map((item) => (
              <span
                key={item}
                className={cn(
                  'shrink-0 rounded-md px-3 py-1.5 text-xs font-medium',
                  item === 'Readiness'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground',
                )}
              >
                {item}
              </span>
            ))}
          </nav>
        </header>

        <section className="grid gap-4 py-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-muted-foreground">2027 특수교육 임용 Readiness</p>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-6xl font-bold tracking-tight">68%</span>
                  <span className="mb-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                    watch
                  </span>
                </div>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  위험 영역은 정서행동장애, 보조공학 절차, 지적장애 평가근거입니다. 오늘 세션은 이 세 영역을 먼저 줄입니다.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  오늘의 처방
                </div>
                <p className="mt-2 text-lg font-bold">{dailyPrescription.focus}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {dailyPrescription.duration}분 · {dailyPrescription.questions}문항 · 복습 {dailyPrescription.reviewItems}개
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {readinessMetrics.map((metric) => (
                <MetricCard key={metric.label} metric={metric} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
              <h2 className="text-base font-bold">High-risk blueprint domains</h2>
            </div>
            <div className="mt-4 space-y-3">
              {weakDomains.slice(0, 3).map((domain) => (
                <div key={domain.domain} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold">{domain.domain}</p>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', statusStyles[domain.risk])}>
                      {statusLabel(domain.risk)} · {domain.readiness}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{domain.blueprint}</p>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/80">{domain.prescription}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-xl border border-border bg-card p-3">
            <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Practice modes</p>
            <div className="space-y-1">
              {practiceModes.map((mode) => {
                const Icon = modeIcons[mode.id];
                const active = mode.id === activeMode;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveMode(mode.id)}
                    className={cn(
                      'flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <ModePanel mode={activePracticeMode} />
        </section>

        <section className="grid gap-4 py-5 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold">Explanation stack</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {explanationBlocks.map((block) => (
                <div key={block.label} className="rounded-lg bg-muted/40 p-3">
                  <p className="text-[11px] font-semibold text-primary">{block.label}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">{block.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{block.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-base font-bold">Spaced review queue</h2>
            </div>
            <div className="mt-4 space-y-3">
              {reviewQueue.map((item) => (
                <div key={item.title} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <span className="text-[10px] text-muted-foreground">{item.due}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${item.strength}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              <h2 className="text-base font-bold">AI inside the workflow</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {aiInterventions.map((item) => (
                <div key={item.label} className="rounded-lg border border-border p-3">
                  <p className="text-[11px] font-semibold text-primary">{item.label}</p>
                  <p className="mt-1 text-sm font-semibold">{item.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.body}</p>
                  <p className="mt-3 text-[10px] font-medium text-foreground/70">{item.trigger}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold">Roadmap rail</h2>
            </div>
            <div className="mt-4 space-y-2">
              {roadmapPhases.map((phase) => (
                <div key={phase.id} className={cn('rounded-lg border p-3', roadmapStyles[phase.status])}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {phase.id} · {phase.title}
                    </p>
                    <span className="text-[10px] font-semibold text-muted-foreground">{roadmapLabel(phase.status)}</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{phase.outcome}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="py-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Classic 데이터 계약을 건드리지 않는 독립 프로토타입입니다.
          </div>
        </footer>
      </div>
    </main>
  );
}
