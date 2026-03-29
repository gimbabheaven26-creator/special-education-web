/**
 * 빈칸 채점 로직 — 키워드 기반 full inclusion 매칭
 *
 * 비유: 열쇠 뭉치를 생각하면 됩니다. 정답이 3개의 열쇠(키워드)로 구성되어 있으면,
 * 사용자 답변에 3개 열쇠가 모두 들어 있어야 문이 열립니다(정답). 순서는 상관없습니다.
 */

/** 정규화: 공백 제거, 구두점 제거, 소문자 변환 */
export function normalizeAnswer(str: string): string {
  return str
    .replace(/\s+/g, '')
    .replace(/[.,;:!?。，；：！？]/g, '')
    .toLowerCase()
    .trim()
}

/**
 * 정답 문자열을 의미 있는 키워드 토큰으로 분리
 * - 괄호 내용은 대안 표기(선택적)이므로 제외
 * - 괄호 밖의 본문만 공백 기준으로 분리
 * - 각 토큰은 정규화됨
 */
export function extractKeywords(expected: string): string[] {
  // 괄호 내용 제거 (대안 표기이므로 필수 키워드가 아님)
  const withoutParens = expected.replace(/\([^)]*\)/g, ' ')
  return withoutParens
    .split(/\s+/)
    .map((t) => normalizeAnswer(t))
    .filter((t) => t.length > 0)
}

/**
 * 단일 정답 후보에 대해 키워드 기반 매칭 수행
 * - 키워드가 1개: 사용자 답변에 해당 키워드가 포함되면 정답
 * - 키워드가 2개 이상: 모든 키워드가 사용자 답변에 포함되어야 정답
 * - 순서 무관, 공백/조사 무시
 */
function matchSingleExpected(expected: string, normalizedUser: string): boolean {
  const normExpected = normalizeAnswer(expected)

  // 정규화 후 정확 일치
  if (normExpected === normalizedUser) return true

  const keywords = extractKeywords(expected)

  if (keywords.length === 0) return false

  // 모든 키워드가 사용자 답변에 포함되어야 정답
  return keywords.every((kw) => normalizedUser.includes(kw))
}

/**
 * 빈칸 채점: 정답(expected)과 사용자 답변(userAnswer)을 비교
 *
 * - 쉼표로 구분된 복수 정답 지원: 하나라도 매칭되면 정답
 * - 키워드 기반 매칭: 정답의 모든 키워드가 사용자 답변에 포함되어야 정답
 * - 순서 무관, 공백/조사 무시
 */
export function checkBlank(expected: string, userAnswer: string): boolean {
  if (!userAnswer.trim()) return false

  const normalizedUser = normalizeAnswer(userAnswer)

  // 쉼표로 구분된 복수 정답 처리
  const candidates = expected.split(',').map((s) => s.trim()).filter((s) => s.length > 0)

  return candidates.some((candidate) => matchSingleExpected(candidate, normalizedUser))
}
