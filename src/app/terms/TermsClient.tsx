'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, BookOpen, ChevronDown, ChevronUp, List, ArrowUp, BarChart2 } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Term } from './page';

interface TermsClientProps {
  terms: Term[];
  subjects: string[];
}

function TermCard({ term, initialOpen = false }: { term: Term; initialOpen?: boolean }) {
  const [open, setOpen] = useState(initialOpen);

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

const PREVIEW_COUNT = 3;

function SubjectSection({
  subject,
  terms: subjectTerms,
  sectionRef,
}: {
  subject: string;
  terms: Term[];
  sectionRef: (el: HTMLElement | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const visibleTerms = open && !showAll ? subjectTerms.slice(0, PREVIEW_COUNT) : subjectTerms;
  const hasMore = subjectTerms.length > PREVIEW_COUNT;

  return (
    <section ref={sectionRef}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open) setShowAll(false); }}
        className="w-full flex items-center gap-2 mb-3 pb-2 border-b border-border hover:text-primary transition-colors group"
      >
        <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {subject}
        </h2>
        <span className="text-xs text-muted-foreground">{subjectTerms.length}개</span>
        <span className="ml-auto text-muted-foreground">
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="space-y-2">
          {visibleTerms.map((term, i) => (
            <TermCard key={`${term.subject}-${term.term_ko}-${i}`} term={term} />
          ))}
          {hasMore && !showAll && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full py-2 text-sm text-primary hover:underline"
            >
              나머지 {subjectTerms.length - PREVIEW_COUNT}개 더보기
            </button>
          )}
        </div>
      )}
    </section>
  );
}

export default function TermsClient({ terms, subjects }: TermsClientProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const urlSubject = searchParams.get('subject');
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const isSearching = query.trim() !== '' || activeSubject !== null;

  // 상단 버튼 표시 + 활성 섹션 감지
  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 400);

      // 현재 화면에 보이는 섹션 감지
      const entries = Object.entries(sectionRefs.current);
      let current: string | null = null;
      for (const [subject, el] of entries) {
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) current = subject;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToSection = useCallback((subject: string) => {
    setQuery('');
    setActiveSubject(null);
    setTocOpen(false);
    setTimeout(() => {
      sectionRefs.current[subject]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

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
        <aside className="hidden md:block w-48 shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
            <div className="flex items-center justify-between mb-2 px-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">목차</p>
              <Link
                href="/kice/analytics"
                className="flex items-center gap-1 text-[10px] text-primary/70 hover:text-primary transition-colors"
                title="기출 출제 빈도 보기"
              >
                <BarChart2 className="h-3 w-3" />
                빈도
              </Link>
            </div>
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
                <div key={s} className="flex items-center gap-1 group">
                  <button
                    onClick={() => scrollToSection(s)}
                    className={`flex-1 text-left text-xs px-2 py-1.5 rounded-lg transition-colors truncate ${
                      activeSection === s && !isSearching
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {s}
                  </button>
                  <Link
                    href="/kice/analytics"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-primary rounded"
                    title={`${s} 기출 출제 빈도`}
                  >
                    <BarChart2 className="h-3 w-3" />
                  </Link>
                </div>
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
                <EmptyState
                  icon="🔍"
                  title="검색 결과가 없습니다"
                  description="다른 키워드로 검색해보세요."
                />
              ) : (
                <div className="space-y-2">
                  {filtered.slice(0, 200).map((term, i) => (
                    <TermCard
                      key={`${term.subject}-${term.term_ko}-${i}`}
                      term={term}
                      initialOpen={
                        urlSubject
                          ? term.subject === urlSubject
                          : filtered.length === 1
                      }
                    />
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
                  <SubjectSection
                    key={subject}
                    subject={subject}
                    terms={subjectTerms}
                    sectionRef={(el) => { sectionRefs.current[subject] = el; }}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* 상단으로 버튼 */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed right-4 bottom-24 md:bottom-8 z-40 w-10 h-10 rounded-full bg-background border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all print:hidden"
          title="맨 위로"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
