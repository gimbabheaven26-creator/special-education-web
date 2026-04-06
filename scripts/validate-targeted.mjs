/**
 * Targeted Validation Script
 * 검증 범위:
 * 1. cd-q63: wrong_explanations 형태 확인
 * 2. tags 자동 태깅 샘플 확인 (685건 중 일부)
 * 3. 전체 contract.md 규칙 위반 건수
 */

import { getClient, fetchAll, fetchFiltered } from './lib/supabase-client.mjs';

const supabase = getClient();

/**
 * SDK 기반 query 래퍼. PostgREST 파라미터 문법을 SDK 호출로 변환.
 * 간단한 eq/not.is/select/limit/offset 패턴만 지원.
 */
async function query(table, params = '') {
  // params 예: '?id=eq.cd-q63&select=id,type,answer,options,wrong_explanations'
  const url = new URL(`http://dummy/${table}${params}`);
  const select = url.searchParams.get('select') || '*';
  const limit = url.searchParams.has('limit') ? parseInt(url.searchParams.get('limit'), 10) : 10000;
  const offset = url.searchParams.has('offset') ? parseInt(url.searchParams.get('offset'), 10) : 0;

  let q = supabase.from(table).select(select);

  // eq 필터 적용
  for (const [key, value] of url.searchParams.entries()) {
    if (key === 'select' || key === 'limit' || key === 'offset') continue;
    if (value.startsWith('eq.')) {
      q = q.eq(key, value.slice(3));
    } else if (value === 'not.is.null') {
      q = q.not(key, 'is', null);
    }
  }

  if (offset > 0) {
    q = q.range(offset, offset + limit - 1);
  } else {
    q = q.limit(limit);
  }

  const { data, error } = await q;
  if (error) throw new Error(`Query failed [${table}]: ${error.message}`);
  return data || [];
}

// ─────────────────────────────────────────
// SECTION 1: cd-q63 검증
// ─────────────────────────────────────────
async function validateCdQ63() {
  console.log('\n=== SECTION 1: cd-q63 검증 ===');
  const rows = await query('quiz_questions', '?id=eq.cd-q63&select=id,type,answer,options,wrong_explanations');
  if (rows.length === 0) {
    console.log('[FAIL] cd-q63 행을 찾을 수 없습니다.');
    return false;
  }
  const q = rows[0];
  console.log(`ID: ${q.id}`);
  console.log(`type: ${q.type}`);
  console.log(`answer: ${q.answer}`);
  console.log(`options count: ${q.options ? q.options.length : 'NULL'}`);
  console.log(`wrong_explanations: ${JSON.stringify(q.wrong_explanations, null, 2)}`);

  const issues = [];

  // type 검증
  if (q.type !== 'multiple') {
    issues.push(`type이 'multiple'이 아님: ${q.type}`);
  }

  // answer 검증 (multiple이면 "0"~"3")
  if (q.type === 'multiple' && !['0','1','2','3'].includes(q.answer)) {
    issues.push(`answer 값 오류: "${q.answer}" (숫자 인덱스여야 함)`);
  }

  // options 검증
  if (q.type === 'multiple') {
    if (!q.options || q.options.length !== 4) {
      issues.push(`options가 4개가 아님: ${q.options ? q.options.length : 'NULL'}개`);
    }
  }

  // wrong_explanations 검증
  // answer="2"이므로 키 "2"는 없어야 하고, "0","1","3"이 있어야 함
  if (q.wrong_explanations === null || q.wrong_explanations === undefined) {
    issues.push('wrong_explanations이 NULL');
  } else {
    const we = q.wrong_explanations;
    const keys = Object.keys(we);
    console.log(`wrong_explanations 키: [${keys.join(', ')}]`);

    // 키가 숫자 인덱스인지 확인
    const invalidKeys = keys.filter(k => !['0','1','2','3'].includes(k));
    if (invalidKeys.length > 0) {
      issues.push(`wrong_explanations에 유효하지 않은 키: [${invalidKeys.join(', ')}]`);
    }

    // answer키("2")가 포함되어 있으면 안 됨
    if (keys.includes(q.answer)) {
      issues.push(`wrong_explanations에 정답 키("${q.answer}")가 포함됨 — 오답 키만 허용`);
    }

    // 나머지 오답 인덱스 확인 (0,1,3 중 없는 것)
    if (q.options && q.answer) {
      const answerIdx = parseInt(q.answer, 10);
      const expectedKeys = [0,1,2,3].filter(i => i !== answerIdx).map(String);
      const missingKeys = expectedKeys.filter(k => !keys.includes(k));
      if (missingKeys.length > 0) {
        console.log(`  [WARNING] wrong_explanations에 누락된 키: [${missingKeys.join(', ')}] (필수는 아니나 권장)`);
      }
    }
  }

  if (issues.length === 0) {
    console.log('[PASS] cd-q63 모든 검증 통과');
  } else {
    issues.forEach(i => console.log(`[FAIL] ${i}`));
  }
  return issues.length === 0;
}

