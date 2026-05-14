import Link from 'next/link';
import { ArrowRight, Brain, ClipboardList } from 'lucide-react';

interface ConceptActionPanelProps {
  readonly title: string;
  readonly subjectTitle: string;
  readonly quizHref: string | null;
  readonly kiceRefCount: number;
  readonly firstKiceHref: string | null;
}

export function ConceptActionPanel({
  title,
  subjectTitle,
  quizHref,
  kiceRefCount,
  firstKiceHref,
}: ConceptActionPanelProps) {
  if (!quizHref && !firstKiceHref) return null;

  return (
    <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-primary">바로 이어서</p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {title}을 기출과 문제로 확인해보세요
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {subjectTitle}
            {kiceRefCount > 0 ? ` · 연결된 기출 ${kiceRefCount}건` : ''}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:w-52">
          {firstKiceHref && (
            <Link
              href={firstKiceHref}
              className="inline-flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 text-xs font-medium text-foreground ring-1 ring-border transition-colors hover:bg-muted"
            >
              <span className="inline-flex items-center gap-1.5">
                <ClipboardList className="h-3.5 w-3.5" />
                기출 {kiceRefCount}건 확인
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          )}
          {quizHref && (
            <Link
              href={quizHref}
              className="inline-flex items-center justify-between gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <span className="inline-flex items-center gap-1.5">
                <Brain className="h-3.5 w-3.5" />
                관련 퀴즈 풀기
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
