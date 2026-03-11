'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Fuse from 'fuse.js';
import type { Subject, SearchItem } from '@/types/content';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

function buildSearchIndex(subjects: Subject[]): SearchItem[] {
  const items: SearchItem[] = [];

  for (const subject of subjects) {
    items.push({
      title: subject.title,
      description: subject.description,
      keywords: [],
      path: `/subjects/${subject.slug}`,
      subject: subject.title,
    });

    for (const chapter of subject.chapters) {
      items.push({
        title: chapter.title,
        description: chapter.description,
        keywords: chapter.keywords,
        path: `/subjects/${subject.slug}/${chapter.slug}`,
        subject: subject.title,
      });
    }
  }

  return items;
}

export default function SearchClient({ subjects }: { subjects: Subject[] }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const searchIndex = useMemo(() => buildSearchIndex(subjects), [subjects]);

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
          placeholder="과목이나 챕터를 검색하세요..."
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
                {results.map((item) => (
                  <Link key={item.path} href={item.path} className="block">
                    <Card className="h-full transition-shadow duration-200 hover:shadow-md cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary">{item.subject}</Badge>
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
          <p className="text-muted-foreground">검색어를 입력하면 과목과 챕터를 검색할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