// ─────────────────────────────────────────
// SECTION 2: tags 자동 태깅 샘플 확인
// ─────────────────────────────────────────
async function validateTagsSample() {
  console.log('\n=== SECTION 2: tags 자동 태깅 샘플 확인 ===');

  // 2-1: tags가 NULL이 아닌 문항 수 집계 (페이지네이션)
  let allTagged = [];
  let offset = 0;
  const pageSize = 1000;
  while (true) {
    const page = await query('quiz_questions', `?select=id,subject,chapter,tags&tags=not.is.null&limit=${pageSize}&offset=${offset}`);
    allTagged = allTagged.concat(page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }
  console.log(`tags != NULL 총 문항 수: ${allTagged.length}`);

  // tags가 비어있지 않은 것 (빈 배열 [] 및 빈 객체 {} 제외)
  const nonEmpty = allTagged.filter(q => {
    const t = q.tags;
    if (!t) return false;
    if (Array.isArray(t)) return t.length > 0;
    return Object.keys(t).length > 0;
  });
  console.log(`tags 실제 값 있는 문항 수: ${nonEmpty.length}`);

  // 2-2: 챕터별 샘플 확인
  const targetChapters = ['introduction', 'disability-types', 'special-education-act'];

  for (const ch of targetChapters) {
    const rows = await query('quiz_questions', `?chapter=eq.${ch}&tags=not.is.null&select=id,chapter,tags&limit=5`);
    const filled = rows.filter(r => r.tags && Object.keys(r.tags).length > 0);
    console.log(`\n  챕터 '${ch}': tags 있는 문항 ${filled.length}/${rows.length}개 (샘플 5개 기준)`);
    filled.slice(0, 3).forEach(r => {
      console.log(`    ${r.id}: ${JSON.stringify(r.tags)}`);
    });
  }

  // 2-3: introduction 과목 전체 태깅 현황
  const introRows = await query('quiz_questions', '?subject=eq.introduction&select=id,chapter,tags&limit=200');
  const introTagged = introRows.filter(r => r.tags && Object.keys(r.tags).length > 0);
  const introNull = introRows.filter(r => !r.tags || Object.keys(r.tags).length === 0);
  console.log(`\n  introduction 과목: 전체 ${introRows.length}건 중 태깅 완료 ${introTagged.length}건, 미태깅 ${introNull.length}건`);

  // 2-4: laws 과목 전체 태깅 현황
  const lawsRows = await query('quiz_questions', '?subject=eq.laws&select=id,chapter,tags&limit=300');
  const lawsTagged = lawsRows.filter(r => r.tags && Object.keys(r.tags).length > 0);
  console.log(`  laws 과목: 전체 ${lawsRows.length}건 중 태깅 완료 ${lawsTagged.length}건`);

  // 2-5: 전체 과목별 태깅 현황 (페이지네이션)
  let allRows = [];
  let allOffset = 0;
  while (true) {
    const page = await query('quiz_questions', `?select=subject,tags&limit=1000&offset=${allOffset}`);
    allRows = allRows.concat(page);
    if (page.length < 1000) break;
    allOffset += 1000;
  }
  const bySubject = {};
  for (const r of allRows) {
    if (!bySubject[r.subject]) bySubject[r.subject] = { total: 0, tagged: 0 };
    bySubject[r.subject].total++;
    if (r.tags && Object.keys(r.tags).length > 0) bySubject[r.subject].tagged++;
  }

  console.log('\n  과목별 태깅 현황:');
  console.log('  과목                         | 전체  | 태깅완료 | 미태깅 | 태깅률');
  console.log('  -----------------------------|-------|---------|--------|-------');
  for (const [subj, stat] of Object.entries(bySubject)) {
    const ratio = ((stat.tagged / stat.total) * 100).toFixed(1);
    const untagged = stat.total - stat.tagged;
    console.log(`  ${subj.padEnd(28)} | ${String(stat.total).padStart(5)} | ${String(stat.tagged).padStart(7)} | ${String(untagged).padStart(6)} | ${ratio}%`);
  }

  return nonEmpty.length >= 685;
}

// ─────────────────────────────────────────
// SECTION 3: 전체 contract.md 규칙 위반 검증
// ─────────────────────────────────────────
async function validateFullContract() {
  console.log('\n=== SECTION 3: 전체 contract.md 규칙 위반 검증 ===');

  const violations = {
    refIntegrity: [],
    idNaming: [],
    valueConstraints: [],
    completeness: [],
    distribution: [],
  };

  // 데이터 로드 (lib fetchAll 사용)
  console.log('데이터 로딩 중...');
  const [subjects, chapters, quizzes, wTopics, wQuestions] = await Promise.all([
    fetchAll(supabase, 'subjects', 'slug'),
    fetchAll(supabase, 'chapters', 'id,subject_slug,slug,title'),
    fetchAll(supabase, 'quiz_questions', 'id,subject,chapter,type,answer,options,difficulty,wrong_explanations'),
    fetchAll(supabase, 'worksheet_topics', 'id,subject'),
    fetchAll(supabase, 'worksheet_questions', 'id,topic_id,subject,type,difficulty,answer'),
  ]);

  const subjectSlugs = new Set(subjects.map(s => s.slug));
  const chaptersBySubject = {};
  for (const ch of chapters) {
    if (!chaptersBySubject[ch.subject_slug]) chaptersBySubject[ch.subject_slug] = new Set();
    chaptersBySubject[ch.subject_slug].add(ch.slug);
  }
  const wTopicIds = new Set(wTopics.map(t => t.id));

  console.log(`  subjects: ${subjects.length}개`);
  console.log(`  chapters: ${chapters.length}개`);
  console.log(`  quiz_questions: ${quizzes.length}개`);
  console.log(`  worksheet_topics: ${wTopics.length}개`);
  console.log(`  worksheet_questions: ${wQuestions.length}개`);

  // ── 참조 무결성 ──
  console.log('\n[참조 무결성 검사]');

  // 1. chapters.subject_slug → subjects.slug
  const badChapters = chapters.filter(ch => !subjectSlugs.has(ch.subject_slug));
  if (badChapters.length > 0) {
    badChapters.forEach(ch => violations.refIntegrity.push(
      `chapters: "${ch.slug}" → subject_slug="${ch.subject_slug}" 존재하지 않음`
    ));
  }
  console.log(`  chapters.subject_slug → subjects.slug: ${badChapters.length === 0 ? 'PASS' : `FAIL (${badChapters.length}건)`}`);

  // 2. quiz_questions.subject → subjects.slug
  const badQSubjects = quizzes.filter(q => !subjectSlugs.has(q.subject));
  if (badQSubjects.length > 0) {
    badQSubjects.slice(0, 5).forEach(q => violations.refIntegrity.push(
      `quiz_questions: "${q.id}" → subject="${q.subject}" 존재하지 않음`
    ));
  }
  console.log(`  quiz_questions.subject → subjects.slug: ${badQSubjects.length === 0 ? 'PASS' : `FAIL (${badQSubjects.length}건)`}`);

  // 3. quiz_questions.chapter → chapters.slug (같은 subject 내)
  const badQChapters = quizzes.filter(q => {
    const subjectChapters = chaptersBySubject[q.subject];
    if (!subjectChapters) return true;
    return !subjectChapters.has(q.chapter);
  });
  if (badQChapters.length > 0) {
    badQChapters.slice(0, 10).forEach(q => violations.refIntegrity.push(
      `quiz_questions: "${q.id}" → chapter="${q.chapter}" (subject="${q.subject}") 존재하지 않음`
    ));
  }
  console.log(`  quiz_questions.chapter → chapters.slug: ${badQChapters.length === 0 ? 'PASS' : `FAIL (${badQChapters.length}건)`}`);
  if (badQChapters.length > 0) {
    const sample = badQChapters.slice(0, 5);
    sample.forEach(q => console.log(`    - ${q.id}: chapter="${q.chapter}", subject="${q.subject}"`));
    if (badQChapters.length > 5) console.log(`    ... 외 ${badQChapters.length - 5}건`);
  }

  // 4. worksheet_topics.subject → subjects.slug
  const badWTSubjects = wTopics.filter(t => !subjectSlugs.has(t.subject));
  if (badWTSubjects.length > 0) {
    badWTSubjects.forEach(t => violations.refIntegrity.push(
      `worksheet_topics: "${t.id}" → subject="${t.subject}" 존재하지 않음`
    ));
  }
  console.log(`  worksheet_topics.subject → subjects.slug: ${badWTSubjects.length === 0 ? 'PASS' : `FAIL (${badWTSubjects.length}건)`}`);

  // 5. worksheet_questions.subject → subjects.slug
  const badWQSubjects = wQuestions.filter(q => !subjectSlugs.has(q.subject));
  if (badWQSubjects.length > 0) {
    badWQSubjects.slice(0, 5).forEach(q => violations.refIntegrity.push(
      `worksheet_questions: "${q.id}" → subject="${q.subject}" 존재하지 않음`
    ));
  }
  console.log(`  worksheet_questions.subject → subjects.slug: ${badWQSubjects.length === 0 ? 'PASS' : `FAIL (${badWQSubjects.length}건)`}`);

  // 6. worksheet_questions.topic_id → worksheet_topics.id
  const badWQTopics = wQuestions.filter(q => !wTopicIds.has(q.topic_id));
  if (badWQTopics.length > 0) {
    badWQTopics.slice(0, 5).forEach(q => violations.refIntegrity.push(
      `worksheet_questions: "${q.id}" → topic_id="${q.topic_id}" 존재하지 않음`
    ));
  }
  console.log(`  worksheet_questions.topic_id → worksheet_topics.id: ${badWQTopics.length === 0 ? 'PASS' : `FAIL (${badWQTopics.length}건)`}`);

  // ── ID 명명 규칙 ──
  console.log('\n[ID 명명 규칙 검사]');
  const prefixMap = {
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

  const badQIds = quizzes.filter(q => {
    const expectedPrefix = prefixMap[q.subject];
    if (!expectedPrefix) return false; // unknown subject — caught above
    // 패턴: {prefix}q{n}
    const pattern = new RegExp(`^${expectedPrefix.replace('-', '\\-')}q\\d+$`);
    return !pattern.test(q.id);
  });

  if (badQIds.length > 0) {
    badQIds.slice(0, 10).forEach(q => violations.idNaming.push(
      `quiz_questions ID "${q.id}" (subject=${q.subject}) 패턴 불일치 (expected: ${prefixMap[q.subject]}q{n})`
    ));
  }
  console.log(`  quiz_questions ID 패턴: ${badQIds.length === 0 ? 'PASS' : `FAIL (${badQIds.length}건)`}`);
  if (badQIds.length > 0 && badQIds.length <= 10) {
    badQIds.forEach(q => console.log(`    - ${q.id} (subject=${q.subject})`));
  } else if (badQIds.length > 10) {
    badQIds.slice(0, 5).forEach(q => console.log(`    - ${q.id} (subject=${q.subject})`));
    console.log(`    ... 외 ${badQIds.length - 5}건`);
  }

  // worksheet_topics ID 패턴: {prefix}topic-{n}
  const badWTIds = wTopics.filter(t => {
    const expectedPrefix = prefixMap[t.subject];
    if (!expectedPrefix) return false;
    const pattern = new RegExp(`^${expectedPrefix.replace('-', '\\-')}topic-\\d+$`);
    return !pattern.test(t.id);
  });
  if (badWTIds.length > 0) {
    badWTIds.forEach(t => violations.idNaming.push(
      `worksheet_topics ID "${t.id}" (subject=${t.subject}) 패턴 불일치`
    ));
  }
  console.log(`  worksheet_topics ID 패턴: ${badWTIds.length === 0 ? 'PASS' : `FAIL (${badWTIds.length}건)`}`);

  // worksheet_questions ID 패턴: {prefix}ws-{n}
  const wqAll = wQuestions; // 이미 로드됨
  const badWQIds = wqAll.filter(q => {
    const expectedPrefix = prefixMap[q.subject];
    if (!expectedPrefix) return false;
    const pattern = new RegExp(`^${expectedPrefix.replace('-', '\\-')}ws-\\d+$`);
    return !pattern.test(q.id);
  });
  if (badWQIds.length > 0) {
    badWQIds.slice(0, 5).forEach(q => violations.idNaming.push(
      `worksheet_questions ID "${q.id}" (subject=${q.subject}) 패턴 불일치`
    ));
  }
  console.log(`  worksheet_questions ID 패턴: ${badWQIds.length === 0 ? 'PASS' : `FAIL (${badWQIds.length}건)`}`);

  // ── 값 제약 ──
  console.log('\n[값 제약 검사]');

  // quiz type
  const validQTypes = new Set(['multiple', 'ox', 'fill_in', 'descriptive']);
  const badQTypes = quizzes.filter(q => !validQTypes.has(q.type));
  console.log(`  quiz type 유효성: ${badQTypes.length === 0 ? 'PASS' : `FAIL (${badQTypes.length}건)`}`);
  if (badQTypes.length > 0) {
    badQTypes.forEach(q => violations.valueConstraints.push(`quiz "${q.id}" type="${q.type}" 유효하지 않음`));
  }

  // quiz difficulty
  const badQDiff = quizzes.filter(q => ![1,2,3].includes(q.difficulty));
  console.log(`  quiz difficulty 1-3: ${badQDiff.length === 0 ? 'PASS' : `FAIL (${badQDiff.length}건)`}`);
  if (badQDiff.length > 0) {
    badQDiff.forEach(q => violations.valueConstraints.push(`quiz "${q.id}" difficulty=${q.difficulty} 유효하지 않음`));
  }

  // answer (multiple): "0"~"3"
  const multipleQs = quizzes.filter(q => q.type === 'multiple');
  const badMAnswers = multipleQs.filter(q => !['0','1','2','3'].includes(q.answer));
  console.log(`  multiple answer "0"~"3": ${badMAnswers.length === 0 ? 'PASS' : `FAIL (${badMAnswers.length}건)`}`);
  if (badMAnswers.length > 0) {
    badMAnswers.slice(0, 10).forEach(q => {
      violations.valueConstraints.push(`quiz "${q.id}" multiple answer="${q.answer}" 인덱스 아님`);
      console.log(`    - ${q.id}: answer="${q.answer}"`);
    });
  }

  // answer (ox): "O" or "X"
  const oxQs = quizzes.filter(q => q.type === 'ox');
  const badOXAnswers = oxQs.filter(q => !['O','X'].includes(q.answer));
  console.log(`  ox answer "O"/"X": ${badOXAnswers.length === 0 ? 'PASS' : `FAIL (${badOXAnswers.length}건)`}`);
  if (badOXAnswers.length > 0) {
    badOXAnswers.slice(0, 5).forEach(q => {
      violations.valueConstraints.push(`quiz "${q.id}" ox answer="${q.answer}" 유효하지 않음`);
      console.log(`    - ${q.id}: answer="${q.answer}"`);
    });
  }

  // options (multiple): 정확히 4개
  const badOptions = multipleQs.filter(q => !q.options || q.options.length !== 4);
  console.log(`  multiple options 4개: ${badOptions.length === 0 ? 'PASS' : `FAIL (${badOptions.length}건)`}`);
  if (badOptions.length > 0) {
    badOptions.slice(0, 5).forEach(q => {
      violations.valueConstraints.push(`quiz "${q.id}" options ${q.options ? q.options.length : 'NULL'}개 (4개 필요)`);
      console.log(`    - ${q.id}: options=${q.options ? q.options.length : 'NULL'}개`);
    });
  }

  // wrong_explanations 키 검증 (multiple)
  const multipleWithWE = multipleQs.filter(q => q.wrong_explanations !== null && q.wrong_explanations !== undefined);
  const badWEKeys = multipleWithWE.filter(q => {
    const keys = Object.keys(q.wrong_explanations);
    return keys.some(k => !['0','1','2','3'].includes(k));
  });
  console.log(`  wrong_explanations 키 "0"~"3": ${badWEKeys.length === 0 ? 'PASS' : `FAIL (${badWEKeys.length}건)`}`);
  if (badWEKeys.length > 0) {
    badWEKeys.slice(0, 10).forEach(q => {
      const invalidKeys = Object.keys(q.wrong_explanations).filter(k => !['0','1','2','3'].includes(k));
      violations.valueConstraints.push(`quiz "${q.id}" wrong_explanations 잘못된 키: [${invalidKeys.join(', ')}]`);
      console.log(`    - ${q.id}: 잘못된 키 [${invalidKeys.join(', ')}]`);
    });
  }

  // wrong_explanations에 정답 키 포함 여부
  const weAnswerKeyViolations = multipleWithWE.filter(q => {
    const keys = Object.keys(q.wrong_explanations);
    return keys.includes(q.answer);
  });
  console.log(`  wrong_explanations에 정답 키 미포함: ${weAnswerKeyViolations.length === 0 ? 'PASS' : `FAIL (${weAnswerKeyViolations.length}건)`}`);
  if (weAnswerKeyViolations.length > 0) {
    weAnswerKeyViolations.slice(0, 5).forEach(q => {
      violations.valueConstraints.push(`quiz "${q.id}" wrong_explanations에 정답 키("${q.answer}") 포함됨`);
      console.log(`    - ${q.id}: answer="${q.answer}", WE keys=[${Object.keys(q.wrong_explanations).join(', ')}]`);
    });
  }

  // worksheet type
  const validWTypes = new Set(['fill_in', 'descriptive']);
  const badWTypes = wQuestions.filter(q => !validWTypes.has(q.type));
  console.log(`  worksheet type 유효성: ${badWTypes.length === 0 ? 'PASS' : `FAIL (${badWTypes.length}건)`}`);
  if (badWTypes.length > 0) {
    badWTypes.forEach(q => violations.valueConstraints.push(`worksheet "${q.id}" type="${q.type}" 유효하지 않음`));
  }

  // worksheet difficulty
  const badWDiff = wQuestions.filter(q => ![1,2,3].includes(q.difficulty));
  console.log(`  worksheet difficulty 1-3: ${badWDiff.length === 0 ? 'PASS' : `FAIL (${badWDiff.length}건)`}`);
  if (badWDiff.length > 0) {
    badWDiff.forEach(q => violations.valueConstraints.push(`worksheet "${q.id}" difficulty=${q.difficulty} 유효하지 않음`));
  }

  // ── 데이터 완결성 ──
  console.log('\n[데이터 완결성 검사]');

  // 각 subject에 챕터 1개 이상
  const subjectsWithChapters = new Set(chapters.map(ch => ch.subject_slug));
  const subjectsNoChapter = subjects.filter(s => !subjectsWithChapters.has(s.slug));
  console.log(`  과목별 챕터 존재: ${subjectsNoChapter.length === 0 ? 'PASS' : `FAIL (${subjectsNoChapter.length}건)`}`);
  if (subjectsNoChapter.length > 0) {
    subjectsNoChapter.forEach(s => {
      violations.completeness.push(`subject "${s.slug}" 챕터 없음`);
      console.log(`    - ${s.slug}: 챕터 없음`);
    });
  }

  // 각 챕터에 퀴즈 1개 이상
  const chaptersWithQuiz = new Set(quizzes.map(q => `${q.subject}::${q.chapter}`));
  const chaptersNoQuiz = chapters.filter(ch => !chaptersWithQuiz.has(`${ch.subject_slug}::${ch.slug}`));
  console.log(`  챕터별 퀴즈 존재: ${chaptersNoQuiz.length === 0 ? 'PASS' : `FAIL (${chaptersNoQuiz.length}건)`}`);
  if (chaptersNoQuiz.length > 0) {
    chaptersNoQuiz.slice(0, 10).forEach(ch => {
      violations.completeness.push(`chapter "${ch.slug}" (subject=${ch.subject_slug}) 퀴즈 없음`);
      console.log(`    - ${ch.subject_slug}/${ch.slug}: 퀴즈 없음`);
    });
    if (chaptersNoQuiz.length > 10) console.log(`    ... 외 ${chaptersNoQuiz.length - 10}건`);
  }

  // ── 분포 분석 ──
  console.log('\n[분포 분석]');
  const subjectStats = {};
  for (const q of quizzes) {
    if (!subjectStats[q.subject]) subjectStats[q.subject] = { total: 0, d1: 0, d2: 0, d3: 0, types: {} };
    subjectStats[q.subject].total++;
    if (q.difficulty === 1) subjectStats[q.subject].d1++;
    else if (q.difficulty === 2) subjectStats[q.subject].d2++;
    else if (q.difficulty === 3) subjectStats[q.subject].d3++;
    subjectStats[q.subject].types[q.type] = (subjectStats[q.subject].types[q.type] || 0) + 1;
  }

  const wsBySubject = {};
  for (const q of wQuestions) {
    if (!wsBySubject[q.subject]) wsBySubject[q.subject] = 0;
    wsBySubject[q.subject]++;
  }

  console.log('\n  과목            | 퀴즈  | 워크시트 | D1  | D2  | D3  | 난이도편향 | 유형분포');
  console.log('  ----------------|-------|---------|-----|-----|-----|-----------|--------');
  for (const [subj, stat] of Object.entries(subjectStats)) {
    const ws = wsBySubject[subj] || 0;
    const d1p = ((stat.d1 / stat.total) * 100).toFixed(0);
    const d2p = ((stat.d2 / stat.total) * 100).toFixed(0);
    const d3p = ((stat.d3 / stat.total) * 100).toFixed(0);
    const biased = (parseInt(d1p) === 100 || parseInt(d2p) === 100 || parseInt(d3p) === 100) ? 'WARN' : 'OK';
    if (biased === 'WARN') {
      violations.distribution.push(`subject "${subj}" 난이도 100% 단일 레벨`);
    }
    const typeStr = Object.entries(stat.types).map(([t,c]) => `${t.substring(0,4)}:${c}`).join(' ');
    const shortSubj = subj.substring(0, 16).padEnd(16);
    console.log(`  ${shortSubj} | ${String(stat.total).padStart(5)} | ${String(ws).padStart(7)} | ${d1p.padStart(3)}% | ${d2p.padStart(3)}% | ${d3p.padStart(3)}% | ${biased.padEnd(9)} | ${typeStr}`);
  }

  // ── 최종 집계 ──
  const totalViolations =
    violations.refIntegrity.length +
    violations.idNaming.length +
    violations.valueConstraints.length +
    violations.completeness.length +
    violations.distribution.length;

  return { violations, totalViolations };
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────
async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║     Data Validation Report — 그린(GREEN)             ║');
  console.log(`║     Date: ${today}                              ║`);
  console.log('╚══════════════════════════════════════════════════════╝');

  const cdQ63Pass = await validateCdQ63();
  const tagsOk = await validateTagsSample();
  const { violations, totalViolations } = await validateFullContract();

  // ── 최종 리포트 ──
  console.log('\n\n══════════════════════════════════════════════════════');
  console.log('                   최종 검증 결과 요약');
  console.log('══════════════════════════════════════════════════════');
  console.log(`\n[cd-q63 검증]    ${cdQ63Pass ? 'PASS' : 'FAIL'}`);
  console.log(`[tags 태깅 확인] ${tagsOk ? 'PASS (685건 이상 태깅)' : 'FAIL (685건 미만)'}`);
  console.log(`\n[전체 위반 총계] ${totalViolations}건`);
  console.log(`  - 참조 무결성:  ${violations.refIntegrity.length}건`);
  console.log(`  - ID 명명:      ${violations.idNaming.length}건`);
  console.log(`  - 값 제약:      ${violations.valueConstraints.length}건`);
  console.log(`  - 데이터 완결성: ${violations.completeness.length}건`);
  console.log(`  - 분포 이상:    ${violations.distribution.length}건`);

  if (totalViolations === 0) {
    console.log('\n상태: CLEAN — 계약 위반 없음');
  } else {
    console.log('\n상태: HAS_ISSUES — 조치 필요 항목 있음');
    if (violations.refIntegrity.length > 0) {
      console.log('\n[참조 무결성 위반 상세]');
      violations.refIntegrity.slice(0, 10).forEach(v => console.log(`  - ${v}`));
    }
    if (violations.idNaming.length > 0) {
      console.log('\n[ID 명명 위반 상세]');
      violations.idNaming.slice(0, 10).forEach(v => console.log(`  - ${v}`));
    }
    if (violations.valueConstraints.length > 0) {
      console.log('\n[값 제약 위반 상세]');
      violations.valueConstraints.slice(0, 10).forEach(v => console.log(`  - ${v}`));
    }
    if (violations.completeness.length > 0) {
      console.log('\n[데이터 완결성 위반 상세]');
      violations.completeness.slice(0, 10).forEach(v => console.log(`  - ${v}`));
    }
    if (violations.distribution.length > 0) {
      console.log('\n[분포 이상 상세]');
      violations.distribution.forEach(v => console.log(`  - ${v}`));
    }
  }
  console.log('══════════════════════════════════════════════════════');
}

main().catch(e => {
  console.error('검증 스크립트 오류:', e.message);
  process.exit(1);
});
