'use client';

import { useState, useMemo, useRef } from 'react';
import { Search, BookOpen, ChevronDown, ChevronUp, List } from 'lucide-react';
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
  const [tocOpen, setTocOpen] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const isSearching = query.trim() !== '' || activeSubject !== null;

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

  const groupedBySubject = useMemo(() => {
    return subjects.map((s) => ({
      subject: s,
      terms: terms.filter((t) => t.subject === s),
    }));
  }, [terms, subjects]);

  const scrollToSection = (subject: string) => {
    setQuery('');
    setActiveSubject(null);
    setTocOpen(false);
    setTimeout(() => {
      sectionRefs.current[subject]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="space-y-1 mb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          용어사전
        </h1>
        <p className="text-sm text-muted-foreground">
          NISE 특수교육학 용어사전 · {terms.length}개 용어
        </p>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveSubject(null); }}
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

      {/* 모바일 목차 토글 */}
      <div className="md:hidden mb-3">
        <button
          onClick={() => setTocOpen((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-lg px-3 py-2 w-full hover:bg-muted transition-colors"
        >
          <List className="h-4 w-4" />
          목차
          {tocOpen ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
        </button>
        {tocOpen && (
          <div className="mt-2 grid grid-cols-2 gap-1 p-2 border border-border rounded-xl bg-card">
            {subjects.map((s) => (
              <button
                key={s}
                onClick={() => scrollToSection(s)}
                className="text-left text-xs px-2 py-1.5 rounded-lg hover:bg-muted transition-colors text-foreground truncate"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 메인 레이아웃 */}
      <div className="flex gap-6">
        {/* 좌측 목차 (데스크탑) */}
        <aside className="hidden md:block w-44 shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-2">목차</p>
            <nav className="space-y-0.5">
              <button
                onClick={() => { setQuery(''); setActiveSubject(null); }}
                className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ${
                  !isSearching
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                전체
              </button>
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => scrollToSection(s)}
                  className={`w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors truncate ${
                    activeSubject === s
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* 우측 내용 */}
        <main className="flex-1 min-w-0">
          {isSearching ? (
            /* 검색/필터 결과 */
            <>
              <p className="text-xs text-muted-foreground mb-3">{filtered.length}개 결과</p>
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
            </>
          ) : (
            /* 과목별 그룹화 */
            <div className="space-y-10">
              {groupedBySubject.map(({ subject, terms: subjectTerms }) => {
                if (subjectTerms.length === 0) return null;
                return (
                  <section
                    key={subject}
                    ref={(el) => { sectionRefs.current[subject] = el; }}
                  >
                    <div className="flex items-baseline gap-2 mb-3 pb-2 border-b border-border">
                      <h2 className="text-base font-bold text-foreground">{subject}</h2>
                      <span className="text-xs text-muted-foreground">{subjectTerms.length}개</span>
                    </div>
                    <div className="space-y-2">
                      {subjectTerms.map((term, i) => (
                        <TermCard key={`${term.subject}-${term.term_ko}-${i}`} term={term} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
