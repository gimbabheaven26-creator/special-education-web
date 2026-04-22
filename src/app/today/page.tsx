export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { FileText, Printer, ArrowRight } from 'lucide-react';
import { getKSTDate } from '@/lib/date-utils';
import { makeSheetCode } from '@/lib/sheet-code';
import { FocusBanner } from '@/components/dashboard/FocusBanner';
import { MissionBlockList } from '@/components/dashboard/MissionBlockList';
import TodayDashboard from './TodayDashboard';

export default function TodayPage() {
  const today = getKSTDate();
  const sheetCode = makeSheetCode(today);
  const dateLabel = new Date(today + 'T00:00:00+09:00').toLocaleDateString(
    'ko-KR',
    { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">오늘의 학습</h1>
        <p className="text-sm text-muted-foreground mt-1">{dateLabel}</p>
      </div>

      <FocusBanner />

      <MissionBlockList />

      <TodayDashboard />

      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
          일일 시험지
        </p>
        <div className="space-y-2">
          <Link
            href="/daily"
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors group"
          >
            <span
              data-testid="sheet-code"
              className="font-mono text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20 shrink-0"
            >
              {sheetCode}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">
                오늘의 시험지 풀기
              </p>
              <p className="text-xs text-muted-foreground">
                OX 10 + 단답 5 + 서술 3문제
              </p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
          </Link>

          <div className="flex gap-2">
            <Link
              href={'/today/answers?date=' + today}
              className="flex-1 flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-sm"
            >
              <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-foreground">답안 확인</span>
            </Link>
            <Link
              href={'/today/answers?date=' + today + '&print=1'}
              className="flex-1 flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors text-sm"
            >
              <Printer className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-foreground">출력용</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
