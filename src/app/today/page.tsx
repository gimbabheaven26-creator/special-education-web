import Link from 'next/link';
import { BookOpen, FileText, Printer, ArrowRight } from 'lucide-react';
import { getKSTDate } from '@/lib/date-utils';
import { makeSheetCode } from '@/lib/sheet-code';

export default function TodayPage() {
  const today = getKSTDate();
  const sheetCode = makeSheetCode(today);
  const dateLabel = new Date(today + 'T00:00:00+09:00').toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-foreground">오늘의 학습</h1>
          <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20">
            {sheetCode}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">{dateLabel}</p>
      </div>

      <div className="space-y-3">
        <Link
          href="/daily"
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">오늘의 퀴즈 풀기</p>
            <p className="text-sm text-muted-foreground">OX 10문제 + 단답 5문제 + 서술 3문제</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href={`/today/answers?date=${today}`}
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
            <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">답안 확인하기</p>
            <p className="text-sm text-muted-foreground">오늘 문제의 정답과 해설을 확인할 수 있어요</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>

        <Link
          href={`/today/answers?date=${today}`}
          className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
            <Printer className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">출력용 시험지</p>
            <p className="text-sm text-muted-foreground">종이로 인쇄해서 연습할 수 있어요</p>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      </div>

      <div className="rounded-xl bg-muted/50 p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">매일 새로운 문제가 나와요</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          날짜별로 고유한 문제 세트가 생성됩니다. 같은 날 풀면 같은 문제가 나오니
          여러 번 풀어도 연습에 도움이 돼요. 시험지 번호({sheetCode})가 같으면 같은 문제예요.
        </p>
      </div>
    </div>
  );
}
