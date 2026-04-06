/**
 * scripts/lib/validator.mjs
 *
 * contract.md 기반 데이터 검증 함수.
 * quiz_questions, worksheet_questions 검증에 사용.
 */

// --- 상수 (contract.md v2.13 기준) ---

export const VALID_SUBJECTS = new Set([
  'introduction', 'behavior-support', 'visual-impairment', 'hearing-impairment',
  'communication-disorder', 'physical-disability', 'curriculum', 'transition',
  'inclusive-education', 'assessment', 'laws',
]);

export const VALID_QUIZ_TYPES = new Set([
  'multiple', 'ox', 'fill_in', 'descriptive', 'scenario_composite',
]);

export const VALID_WORKSHEET_TYPES = new Set(['fill_in', 'descriptive']);

export const VALID_DIFFICULTIES = new Set([1, 2, 3]);

export const ID_PREFIXES = {
  'introduction': 'intro-',
  'behavior-support': 'bs-',
  'curriculum': 'cur-',
  'inclusive-education': 'inc-',
  'assessment': 'asmnt-',
  'transition': 'trans-',
  'laws': 'laws-',
  'visual-impairment': 'vi-',
  'hearing-impairment': 'hi-',
  'physical-disability': 'pd-',
  'communication-disorder': 'cd-',
};

const VALID_MULTIPLE_ANSWERS = new Set(['0', '1', '2', '3']);
const VALID_OX_ANSWERS = new Set(['O', 'X']);

// --- 검증 함수 ---

/**
 * quiz_questions 행 하나를 검증한다.
 *
 * @param {object} q - quiz_questions 행
 * @returns {{ errors: string[], warnings: string[], isValid: boolean }}
 */
export function validateQuizQuestion(q) {
  const errors = [];
  const warnings = [];

  // 필수 필드
  if (!q.id) errors.push('id 누락');
  if (!q.subject) errors.push('subject 누락');
  if (!q.chapter) errors.push('chapter 누락');
  if (!q.type) errors.push('type 누락');
  if (!q.question) errors.push('question 누락');
  if (q.answer === undefined || q.answer === null || q.answer === '') {
    errors.push('answer 누락');
  }
  if (!q.explanation) errors.push('explanation 누락');
  if (q.difficulty === undefined || q.difficulty === null) {
    errors.push('difficulty 누락');
  }

  // subject
  if (q.subject && !VALID_SUBJECTS.has(q.subject)) {
    errors.push(`유효하지 않은 subject: "${q.subject}"`);
  }

  // type
  if (q.type && !VALID_QUIZ_TYPES.has(q.type)) {
    errors.push(`유효하지 않은 type: "${q.type}"`);
  }

  // difficulty
  if (q.difficulty !== undefined && q.difficulty !== null && !VALID_DIFFICULTIES.has(q.difficulty)) {
    errors.push(`difficulty는 1/2/3이어야 함: ${q.difficulty}`);
  }

  // answer by type
  if (q.type && q.answer !== undefined && q.answer !== null) {
    if (q.type === 'multiple' && !VALID_MULTIPLE_ANSWERS.has(q.answer)) {
      errors.push(`multiple answer는 0~3이어야 함: "${q.answer}"`);
    }
    if (q.type === 'ox' && !VALID_OX_ANSWERS.has(q.answer)) {
      errors.push(`ox answer는 O/X이어야 함: "${q.answer}"`);
    }
  }

  // options (multiple만)
  if (q.type === 'multiple') {
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      errors.push('multiple은 options 4개 필수');
    } else if (q.options.some(o => !o || typeof o !== 'string')) {
      errors.push('options에 빈 값 존재');
    }
  }

  // wrong_explanations (multiple만)
  if (q.type === 'multiple' && q.wrong_explanations) {
    const we = typeof q.wrong_explanations === 'string'
      ? JSON.parse(q.wrong_explanations)
      : q.wrong_explanations;

    if (typeof we !== 'object' || Array.isArray(we)) {
      errors.push('wrong_explanations는 객체여야 함');
    } else {
      const keys = Object.keys(we);
      const invalid = keys.filter(k => !VALID_MULTIPLE_ANSWERS.has(k));
      if (invalid.length) {
        errors.push(`wrong_explanations 잘못된 키: ${invalid.join(', ')}`);
      }
      if (q.answer && keys.includes(String(q.answer))) {
        errors.push(`wrong_explanations에 정답 키 "${q.answer}" 포함`);
      }
    }
  }

  // scenario_composite 전용
  if (q.type === 'scenario_composite') {
    if (!q.case_context) {
      warnings.push('scenario_composite인데 case_context 없음');
    }
    if (!q.sub_questions || !Array.isArray(q.sub_questions) || q.sub_questions.length === 0) {
      errors.push('scenario_composite는 sub_questions 필수');
    }
  }

  // ID prefix
  if (q.id && q.subject) {
    const prefix = ID_PREFIXES[q.subject];
    if (prefix && !q.id.startsWith(prefix)) {
      warnings.push(`ID "${q.id}"의 접두사가 "${prefix}"와 불일치`);
    }
  }

  // explanation 길이
  if (q.explanation && q.explanation.length < 30) {
    warnings.push(`explanation이 짧음 (${q.explanation.length}자)`);
  }

  return { errors, warnings, isValid: errors.length === 0 };
}

/**
 * 배치 검증. 전체 결과를 요약한다.
 *
 * @param {object[]} questions
 * @returns {{ total: number, valid: number, invalid: number, errorCount: number, warningCount: number, details: Array }}
 */
export function validateBatch(questions) {
  const details = [];
  let errorCount = 0;
  let warningCount = 0;

  for (const q of questions) {
    const result = validateQuizQuestion(q);
    if (!result.isValid || result.warnings.length > 0) {
      details.push({ id: q.id || '(no id)', ...result });
    }
    errorCount += result.errors.length;
    warningCount += result.warnings.length;
  }

  return {
    total: questions.length,
    valid: questions.length - details.filter(d => !d.isValid).length,
    invalid: details.filter(d => !d.isValid).length,
    errorCount,
    warningCount,
    details,
  };
}

/**
 * 배치 검증 결과를 콘솔에 출력한다.
 *
 * @param {{ total: number, valid: number, invalid: number, errorCount: number, warningCount: number, details: Array }} result
 */
export function printBatchReport(result) {
  const { total, valid, invalid, errorCount, warningCount, details } = result;

  console.log(`\n=== Validation Report ===`);
  console.log(`Total: ${total} | Valid: ${valid} | Invalid: ${invalid}`);
  console.log(`Errors: ${errorCount} | Warnings: ${warningCount}\n`);

  for (const d of details) {
    if (d.errors.length > 0) {
      console.log(`[ERROR] ${d.id}`);
      d.errors.forEach(e => console.log(`  - ${e}`));
    }
    if (d.warnings.length > 0) {
      console.log(`[WARN]  ${d.id}`);
      d.warnings.forEach(w => console.log(`  - ${w}`));
    }
  }

  if (details.length === 0) {
    console.log('All questions passed validation.');
  }
}
