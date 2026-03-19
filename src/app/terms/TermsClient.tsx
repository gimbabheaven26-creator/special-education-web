'use client';

import { useState, useMemo } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import type { Term } from './page';

interface TermsClientProps {
  terms: Term[];
  subjects: string[];
}

function TermCard({ term }: { term: Term }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-colors">
      <button
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 min-h-[56px]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-foreground text-sm">{term.term_ko}</span>
          {term.term_hanja && (
            <span className="ml-2 text-xs text-muted-foreground">{term.term_hanja}</span>
          )}
          {term.term_en && (
            <span className="ml-2 text-xs text-primary/70 italic">{term.term_en}</span>
          )}
          {!open && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {term.definition}
            </p>
          )}
        </div>
        <span className="mt-0.5 text-muted-foreground shrink-0">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border/50 bg-muted/20">
          <p className="text-sm text-foreground/80 leading-relaxed pt-3 whitespace-pre-line">
            {term.definition}
          </p>
          <span className="inline-block mt-2 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            {term.subject}
          </span>
        </div>
      )}
    </div>
  );
}

export default function TermsClient({ terms, subjects }: TermsClientProps) {
  const [query, setQuery] = useState('');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = terms;
    if (activeSubject) {
      result = result.filter((t) => t.subject === activeSubject);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.term_ko.toLowerCase().includes(q) ||
          t.term_en.toLowerCase().includes(q) ||
          t.term_hanja.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q),
      );
    }
    return result;
  }, [terms, query, activeSubject]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* 헤더 */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          용어사전
        </h1>
        <p className="text-sm text-muted-foreground">
          NISE 특수교육학 용어사전 · {terms.length}개 용어
        </p>
      </div>

      {/* 검색 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="한국어, 영어, 한자로 검색..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* 과목 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveSubject(null)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeSubject === null
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-background text-muted-foreground border-border hover:border-primary/50'
          }`}
        >
          전체
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSubject(activeSubject === s ? null : s)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeSubject === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-muted-foreground border-border hover:border-primary/50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* 결과 카운트 */}
      <p className="text-xs text-muted-foreground">
        {activeSubject || query
          ? `${filtered.length}개 결과`
          : `총 ${terms.length}개 용어`}
      </p>

      {/* 용어 목록 */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="text-sm">검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.slice(0, 200).map((term, i) => (
            <TermCard key={`${term.subject}-${term.term_ko}-${i}`} term={term} />
          ))}
          {filtered.length > 200 && (
            <p className="text-center text-xs text-muted-foreground py-4">
              {filtered.length - 200}개 더 있습니다. 검색어를 좁혀보세요.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
