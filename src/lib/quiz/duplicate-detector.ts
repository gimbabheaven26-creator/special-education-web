const KOREAN_PARTICLES = /[은는이가을를에서의와과도로만]/g;

export function tokenize(text: string): Set<string> {
  if (!text) return new Set();
  const cleaned = text
    .replace(KOREAN_PARTICLES, ' ')
    .replace(/[.,?!()'"~\-:;]/g, ' ');
  const tokens = cleaned
    .split(/\s+/)
    .filter((t) => t.length > 0);
  return new Set(tokens);
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  const smaller = a.size <= b.size ? a : b;
  const larger = a.size <= b.size ? b : a;
  smaller.forEach((token) => {
    if (larger.has(token)) intersection++;
  });
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export interface DuplicatePair {
  idA: string;
  idB: string;
  similarity: number;
  questionA: string;
  questionB: string;
}

export function findDuplicates(
  questions: { id: string; question: string }[],
  threshold = 0.85,
): DuplicatePair[] {
  if (questions.length < 2) return [];

  const tokenSets = questions.map((q) => tokenize(q.question));
  const pairs: DuplicatePair[] = [];

  for (let i = 0; i < questions.length; i++) {
    for (let j = i + 1; j < questions.length; j++) {
      const sim = jaccardSimilarity(tokenSets[i], tokenSets[j]);
      if (sim >= threshold) {
        pairs.push({
          idA: questions[i].id,
          idB: questions[j].id,
          similarity: Math.round(sim * 100) / 100,
          questionA: questions[i].question,
          questionB: questions[j].question,
        });
      }
    }
  }

  return pairs.sort((a, b) => b.similarity - a.similarity);
}
