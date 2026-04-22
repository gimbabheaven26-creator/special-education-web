'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import type { Subject, SearchItem } from '@/types/content';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Search } from 'lucide-react';

export interface QuizSearchItem {
  question: string;
  explanation: string;
  subject: string;
  disability?: string;
}

export interface TermSearchItem {
  term_ko: string;
  term_en: string;
  definition: string;
  subject: string;
}

export interface KiceSearchItem {
  number: number;
  year: number;
  session: string;
  context: string;
  keywords: string[];
  subjects: string[];
  type: string;
  points: number;
}

type FilterType = 'all' | 'term' | 'quiz' | 'kice';

const SUBJECT_LABELS: Record<string, string> = {
  laws: '법령',
  curriculum: '교육과정',
  introduction: '개론',
  assessment: '진단·평가',
  'behavior-support': '행동지원',
  'communication-disorder': '의사소통',
  'visual-impairment': '시각장애',
  'hearing-impairment': '청각장애',
  'physical-disability': '지체장애',
  'inclusive-education': '통합교육',
  transition: '전환교육',
};

function buildSearchIndex(
  subjects: Subject[],
  quizItems: QuizSearchItem[],
  termItems: TermSearchItem[],
  kiceItems: KiceSearchItem[],
): SearchItem[] {
  const items: SearchItem[] = [];

  const subjectTitleMap: Record<string, string> = {};
  for (const subject of subjects) {
    subjectTitleMap[subject.slug] = subject.title;
    items.push({
      title: subject.title,
      description: subject.description,
      keywords: [],
      path: `/subjects/${subject.slug}`,
      subject: subject.title,
      type: 'subject',
    });

    for (const chapter of subject.chapters) {
      items.push({
        title: chapter.title,
        description: chapter.description,
        keywords: chapter.keywords,
        path: `/subjects/${subject.slug}/${chapter.slug}`,
        subject: subject.title,
        type: 'chapter',
      });
    }
  }

  for (const quiz of quizItems) {
    items.push({
      title: quiz.question,
      description: quiz.explanation,
      keywords: quiz.disability ? [quiz.disability] : [],
      path: `/quiz/${quiz.subject}`,
      subject: subjectTitleMap[quiz.subject] || quiz.subject,
      type: 'quiz',
    });
  }

  for (const term of termItems) {
    items.push({
      title: term.term_ko,
      description: term.definition,
      keywords: term.term_en ? [term.term_en] : [],
      path: `/terms?q=${encodeURIComponent(term.term_ko)}`,
      subject: term.subject,
      type: 'term',
    });
  }

  for (const kice of kiceItems) {
    const subjectLabel = kice.subjects
      .map((s) => SUBJECT_LABELS[s] ?? s)
      .join(', ');
    items.push({
      title: `${kice.year} ${kice.session} ${kice.number}번 (${kice.points}점)`,
      description: kice.context,
      keywords: kice.keywords,
      path: `/kice?year=${kice.year}&session=${encodeURIComponent(kice.session)}#q-${kice.number}`,
      subject: subjectLabel || kice.session,
      type: 'kice',
    });
  }

  return items;
}

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'term', label: '용어' },
  { key: 'quiz', label: '퀴즈' },
  { key: 'kice', label: '기출' },
];

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  quiz: { label: '퀴즈', className: 'text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-700' },
  term: { label: '용어', className: 'text-violet-600 border-violet-300 dark:text-violet-400 dark:border-violet-700' },
  kice: { label: '기출', className: 'text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700' },
  subject: { label: '과목', className: '' },
  chapter: { label: '챕터', className: '' },
};

interface SearchClientProps {
  readonly subjects: ReadonlyArray<Subject>;
  readonly quizItems: ReadonlyArray<QuizSearchItem>;
  readonly termItems?: ReadonlyArray<TermSearchItem>;
  readonly kiceItems?: ReadonlyArray<KiceSearchItem>;
}

export default function SearchClient({
  subjects,
  quizItems,
  termItems = [],
  kiceItems = [],
}: SearchClientProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const searchIndex = useMemo(
    () =>
      buildSearchIndex(
        [...subjects],
        [...quizItems],
        [...termItems],
        [...kiceItems],
      ),
    [subjects, quizItems, termItems, kiceItems],
  );

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: ['title', 'description', 'keywords'],
        threshold: 0.4,
        includeScore: true,
      }),
    [searchIndex],
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const raw = fuse.search(query.trim()).map((r) => r.item);
    if (filter === 'all') return raw;
    return raw.filter((item) => item.type === filter);
  }, [query, fuse, filter]);

  const typeCounts = useMemo(() => {
    if (!query.trim()) return { all: 0, term: 0, quiz: 0, kice: 0 };
    const raw = fuse.search(query.trim()).map((r) => r.item);
    return {
      all: raw.length,
      term: raw.filter((i) => i.type === 'term').length,
      quiz: raw.filter((i) => i.type === 'quiz').length,
      kice: raw.filter((i) => i.type === 'kice').length,
    };
  }, [query, fuse]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Search className="h-5 w-5" />
        통합 검색
      </h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="용어, 퀴즈, 기출문제를 검색하세요..."
          className="pl-10 h-12 text-base"
          aria-label="통합 검색"
        />
      </div>

      {query.trim() && (
        <div className="flex gap-2 mb-4 overflow-x-auto" role="tablist">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={filter === tab.key}
              onClick={() => setFilter(tab.key)}
              className={
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ' +
                (filter === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground')
              }
            >
              {tab.label}
              {typeCounts[tab.key] > 0 && (
                <span className="ml-1 text-xs opacity-70">
                  {typeCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {query.trim() && (
        <div>
          {results.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="검색 결과가 없습니다"
              description={`"${query}"에 해당하는 결과를 찾을 수 없습니다.`}
            />
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-3">
                {results.length}개의 결과
              </p>
              <div className="space-y-2">
                {results.slice(0, 50).map((item, idx) => {
                  const badge = TYPE_BADGE[item.type];
                  return (
                    <Link
                      key={`${item.type}-${item.path}-${idx}`}
                      href={item.path}
                      className="block"
                    >
                      <Card className="transition-shadow duration-200 hover:shadow-md cursor-pointer">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium line-clamp-2">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="text-xs line-clamp-2">
                            {item.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-2 flex-wrap pt-0">
                          <Badge variant="secondary" className="text-xs">
                            {item.subject}
                          </Badge>
                          {badge && (
                            <Badge
                              variant="outline"
                              className={'text-xs ' + badge.className}
                            >
                              {badge.label}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              {results.length > 50 && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  상위 50개 결과를 표시합니다. 검색어를 더 구체적으로 입력해보세요.
                </p>
              )}
            </>
          )}
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">
            용어, 퀴즈, 기출문제를 한 곳에서 검색할 수 있습니다.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Badge variant="outline" className="text-xs text-violet-600 border-violet-300">
              용어 {termItems.length}개
            </Badge>
            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
              퀴즈 {quizItems.length}개
            </Badge>
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
              기출 {kiceItems.length}개
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
