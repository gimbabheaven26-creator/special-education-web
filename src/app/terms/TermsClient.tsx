'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  List,
  ArrowUp,
  BarChart2,
  Plus,
  Check,
  Layers,
} from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import type { Term } from './page';

const SUBJECT_LABEL_TO_SLUG: Record<string, string> = {
  '특수교육 개론': 'introduction',
  '지체·중복장애': 'physical-disability',
  '시각장애': 'visual-impairment',
  '청각장애': 'hearing-impairment',
  '의사소통장애': 'communication-disorder',
  '행동지원': 'behavior-support',
  '교육과정': 'curriculum',
  '진단평가': 'assessment',
  '통합교육': 'inclusive-education',
  '특수교육 법령': 'laws',
  '전환교육': 'transition',
};

interface TermsClientProps {
  terms: Term[];
  subjects: string[];
}

type ViewMode = 'list' | 'flashcard';

function termCardId(termKo: string): string {
  return 'term-' + termKo;
}

function TermCard({
  term,
  initialOpen = false,
}: {
  term: Term;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const cardId = termCardId(term.term_ko);
  const exists = useLeitnerStore((s) => s.cards.some((c) => c.id === cardId));
  const [justAdded, setJustAdded] = useState(false);

  const handleAddFlashcard = () => {
    if (exists) return;
    const slug = SUBJECT_LABEL_TO_SLUG[term.subject] ?? 'introduction';
    useLeitnerStore.getState().addCard({
      id: cardId,
      subjectSlug: slug,
      question: term.term_ko + (term.term_en ? ` (${term.term_en})` : ''),
      answer: term.definition,
      source: 'term',
    });
    setJustAdded(true);
  };

  return (
    <div
      data-testid="term-card"
      className="border border-border rounded-xl overflow-hidden bg-card hover:border-primary/30 transition-colors"
    >
      <button
        className="w-full text-left px-4 py-3 flex items-start justify-between gap-3 min-h-[56px]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          <span className="font-semibold text-foreground text-sm">
            {term.term_ko}
          </span>
          {term.term_hanja && (
            <span className="ml-2 text-xs text-muted-foreground">
              {term.term_hanja}
            </span>
          )}
          {term.term_en && (
            <span className="ml-2 text-xs text-primary/70 italic">
              {term.term_en}
            </span>
          )}
          {!open && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {term.definition}
            </p>
          )}
        </div>
        <span className="mt-0.5 text-muted-foreground shrink-0">
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-border/50 bg-muted/20">
          <p className="text-sm text-foreground/80 leading-relaxed pt-3 whitespace-pre-line">
            {term.definition}
          </p>
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {term.subject}
            </span>
            <button
              onClick={handleAddFlashcard}
              disabled={exists}
              className={
                'ml-auto flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-colors ' +
                (exists || justAdded
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50')
              }
              aria-label={
                exists ? '이미 플래시카드에 추가됨' : '플래시카드에 추가'
              }
            >
              {exists || justAdded ? (
                <>
                  <Check className="h-3 w-3" /> 추가됨
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3" /> 플래시카드
                </>
              )}
            </button>
            {(exists || justAdded) && (
              <Link
                href="/flashcards/review"
                className="inline-flex min-h-[28px] items-center rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary"
              >
                복습하러 가기
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FlashcardStudyMode({ terms }: { terms: Term[] }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const safeIdx = Math.min(idx, Math.max(terms.length - 1, 0));
  const term = terms[safeIdx];
  const cardId = term ? termCardId(term.term_ko) : '';
  const exists = useLeitnerStore((s) =>
    cardId ? s.cards.some((c) => c.id === cardId) : false,
  );

  const goPrev = useCallback(() => {
    setIdx((i) => Math.max(0, i - 1));
    setFlipped(false);
    setJustAdded(false);
  }, []);

  const goNext = useCallback(() => {
    setIdx((i) => Math.min(terms.length - 1, i + 1));
    setFlipped(false);
    setJustAdded(false);
  }, [terms.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
      else if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goPrev, goNext]);

  if (!term) return null;

  const handleAdd = () => {
    if (exists) return;
    const slug = SUBJECT_LABEL_TO_SLUG[term.subject] ?? 'introduction';
    useLeitnerStore.getState().addCard({
      id: cardId,
      subjectSlug: slug,
      question: term.term_ko + (term.term_en ? ` (${term.term_en})` : ''),
      answer: term.definition,
      source: 'term',
    });
    setJustAdded(true);
  };

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <p className="text-sm text-muted-foreground tabular-nums">
        {idx + 1} / {terms.length}
      </p>

      <div className="w-full h-1 bg-muted rounded-full overflow-hidden max-w-md">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: ((idx + 1) / terms.length) * 100 + '%' }}
        />
      </div>

      <button
        onClick={() => setFlipped((f) => !f)}
        className={
          'w-full max-w-md min-h-[220px] rounded-2xl border-2 p-6 text-center transition-all ' +
          (flipped
            ? 'border-primary/40 bg-primary/5'
            : 'border-border bg-card hover:border-primary/30')
        }
        aria-label={flipped ? '정의 보기 — 탭하여 용어로 돌아가기' : '용어 카드 — 탭하여 정의 보기'}
      >
        {!flipped ? (
          <div className="flex flex-col items-center justify-center min-h-[180px] gap-2">
            <p className="text-2xl font-bold text-foreground">
              {term.term_ko}
            </p>
            {term.term_hanja && (
              <p className="text-sm text-muted-foreground">
                {term.term_hanja}
              </p>
            )}
            {term.term_en && (
              <p className="text-sm text-primary/70 italic">{term.term_en}</p>
            )}
            <p className="text-[10px] text-muted-foreground mt-4">
              탭하여 정의 보기
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[180px] gap-3">
            <p className="text-sm leading-relaxed text-foreground/80 text-left whitespace-pre-line">
              {term.definition}
            </p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium mt-1">
              {term.subject}
            </span>
          </div>
        )}
      </button>

      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={idx === 0}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="이전 용어"
        >
          <ChevronLeft className="h-4 w-4" />
          이전
        </button>
        <button
          onClick={handleAdd}
          disabled={exists}
          className={
            'flex items-center gap-1 text-xs px-3 py-2 rounded-lg transition-colors ' +
            (exists || justAdded
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-400')
          }
          aria-label={
            exists ? '이미 플래시카드에 추가됨' : '플래시카드에 추가'
          }
        >
          {exists || justAdded ? (
            <>
              <Check className="h-3 w-3" /> 추가됨
            </>
          ) : (
            <>
              <Plus className="h-3 w-3" /> 저장
            </>
          )}
        </button>
        {(exists || justAdded) && (
          <Link
            href="/flashcards/review"
            className="flex min-h-[36px] items-center rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-primary/40 hover:text-primary"
          >
            복습하러 가기
          </Link>
        )}
        <button
          onClick={goNext}
          disabled={idx === terms.length - 1}
          className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="다음 용어"
        >
          다음
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        ← → 키로 이동 · Space/Enter로 뒤집기
      </p>
    </div>
  );
}

const PAGE_SIZE = 20;

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="이전 페이지"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm text-muted-foreground tabular-nums px-2">
        {page + 1} / {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        className="p-2 rounded-lg border border-border hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="다음 페이지"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
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
  const visibleTerms =
    open && !showAll ? subjectTerms.slice(0, PREVIEW_COUNT) : subjectTerms;
  const hasMore = subjectTerms.length > PREVIEW_COUNT;

  return (
    <section ref={sectionRef}>
      <button
        onClick={() => {
          setOpen((v) => !v);
          if (!open) setShowAll(false);
        }}
        className="w-full flex items-center gap-2 mb-3 pb-2 border-b border-border hover:text-primary transition-colors group"
      >
        <h2 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
          {subject}
        </h2>
        <span className="text-xs text-muted-foreground">
          {subjectTerms.length}개
        </span>
        <span className="ml-auto text-muted-foreground">
          {open ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </span>
      </button>
      {open && (
        <div data-testid="subject-terms" className="space-y-2">
          {visibleTerms.map((term, i) => (
            <TermCard
              key={term.subject + '-' + term.term_ko + '-' + i}
              term={term}
            />
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
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [tocOpen, setTocOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const isSearching = query.trim() !== '' || activeSubject !== null;

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 400);
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

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageTerms = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    setPage(0);
  }, [query, activeSubject]);

  const groupedBySubject = useMemo(() => {
    return subjects.map((s) => ({
      subject: s,
      terms: terms.filter((t) => t.subject === s),
    }));
  }, [terms, subjects]);

  const scrollToSection = useCallback(
    (subject: string) => {
      setQuery('');
      setActiveSubject(null);
      setViewMode('list');
      setTocOpen(false);
      setTimeout(() => {
        sectionRefs.current[subject]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 50);
    },
    [],
  );

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleSubjectChip = (subject: string) => {
    if (activeSubject === subject) {
      setActiveSubject(null);
    } else {
      setActiveSubject(subject);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="space-y-1 mb-4">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          용어사전
        </h1>
        <p className="text-sm text-muted-foreground">
          NISE 특수교육학 용어사전 · {terms.length}개 용어
        </p>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveSubject(null);
            }}
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
        <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={
              'flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ' +
              (viewMode === 'list'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:text-foreground')
            }
            aria-label="목록 보기"
          >
            <List className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">목록</span>
          </button>
          <button
            onClick={() => setViewMode('flashcard')}
            className={
              'flex items-center gap-1 px-3 py-2 text-xs font-medium transition-colors ' +
              (viewMode === 'flashcard'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background text-muted-foreground hover:text-foreground')
            }
            aria-label="플래시카드 모드"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">플래시카드</span>
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        <button
          onClick={() => setActiveSubject(null)}
          className={
            'shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ' +
            (!activeSubject
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30')
          }
        >
          전체
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            onClick={() => handleSubjectChip(s)}
            className={
              'shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ' +
              (activeSubject === s
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30')
            }
          >
            {s}
          </button>
        ))}
      </div>

      {viewMode === 'flashcard' ? (
        filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="검색 결과가 없습니다"
            description="다른 키워드로 검색해보세요."
          />
        ) : (
          <FlashcardStudyMode terms={filtered} />
        )
      ) : (
        <div className="flex gap-6">
          <aside className="hidden md:block w-48 shrink-0">
            <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-1">
              <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  목차
                </p>
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
                  onClick={() => {
                    setQuery('');
                    setActiveSubject(null);
                  }}
                  className={
                    'w-full text-left text-xs px-2 py-1.5 rounded-lg transition-colors ' +
                    (!isSearching
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted')
                  }
                >
                  전체
                </button>
                {subjects.map((s) => (
                  <div key={s} className="flex items-center gap-1 group">
                    <button
                      onClick={() => scrollToSection(s)}
                      className={
                        'flex-1 text-left text-xs px-2 py-1.5 rounded-lg transition-colors truncate ' +
                        (activeSection === s && !isSearching
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted')
                      }
                    >
                      {s}
                    </button>
                    <Link
                      href="/kice/analytics"
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-primary rounded"
                      title={s + ' 기출 출제 빈도'}
                    >
                      <BarChart2 className="h-3 w-3" />
                    </Link>
                  </div>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="md:hidden mb-3">
              <button
                onClick={() => setTocOpen((v) => !v)}
                className="flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-lg px-3 py-2 w-full hover:bg-muted transition-colors"
              >
                <List className="h-4 w-4" />
                목차
                {tocOpen ? (
                  <ChevronUp className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </button>
              {tocOpen && (
                <div
                  data-testid="mobile-toc-grid"
                  className="mt-2 grid grid-cols-2 gap-1 p-2 border border-border rounded-xl bg-card"
                >
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

            {isSearching ? (
              <>
                <p className="text-xs text-muted-foreground mb-3">
                  {filtered.length}개 결과
                </p>
                {filtered.length === 0 ? (
                  <EmptyState
                    icon="🔍"
                    title="검색 결과가 없습니다"
                    description="다른 키워드로 검색해보세요."
                  />
                ) : (
                  <>
                    <div data-testid="search-results" className="space-y-2">
                      {pageTerms.map((term, i) => (
                        <TermCard
                          key={term.subject + '-' + term.term_ko + '-' + i}
                          term={term}
                          initialOpen={
                            urlSubject
                              ? term.subject === urlSubject
                              : filtered.length === 1
                          }
                        />
                      ))}
                    </div>
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  </>
                )}
              </>
            ) : (
              <div className="space-y-10">
                {groupedBySubject.map(({ subject, terms: subjectTerms }) => {
                  if (subjectTerms.length === 0) return null;
                  return (
                    <SubjectSection
                      key={subject}
                      subject={subject}
                      terms={subjectTerms}
                      sectionRef={(el) => {
                        sectionRefs.current[subject] = el;
                      }}
                    />
                  );
                })}
              </div>
            )}
          </main>
        </div>
      )}

      {showTop && viewMode === 'list' && (
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
