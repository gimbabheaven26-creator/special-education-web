import { readFileSync } from 'fs';
import { join } from 'path';

export interface TermEntry {
  term_ko: string;
  term_hanja: string;
  term_en: string;
  definition: string;
  subject: string;
}

export const TERM_SUBJECTS: ReadonlyArray<{ key: string; label: string }> = [
  { key: 'introduction', label: '특수교육 개론' },
  { key: 'physical-disability', label: '지체·중복장애' },
  { key: 'visual-impairment', label: '시각장애' },
  { key: 'hearing-impairment', label: '청각장애' },
  { key: 'communication-disorder', label: '의사소통장애' },
  { key: 'behavior-support', label: '행동지원' },
  { key: 'curriculum', label: '교육과정' },
  { key: 'assessment', label: '진단평가' },
  { key: 'inclusive-education', label: '통합교육' },
  { key: 'laws', label: '특수교육 법령' },
  { key: 'transition', label: '전환교육' },
];

/** 스크래핑 아티팩트 제거 */
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

/** NISE 용어사전 전체 로드 (서버 전용 — fs 사용) */
export function loadTerms(): TermEntry[] {
  const base = join(process.cwd(), 'data', 'terminology', 'by-subject');
  const all: TermEntry[] = [];
  for (const { key, label } of TERM_SUBJECTS) {
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
      // 파일 읽기 실패 시 건너뜀
    }
  }
  return all;
}
