/**
 * 기입형 답안 채점 유틸리티
 * - '또는'으로 구분된 복수 정답 지원
 * - 괄호 안 약어 (DRO, PBS 등) 별도 매칭
 * - 공백/대소문자 무시
 */

function normalize(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase().trim();
}

export function checkFillInAnswer(userAnswer: string, correctAnswer: string): boolean {
  const userNorm = normalize(userAnswer);
  if (!userNorm) return false;

  // '또는'으로 복수 정답 분리
  const variants = correctAnswer.split('또는').map((v) => v.trim());

  for (const variant of variants) {
    const varNorm = normalize(variant);

    // 정규화된 완전 일치
    if (varNorm === userNorm) return true;

    // 괄호 안 내용을 별도 정답으로 취급: "타행동 차별강화(DRO)" → "DRO"도 정답
    const parenMatches = variant.match(/\(([^)]+)\)/g);
    if (parenMatches) {
      for (const match of parenMatches) {
        const inner = normalize(match.slice(1, -1));
        if (inner === userNorm) return true;
      }
      // 괄호 제거한 본문도 정답: "타행동 차별강화(DRO)" → "타행동차별강화"
      const withoutParen = normalize(variant.replace(/\([^)]*\)/g, ''));
      if (withoutParen && withoutParen === userNorm) return true;
    }
  }

  return false;
}
