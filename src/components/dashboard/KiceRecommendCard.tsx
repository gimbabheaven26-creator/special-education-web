import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

interface KiceTermsData {
  total_questions: number;
  unique_keywords: number;
  keywords_by_frequency: Record<string, number>;
}

function loadTopKeywords(count: number): Array<{ keyword: string; frequency: number }> {
  try {
    const raw = readFileSync(
      join(process.cwd(), 'data', 'terminology', 'kice-terms.json'),
      'utf-8'
    );
    const data: KiceTermsData = JSON.parse(raw);
    return Object.entries(data.keywords_by_frequency)
      .slice(0, count)
      .map(([keyword, frequency]) => ({ keyword, frequency }));
  } catch {
    return [];
  }
}

export function KiceRecommendCard() {
  const top = loadTopKeywords(5);
  if (top.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-amber-500" />
        <h3 className="text-sm font-bold text-foreground">기출 빈출 키워드</h3>
        <Link
          href="/kice"
          className="ml-auto text-[10px] text-primary hover:underline"
        >
          전체 보기
        </Link>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {top.map(({ keyword, frequency }) => (
          <Link
            key={keyword}
            href={`/terms?q=${encodeURIComponent(keyword)}`}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40 transition-colors"
          >
            {keyword}
            <span className="text-[10px] opacity-60">{frequency}회</span>
          </Link>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        최근 10년 기출문제에서 자주 출제된 키워드입니다.
      </p>
    </div>
  );
}
