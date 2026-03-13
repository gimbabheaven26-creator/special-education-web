'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import type { Subject, SearchItem } from '@/types/content';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

export interface QuizSearchItem {
  question: string;
  explanation: string;
  subject: string;
  disability?: string;
}

function buildSearchIndex(subjects: Subject[], quizItems: QuizSearchItem[]): SearchItem[] {
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

  return items;
}

interface SearchClientProps {
  readonly subjects: ReadonlyArray<Subject>;
  readonly quizItems: ReadonlyArray<QuizSearchItem>;
}

export default function SearchClient({ subjects, quizItems }: SearchClientProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const searchIndex = useMemo(() => buildSearchIndex([...subjects], [...quizItems]), [subjects, quizItems]);

  const fuse = useMemo(
    () =>
      new Fuse(searchIndex, {
        keys: ['title', 'description', 'keywords'],
        threshold: 0.4,
        includeScore: true,
      }),
    [searchIndex]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query.trim()).map((r) => r.item);
  }, [query, fuse]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
        <Search className="h-7 w-7" />
        검색
      </h1>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="과목, 챕터, 퀴즈 문제를 검색하세요..."
          className="pl-10 h-12 text-base"
        />
      </div>

      {query.trim() && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-16">
              <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-lg font-medium text-foreground mb-1">검색 결과가 없습니다</p>
              <p className="text-muted-foreground">&ldquo;{query}&rdquo;에 해당하는 결과를 찾을 수 없습니다.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {results.length}개의 결과
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((item, idx) => (
                  <Link key={`${item.type}-${item.path}-${idx}`} href={item.path} className="block">
                    <Card className="h-full transition-shadow duration-200 hover:shadow-md cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                        <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{item.subject}</Badge>
                        {item.type === 'quiz' && (
                          <Badge variant="outline" className="text-xs">퀴즈</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!query.trim() && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">검색어를 입력하면 과목, 챕터, 퀴즈 문제를 검색할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
