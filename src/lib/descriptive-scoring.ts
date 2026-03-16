/**
 * Descriptive Answer Scoring Guide (Phase 1 — Keyword Matching)
 *
 * Evaluates user's free-text answer against model answer keywords.
 * Also checks legal citation accuracy (제N조, 시행령 제N조 patterns).
 * Reuses extractKeywords from elaboration.ts.
 */

import { extractKeywords } from './elaboration';

export interface ScoringResult {
  readonly keywords: readonly string[];
  readonly matched: readonly string[];
  readonly missed: readonly string[];
  readonly coverage: number;
  readonly legalCitations: {
    readonly expected: readonly string[];
    readonly found: readonly string[];
    readonly missing: readonly string[];
  };
  readonly suggestion: string;
}

const LEGAL_PATTERN = /(?:시행령\s*)?제\d+조(?:의\d+)?(?:\s*제\d+항)?/g;

function extractLegalCitations(text: string): string[] {
  const matches = text.match(LEGAL_PATTERN);
  if (!matches) return [];
  const normalized = matches.map((m) => m.replace(/\s+/g, ''));
  return Array.from(new Set(normalized));
}

function normalize(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '');
}

/**
 * Score a user's descriptive answer against the model answer.
 */
export function scoreDescriptiveAnswer(
  userAnswer: string,
  modelAnswer: string,
): ScoringResult {
  // Extract keywords from model answer
  const keywords = extractKeywords(modelAnswer);

  if (keywords.length === 0) {
    return {
      keywords: [],
      matched: [],
      missed: [],
      coverage: 1,
      legalCitations: { expected: [], found: [], missing: [] },
      suggestion: '키워드 추출 불가 — 모범답안을 참고하세요.',
    };
  }

  // Match keywords
  const normalizedUser = normalize(userAnswer);
  const matched = keywords.filter((kw) => normalizedUser.includes(normalize(kw)));
  const missed = keywords.filter((kw) => !normalizedUser.includes(normalize(kw)));
  const coverage = matched.length / keywords.length;

  // Legal citation check
  const expectedCitations = extractLegalCitations(modelAnswer);
  const userCitations = extractLegalCitations(userAnswer);
  const foundCitations = expectedCitations.filter((c) =>
    userCitations.some((uc) => normalize(uc) === normalize(c)),
  );
  const missingCitations = expectedCitations.filter(
    (c) => !userCitations.some((uc) => normalize(uc) === normalize(c)),
  );

  // Generate suggestion
  const parts: string[] = [];
  parts.push(`핵심 키워드 ${keywords.length}개 중 ${matched.length}개 포함`);

  if (expectedCitations.length > 0) {
    if (missingCitations.length === 0) {
      parts.push('법령 인용 정확');
    } else {
      parts.push(`법령 인용 ${missingCitations.length}건 누락`);
    }
  }

  if (coverage >= 0.8) {
    parts.push('— 핵심을 잘 담았습니다!');
  } else if (coverage >= 0.5) {
    parts.push('— 빠진 키워드를 확인해보세요.');
  } else {
    parts.push('— 모범답안의 핵심 개념을 다시 정리해보세요.');
  }

  return {
    keywords,
    matched,
    missed,
    coverage,
    legalCitations: {
      expected: expectedCitations,
      found: foundCitations,
      missing: missingCitations,
    },
    suggestion: parts.join('. '),
  };
}
