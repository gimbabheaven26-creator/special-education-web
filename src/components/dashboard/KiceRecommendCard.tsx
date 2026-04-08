import Link from 'next/link';
import { TrendingUp, BookOpen } from 'lucide-react';
import kiceTermsData from '@/../data/terminology/kice-terms.json';
import { findConceptForKeyword } from '@/lib/kice/keyword-concept-map';

interface KeywordWithLink {
  keyword: string;
  frequency: number;
  href: string;
  hasConcept: boolean;
}

function loadTopKeywords(count: number): KeywordWithLink[] {
  try {
    return Object.entries(kiceTermsData.keywords_by_frequency)
      .slice(0, count)
      .map(([keyword, frequency]) => {
        const concept = findConceptForKeyword(keyword);
        return {
          keyword,
          frequency: frequency as number,
          href: concept
            ? `/concepts/${concept.subject}/${concept.slug}`
            : `/kice?tab=by-year&q=${encodeURIComponent(keyword)}`,
          hasConcept: !!concept,
        };
      });
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
        {top.map(({ keyword, frequency, href, hasConcept }) => (
          <Link
            key={keyword}
            href={href}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:hover:bg-amber-900/40 transition-colors"
          >
            {hasConcept && <BookOpen className="h-3 w-3 opacity-60" />}
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
