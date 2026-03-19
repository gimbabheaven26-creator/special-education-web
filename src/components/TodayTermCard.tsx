import { readFileSync } from 'fs';
import { join } from 'path';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface Term {
  term_ko: string;
  term_hanja: string;
  term_en: string;
  definition: string;
  subject: string;
}

const SUBJECTS = [
  { key: 'introduction', label: '특수교육 개론' },
  { key: 'physical-disability', label: '지체·중복장애' },
  { key: 'visual-impairment', label: '시각장애' },
  { key: 'hearing-impairment', label: '청각장애' },
  { key: 'communication-disorder', label: '의사소통장애' },
  { key: 'behavior-support', label: '행동지원' },
  { key: 'curriculum', label: '교육과정' },
  { key: 'assessment', label: '특수교육 평가' },
  { key: 'inclusive-education', label: '통합교육' },
  { key: 'laws', label: '특수교육 법령' },
  { key: 'transition', label: '전환교육' },
];

function cleanDefinition(def: string): string {
  const cutPatterns = [
    ' 은 특수교육학 용어를',
    '은 특수교육학 용어를',
    '자세히보기 저자',
    '수정에 필요한 정보를',
  ];
  let cleaned = def;
  for (const p of cutPatterns) {
    const idx = cleaned.indexOf(p);
    if (idx !== -1) cleaned = cleaned.slice(0, idx);
  }
  return cleaned.trim();
}

function loadTerms(): Term[] {
  const base = join(process.cwd(), 'data', 'terminology', 'by-subject');
  const all: Term[] = [];
  for (const { key, label } of SUBJECTS) {
    try {
      const raw = readFileSync(join(base, `${key}.json`), 'utf-8');
      const data = JSON.parse(raw) as { terms: Array<{ term_ko: string; term_hanja: string; term_en: string; definition: string }> };
      for (const t of data.terms) {
        const definition = cleanDefinition(t.definition ?? '');
        if (!definition || definition.length < 10) continue;
        all.push({
          term_ko: t.term_ko ?? '',
          term_hanja: t.term_hanja ?? '',
          term_en: t.term_en ?? '',
          definition,
          subject: label,
        });
      }
    } catch {
      // ignore
    }
  }
  return all;
}

function dateSeed(): number {
  const d = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
  return d.split('-').reduce((acc, p) => acc * 100 + Number(p), 0);
}

export function TodayTermCard() {
  const terms = loadTerms();
  if (terms.length === 0) return null;

  const seed = dateSeed();
  const term = terms[seed % terms.length];

  return (
    <Link
      href="/terms"
      className="block p-4 rounded-xl border border-border bg-card hover:border-primary/30 hover:bg-muted/30 transition-colors"
    >
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="h-4 w-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wide">오늘의 단어</span>
        <span className="text-[10px] text-muted-foreground ml-auto">{term.subject}</span>
      </div>
      <p className="font-semibold text-foreground text-sm">
        {term.term_ko}
        {term.term_hanja && (
          <span className="ml-2 text-xs text-muted-foreground font-normal">{term.term_hanja}</span>
        )}
      </p>
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
        {term.definition}
      </p>
    </Link>
  );
}
