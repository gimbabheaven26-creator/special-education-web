const VALID_SUBJECTS = new Set([
  'introduction', 'behavior-support', 'visual-impairment', 'hearing-impairment',
  'communication-disorder', 'physical-disability', 'curriculum', 'transition',
  'inclusive-education', 'assessment', 'laws',
]);

const VALID_QUIZ_TYPES = new Set([
  'multiple', 'ox', 'fill_in', 'descriptive', 'scenario_composite',
]);

const VALID_OX_ANSWERS = new Set(['O', 'X']);

export interface QualityResult {
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export interface BatchQualityResult {
  total: number;
  valid: number;
  invalid: number;
  errorCount: number;
  warningCount: number;
  details: Array<{ id: string; errors: string[]; warnings: string[]; isValid: boolean }>;
}

interface QuizInput {
  id?: string;
  subject?: string;
  chapter?: string;
  type?: string;
  question?: string;
  answer?: unknown;
  explanation?: string;
  difficulty?: number;
  options?: string[] | null;
  case_context?: string | null;
  sub_questions?: unknown[] | null;
}

export function validateQuizQuality(q: QuizInput): QualityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!q.subject) errors.push('subject 누락');
  if (!q.chapter) errors.push('chapter 누락');
  if (!q.type) errors.push('type 누락');
  if (!q.question) errors.push('question 누락');
  if (q.answer === undefined || q.answer === null || q.answer === '') errors.push('answer 누락');
  if (q.difficulty === undefined || q.difficulty === null) errors.push('difficulty 누락');

  if (q.subject && !VALID_SUBJECTS.has(q.subject)) {
    errors.push(`유효하지 않은 subject: "${q.subject}"`);
  }

  if (q.type && !VALID_QUIZ_TYPES.has(q.type)) {
    errors.push(`유효하지 않은 type: "${q.type}"`);
  }

  if (q.type === 'ox' && q.answer !== undefined && q.answer !== null) {
    if (typeof q.answer !== 'string' || !VALID_OX_ANSWERS.has(q.answer)) {
      errors.push(`OX answer는 O/X이어야 함: "${q.answer}"`);
    }
  }

  if (q.type === 'multiple') {
    const n = Array.isArray(q.options) ? q.options.length : 0;
    // 임용 1차는 5지선다가 표준 — 4지선다(서비스 자체 제작) 및 5지선다(기출) 모두 허용
    if (!Array.isArray(q.options) || (n !== 4 && n !== 5)) {
      errors.push('multiple은 options 4개 또는 5개 필수');
    }
    if (q.answer !== undefined && q.answer !== null) {
      const a = String(q.answer);
      if (!/^\d+$/.test(a) || +a < 0 || +a >= n) {
        errors.push(`multiple answer는 0~${Math.max(n - 1, 0)} 범위여야 함: "${q.answer}"`);
      }
    }
  }

  if (q.type === 'scenario_composite') {
    if (!q.case_context) {
      errors.push('scenario_composite는 case_context 필수');
    }
    if (!q.sub_questions || !Array.isArray(q.sub_questions) || q.sub_questions.length === 0) {
      errors.push('scenario_composite는 sub_questions 필수');
    }
  }

  if (!q.explanation || q.explanation.length === 0) {
    warnings.push('explanation 누락');
  } else if (q.explanation.length < 30) {
    warnings.push(`explanation이 짧음 (${q.explanation.length}자)`);
  }

  if (q.question && q.question.length < 10) {
    warnings.push(`질문이 짧음 (${q.question.length}자)`);
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

export function validateBatchQuality(questions: QuizInput[]): BatchQualityResult {
  const details: BatchQualityResult['details'] = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const q of questions) {
    const result = validateQuizQuality(q);
    if (!result.isValid || result.warnings.length > 0) {
      details.push({ id: q.id || '(no id)', ...result });
    }
    errorCount += result.errors.length;
    warningCount += result.warnings.length;
  }

  return {
    total: questions.length,
    valid: questions.length - details.filter((d) => !d.isValid).length,
    invalid: details.filter((d) => !d.isValid).length,
    errorCount,
    warningCount,
    details,
  };
}
