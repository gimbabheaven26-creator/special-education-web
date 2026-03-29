/**
 * Descriptive Answer Scoring Guide (Phase 1 — Keyword Matching)
 *
 * Evaluates user's free-text answer against model answer keywords.
 * Also checks legal citation accuracy (제N조, 시행령 제N조 patterns).
 */

// ─── Keyword extraction (inlined from deleted elaboration.ts) ───

const STOPWORDS = new Set([
  '이', '그', '저', '것', '수', '등', '때', '중', '및', '또는', '또한', '의', '에', '를', '을',
  '는', '은', '가', '이다', '하다', '있다', '되다', '않다', '없다', '같다', '위해', '대해',
  '통해', '따라', '경우', '대한', '위한', '관한', '한다', '된다', '있는', '하는', '해야',
  '할', '한', '들', '로', '으로', '에서', '까지', '부터', '보다', '처럼', '만큼',
  '정답', '오답', '맞다', '틀리다', '문제', '답', '정확', '올바른',
]);

const MIN_KEYWORD_LENGTH = 2;
const MAX_KEYWORDS = 5;

export function extractKeywords(explanation: string): string[] {
  const lawTokens: string[] = [];
  const withPlaceholders = explanation
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[()[\]{}「」『』\u201C\u201D\u2018\u2019]/g, ' ')
    .replace(/[.,;:!?~·…→←↑↓▶▷►]/g, ' ')
    .replace(/(제\s*\d+\s*(?:조|항|호))/g, (m) => {
      const normalized = m.replace(/\s/g, '');
      const idx = String.fromCharCode(0xE000 + lawTokens.length);
      lawTokens.push(normalized);
      return ` \x01LAW${idx}\x01 `;
    });

  const cleaned = withPlaceholders
    .replace(/\d+/g, ' ')
    .replace(/\x01LAW([\uE000-\uE0FF])\x01/g, (_, c: string) => lawTokens[c.charCodeAt(0) - 0xE000])
    .trim();

  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_KEYWORD_LENGTH && !STOPWORDS.has(t));

  const unique = Array.from(new Set(tokens));
  const sorted = unique.sort((a, b) => b.length - a.length);

  return sorted.slice(0, MAX_KEYWORDS);
}

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
