/**
 * Elaborative Interrogation Engine
 *
 * After a correct answer, asks "왜 이것이 맞는지 한 줄로 설명해보세요"
 * then evaluates the response by keyword matching against the explanation.
 */

// ─── Stopwords to exclude from keyword extraction ───

const STOPWORDS = new Set([
  '이', '그', '저', '것', '수', '등', '때', '중', '및', '또는', '또한', '의', '에', '를', '을',
  '는', '은', '가', '이다', '하다', '있다', '되다', '않다', '없다', '같다', '위해', '대해',
  '통해', '따라', '경우', '대한', '위한', '관한', '한다', '된다', '있는', '하는', '해야',
  '할', '한', '들', '로', '으로', '에서', '까지', '부터', '보다', '처럼', '만큼',
  '정답', '오답', '맞다', '틀리다', '문제', '답', '정확', '올바른',
]);

const MIN_KEYWORD_LENGTH = 2;
const MAX_KEYWORDS = 5;

/**
 * Extract meaningful keywords from explanation text.
 * Returns up to MAX_KEYWORDS unique keywords, prioritizing longer/rarer terms.
 */
export function extractKeywords(explanation: string): string[] {
  // Remove markdown, parentheses content, special chars
  // 법령 키워드(제N조/항/호)를 플레이스홀더로 보호 후 독립 숫자만 제거
  const lawTokens: string[] = [];
  const withPlaceholders = explanation
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/[()[\]{}「」『』""'']/g, ' ')
    .replace(/[.,;:!?~·…→←↑↓▶▷►]/g, ' ')
    .replace(/(제\s*\d+\s*(?:조|항|호))/g, (m) => {
      const normalized = m.replace(/\s/g, '');
      const idx = String.fromCharCode(0xE000 + lawTokens.length); // PUA 문자로 인덱스 인코딩
      lawTokens.push(normalized);
      return ` \x01LAW${idx}\x01 `; // 공백으로 감싸서 붙는 조사 분리
    });

  const cleaned = withPlaceholders
    .replace(/\d+/g, ' ')
    .replace(/\x01LAW([\uE000-\uE0FF])\x01/g, (_, c) => lawTokens[c.charCodeAt(0) - 0xE000])
    .trim();

  // Split into tokens
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_KEYWORD_LENGTH && !STOPWORDS.has(t));

  // Deduplicate, prioritize longer tokens (more specific)
  const unique = Array.from(new Set(tokens));
  const sorted = unique.sort((a, b) => b.length - a.length);

  return sorted.slice(0, MAX_KEYWORDS);
}

/**
 * Evaluate a user's elaboration response against extracted keywords.
 * Returns a score object with matched keywords and coverage ratio.
 */
export interface ElaborationResult {
  readonly keywords: readonly string[];
  readonly matched: readonly string[];
  readonly score: number; // 0.0 ~ 1.0
  readonly level: 'excellent' | 'good' | 'partial' | 'insufficient';
  readonly feedback: string;
}

export function evaluateElaboration(
  userResponse: string,
  explanation: string,
): ElaborationResult {
  const keywords = extractKeywords(explanation);
  if (keywords.length === 0) {
    return {
      keywords: [],
      matched: [],
      score: 1,
      level: 'excellent',
      feedback: '해설 키워드가 없어 자동 통과합니다.',
    };
  }

  const normalizedResponse = userResponse.toLowerCase().replace(/\s+/g, '');
  const matched = keywords.filter((kw) =>
    normalizedResponse.includes(kw.toLowerCase().replace(/\s+/g, '')),
  );

  const score = matched.length / keywords.length;

  let level: ElaborationResult['level'];
  let feedback: string;

  if (score >= 0.8) {
    level = 'excellent';
    feedback = '핵심 개념을 정확히 이해하고 있어요!';
  } else if (score >= 0.6) {
    level = 'good';
    feedback = '잘 설명했어요. 조금 더 구체적으로 정리해보면 좋겠어요.';
  } else if (score >= 0.3) {
    level = 'partial';
    feedback = '일부 개념은 맞지만, 빠진 핵심이 있어요. 해설을 다시 확인해보세요.';
  } else {
    level = 'insufficient';
    feedback = '핵심 개념이 부족해요. 해설을 꼼꼼히 읽고 다시 정리해보세요.';
  }

  return { keywords, matched, score, level, feedback };
}

/**
 * Determine whether to trigger an elaboration question.
 * Triggers ~20% of correct answers, weighted toward harder questions.
 */
export function shouldTriggerElaboration(
  isCorrect: boolean,
  difficulty: number,
): boolean {
  if (!isCorrect) return false;

  // Higher chance for harder questions
  let probability = 0.15;
  if (difficulty >= 2) probability += 0.05;
  if (difficulty >= 3) probability += 0.05;

  return Math.random() < probability;
}
