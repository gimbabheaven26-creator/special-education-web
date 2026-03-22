/**
 * data-validator — 2026-03-21
 * 신규 삽입 vi-q109~128, hi-q87~106 중점 검증 + 전체 DB 검증
 * 검증 항목:
 *   1. explanation NOT NULL (모든 type)
 *   2. fill_in/ox의 wrong_explanations: null ([] 아닌 null)
 *   3. multiple의 wrong_explanations: 정답 키 포함 금지, "4" 키 금지
 *   4. multiple의 answer: "0"~"3" 인덱스 문자열만
 *   5. wrong_explanations에 금지 문구 없을 것
 *   + 참조 무결성, ID 패턴, 값 제약, 데이터 완결성, 분포 분석
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── 유틸: 페이지네이션으로 전체 행 fetch ───────────────────────────────────
async function fetchAll(table, columns = '*', extraFilter = null) {
  const PAGE = 1000;
  let all = [];
  let from = 0;
  while (true) {
    let q = supabase.from(table).select(columns).range(from, from + PAGE - 1);
    if (extraFilter) q = extraFilter(q);
    const { data, error } = await q;
    if (error) throw new Error(`fetch ${table} error: ${error.message}`);
    all = all.concat(data || []);
    if (!data || data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

// ─── 금지 문구 목록 ───────────────────────────────────────────────────────────
const FORBIDDEN_PHRASES = ['이 설명이 옳다', '옳은 설명이다', '정확하다', '맞다'];

function hasForbiddenPhrase(text) {
  if (!text) return null;
  for (const phrase of FORBIDDEN_PHRASES) {
    if (text.includes(phrase)) return phrase;
  }
  return null;
}

// ─── 메인 검증 ────────────────────────────────────────────────────────────────
async function main() {
  console.log('='.repeat(70));
  console.log('Data Validation Report — 2026-03-21');
  console.log('신규 삽입: vi-q109~128 (20건), hi-q87~106 (20건)');
  console.log('='.repeat(70));

  // 1. 기초 데이터 로드
  const subjects = await fetchAll('subjects', 'slug');
  const chapters = await fetchAll('chapters', 'slug,subject_slug');
  const subjectSlugs = new Set(subjects.map(s => s.slug));
  // chapters 세트: key = "subject_slug::slug"
  const chapterKeySet = new Set(chapters.map(c => `${c.subject_slug}::${c.slug}`));
  const chapterSlugSet = new Set(chapters.map(c => c.slug));

  // 2. 전체 quiz_questions 로드
  const quizzes = await fetchAll('quiz_questions',
    'id,subject,chapter,type,answer,explanation,wrong_explanations,difficulty,options'
  );
  console.log(`\n총 quiz_questions: ${quizzes.length}건`);

  // 신규 문항 필터
  const newVI = quizzes.filter(q => {
    const n = parseInt(q.id.replace('vi-q', ''));
    return q.id.startsWith('vi-q') && n >= 109 && n <= 128;
  });
  const newHI = quizzes.filter(q => {
    const n = parseInt(q.id.replace('hi-q', ''));
    return q.id.startsWith('hi-q') && n >= 87 && n <= 106;
  });
  console.log(`신규 vi-q109~128: ${newVI.length}건, hi-q87~106: ${newHI.length}건\n`);

  const violations = {
    refIntegrity: [],
    idNaming: [],
    valueConstraints: [],
    completeness: [],
    newBatch: [],  // 신규 문항 전용
  };

  // ─── Check 1: Referential Integrity ────────────────────────────────────────
  console.log('[1/5] 참조 무결성 검증...');

  for (const q of quizzes) {
    if (!subjectSlugs.has(q.subject)) {
      violations.refIntegrity.push({ id: q.id, issue: `subject '${q.subject}' 없음` });
    }
    const key = `${q.subject}::${q.chapter}`;
    if (!chapterKeySet.has(key)) {
      violations.refIntegrity.push({ id: q.id, issue: `chapter '${q.chapter}' (subject:${q.subject}) 없음` });
    }
  }

  // worksheet_topics, worksheet_questions
  const wsTopics = await fetchAll('worksheet_topics', 'id,subject');
  const wsTopicIdSet = new Set(wsTopics.map(t => t.id));
  const wsQuestions = await fetchAll('worksheet_questions', 'id,subject,topic_id');

  for (const t of wsTopics) {
    if (!subjectSlugs.has(t.subject)) {
      violations.refIntegrity.push({ id: `topic:${t.id}`, issue: `subject '${t.subject}' 없음` });
    }
  }
  for (const w of wsQuestions) {
    if (!subjectSlugs.has(w.subject)) {
      violations.refIntegrity.push({ id: `ws:${w.id}`, issue: `subject '${w.subject}' 없음` });
    }
    if (!wsTopicIdSet.has(w.topic_id)) {
      violations.refIntegrity.push({ id: `ws:${w.id}`, issue: `topic_id '${w.topic_id}' 없음` });
    }
  }

  // chapters.subject_slug → subjects.slug
  for (const c of chapters) {
    if (!subjectSlugs.has(c.subject_slug)) {
      violations.refIntegrity.push({ id: `chapter:${c.slug}`, issue: `subject_slug '${c.subject_slug}' 없음` });
    }
  }

  console.log(`  참조 무결성 위반: ${violations.refIntegrity.length}건`);

  // ─── Check 2: ID Naming ─────────────────────────────────────────────────────
  console.log('[2/5] ID 명명 규칙 검증...');

  const ID_PREFIXES = {
    'introduction': /^intro-q\d+$/,
    'behavior-support': /^bs-q\d+$/,
    'curriculum': /^cur-q\d+$/,
    'inclusive-education': /^inc-q\d+$/,
    'assessment': /^asmnt-q\d+$/,
    'transition': /^trans-q\d+$/,
    'laws': /^laws-q\d+$/,
    'visual-impairment': /^vi-q\d+$/,
    'hearing-impairment': /^hi-q\d+$/,
    'physical-disability': /^pd-q\d+$/,
    'communication-disorder': /^cd-q\d+$/,
  };

  for (const q of quizzes) {
    const pattern = ID_PREFIXES[q.subject];
    if (pattern && !pattern.test(q.id)) {
      violations.idNaming.push({ id: q.id, subject: q.subject });
    }
  }
  console.log(`  ID 명명 위반: ${violations.idNaming.length}건 (레거시 포함, 보류 상태)`);

  // ─── Check 3: Value Constraints (전체) ─────────────────────────────────────
  console.log('[3/5] 값 제약 검증...');

  const VALID_TYPES = new Set(['multiple', 'ox', 'fill_in', 'descriptive']);
  const VALID_DIFFICULTIES = new Set([1, 2, 3]);
  const VALID_MULTIPLE_ANSWERS = new Set(['0', '1', '2', '3']);
  const VALID_OX_ANSWERS = new Set(['O', 'X']);

  for (const q of quizzes) {
    const isNew = (q.id.startsWith('vi-q') && parseInt(q.id.replace('vi-q', '')) >= 109) ||
                  (q.id.startsWith('hi-q') && parseInt(q.id.replace('hi-q', '')) >= 87);

    // type 검증
    if (!VALID_TYPES.has(q.type)) {
      const v = { id: q.id, issue: `type='${q.type}' 유효하지 않음` };
      violations.valueConstraints.push(v);
      if (isNew) violations.newBatch.push(v);
    }

    // difficulty 검증
    if (!VALID_DIFFICULTIES.has(q.difficulty)) {
      const v = { id: q.id, issue: `difficulty=${q.difficulty} (1/2/3 아님)` };
      violations.valueConstraints.push(v);
      if (isNew) violations.newBatch.push(v);
    }

    // explanation NOT NULL
    if (!q.explanation || q.explanation.trim() === '') {
      const v = { id: q.id, issue: 'explanation NULL 또는 빈 문자열' };
      violations.valueConstraints.push(v);
      if (isNew) violations.newBatch.push(v);
    }

    // multiple 전용
    if (q.type === 'multiple') {
      // answer: "0"~"3"
      if (!VALID_MULTIPLE_ANSWERS.has(q.answer)) {
        const v = { id: q.id, issue: `multiple answer='${q.answer}' (0~3 아님)` };
        violations.valueConstraints.push(v);
        if (isNew) violations.newBatch.push(v);
      }
      // options: 정확히 4개
      if (!q.options || q.options.length !== 4) {
        const v = { id: q.id, issue: `options 개수=${q.options ? q.options.length : 'null'} (4개 필요)` };
        violations.valueConstraints.push(v);
        if (isNew) violations.newBatch.push(v);
      }
      // wrong_explanations: 정답 키 포함 금지, "4" 키 금지
      if (q.wrong_explanations && typeof q.wrong_explanations === 'object') {
        const keys = Object.keys(q.wrong_explanations);
        // "4" 키 금지
        if (keys.includes('4')) {
          const v = { id: q.id, issue: 'wrong_explanations에 "4" 키 존재' };
          violations.valueConstraints.push(v);
          if (isNew) violations.newBatch.push(v);
        }
        // 정답 키 포함 금지
        if (q.answer && keys.includes(q.answer)) {
          const v = { id: q.id, issue: `wrong_explanations에 정답 키 "${q.answer}" 포함` };
          violations.valueConstraints.push(v);
          if (isNew) violations.newBatch.push(v);
        }
        // 금지 문구 검증
        for (const [k, text] of Object.entries(q.wrong_explanations)) {
          const found = hasForbiddenPhrase(String(text));
          if (found) {
            const v = { id: q.id, issue: `wrong_explanations["${k}"]에 금지 문구 "${found}" 포함` };
            violations.valueConstraints.push(v);
            if (isNew) violations.newBatch.push(v);
          }
        }
      }
    }

    // OX 전용
    if (q.type === 'ox') {
      if (!VALID_OX_ANSWERS.has(q.answer)) {
        const v = { id: q.id, issue: `ox answer='${q.answer}' ("O" 또는 "X" 아님)` };
        violations.valueConstraints.push(v);
        if (isNew) violations.newBatch.push(v);
      }
      // fill_in/ox: wrong_explanations는 null이어야 함 ([] 아닌 null)
      if (q.wrong_explanations !== null) {
        const v = { id: q.id, issue: `ox wrong_explanations가 null 아님: ${JSON.stringify(q.wrong_explanations)}` };
        violations.valueConstraints.push(v);
        if (isNew) violations.newBatch.push(v);
      }
    }

    // fill_in 전용
    if (q.type === 'fill_in') {
      // wrong_explanations는 null이어야 함
      if (q.wrong_explanations !== null) {
        const v = { id: q.id, issue: `fill_in wrong_explanations가 null 아님: ${JSON.stringify(q.wrong_explanations)}` };
        violations.valueConstraints.push(v);
        if (isNew) violations.newBatch.push(v);
      }
    }

    // explanation 금지 문구 (모든 타입)
    const foundInExpl = hasForbiddenPhrase(q.explanation);
    if (foundInExpl) {
      const v = { id: q.id, issue: `explanation에 금지 문구 "${foundInExpl}" 포함` };
      violations.valueConstraints.push(v);
      if (isNew) violations.newBatch.push(v);
    }
  }

  console.log(`  값 제약 위반: ${violations.valueConstraints.length}건`);

  // ─── Check 4: Data Completeness ─────────────────────────────────────────────
  console.log('[4/5] 데이터 완결성 검증...');

  // 과목별 챕터 수
  const chapsBySubject = {};
  for (const c of chapters) {
    chapsBySubject[c.subject_slug] = (chapsBySubject[c.subject_slug] || 0) + 1;
  }
  for (const slug of subjectSlugs) {
    if (!chapsBySubject[slug] || chapsBySubject[slug] === 0) {
      violations.completeness.push({ id: `subject:${slug}`, issue: '챕터 없음' });
    }
  }

  // 챕터별 퀴즈 수 (chapters 테이블 기준)
  const quizByChapter = {};
  for (const q of quizzes) {
    const key = `${q.subject}::${q.chapter}`;
    quizByChapter[key] = (quizByChapter[key] || 0) + 1;
  }

  // 실제 chapters 테이블에 있는 챕터에 대해서만 확인
  let emptyChapters = 0;
  for (const c of chapters) {
    const key = `${c.subject_slug}::${c.slug}`;
    if (!quizByChapter[key]) {
      violations.completeness.push({ id: `chapter:${c.subject_slug}::${c.slug}`, issue: '퀴즈 없음' });
      emptyChapters++;
    }
  }

  console.log(`  완결성 위반: ${violations.completeness.length}건 (퀴즈 없는 챕터: ${emptyChapters}건)`);

  // ─── Check 5: Distribution Analysis ─────────────────────────────────────────
  console.log('[5/5] 분포 분석...');

  const distBySubject = {};
  for (const q of quizzes) {
    if (!distBySubject[q.subject]) {
      distBySubject[q.subject] = { total: 0, d1: 0, d2: 0, d3: 0, types: {} };
    }
    const s = distBySubject[q.subject];
    s.total++;
    if (q.difficulty === 1) s.d1++;
    else if (q.difficulty === 2) s.d2++;
    else if (q.difficulty === 3) s.d3++;
    s.types[q.type] = (s.types[q.type] || 0) + 1;
  }

  // ─── 신규 문항 전용 세부 검증 ────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('신규 문항 세부 검증 (vi-q109~128, hi-q87~106)');
  console.log('='.repeat(70));

  const newItems = [...newVI, ...newHI];
  if (newItems.length === 0) {
    console.log('  경고: 신규 문항이 DB에서 발견되지 않음!');
  } else {
    console.log(`  발견된 신규 문항: ${newItems.length}건`);

    // 체크 A: explanation NOT NULL
    const explNull = newItems.filter(q => !q.explanation || q.explanation.trim() === '');
    console.log(`  [A] explanation NULL/빈값: ${explNull.length}건`);
    if (explNull.length > 0) explNull.forEach(q => console.log(`    - ${q.id}`));

    // 체크 B: fill_in/ox wrong_explanations null 여부
    const wrongNotNull = newItems.filter(q =>
      (q.type === 'fill_in' || q.type === 'ox') && q.wrong_explanations !== null
    );
    console.log(`  [B] fill_in/ox wrong_explanations != null: ${wrongNotNull.length}건`);
    if (wrongNotNull.length > 0) wrongNotNull.forEach(q =>
      console.log(`    - ${q.id} (type:${q.type}) = ${JSON.stringify(q.wrong_explanations)}`)
    );

    // 체크 C: multiple wrong_explanations 키 규칙
    const multipleItems = newItems.filter(q => q.type === 'multiple');
    console.log(`  [C] multiple 문항 수: ${multipleItems.length}건`);
    let cViolations = 0;
    for (const q of multipleItems) {
      if (!q.wrong_explanations) continue;
      const keys = Object.keys(q.wrong_explanations);
      if (keys.includes('4')) {
        console.log(`    - ${q.id}: "4" 키 존재`);
        cViolations++;
      }
      if (q.answer && keys.includes(q.answer)) {
        console.log(`    - ${q.id}: 정답 키 "${q.answer}" 포함`);
        cViolations++;
      }
    }
    if (cViolations === 0) console.log(`    정답 키/4 키 위반: 0건`);

    // 체크 D: multiple answer "0"~"3"
    const answerViolations = newItems.filter(q =>
      q.type === 'multiple' && !VALID_MULTIPLE_ANSWERS.has(q.answer)
    );
    console.log(`  [D] multiple answer 범위 위반: ${answerViolations.length}건`);
    if (answerViolations.length > 0) answerViolations.forEach(q =>
      console.log(`    - ${q.id}: answer='${q.answer}'`)
    );

    // 체크 E: 금지 문구
    let forbiddenCount = 0;
    for (const q of newItems) {
      // explanation
      const inExpl = hasForbiddenPhrase(q.explanation);
      if (inExpl) {
        console.log(`  [E] ${q.id} explanation 금지문구: "${inExpl}"`);
        forbiddenCount++;
      }
      // wrong_explanations
      if (q.wrong_explanations && typeof q.wrong_explanations === 'object') {
        for (const [k, text] of Object.entries(q.wrong_explanations)) {
          const inWrong = hasForbiddenPhrase(String(text));
          if (inWrong) {
            console.log(`  [E] ${q.id} wrong_explanations["${k}"] 금지문구: "${inWrong}"`);
            forbiddenCount++;
          }
        }
      }
    }
    if (forbiddenCount === 0) console.log(`  [E] 금지 문구: 0건`);

    // 신규 문항 분포
    console.log('\n  신규 문항 분포:');
    const newDist = { vi: {}, hi: {} };
    for (const q of newVI) {
      newDist.vi[q.type] = (newDist.vi[q.type] || 0) + 1;
    }
    for (const q of newHI) {
      newDist.hi[q.type] = (newDist.hi[q.type] || 0) + 1;
    }
    console.log(`  vi-q109~128: ${JSON.stringify(newDist.vi)}`);
    console.log(`  hi-q87~106: ${JSON.stringify(newDist.hi)}`);

    // 신규 문항 difficulty 분포
    const viDiff = { 1: 0, 2: 0, 3: 0 };
    const hiDiff = { 1: 0, 2: 0, 3: 0 };
    for (const q of newVI) viDiff[q.difficulty] = (viDiff[q.difficulty] || 0) + 1;
    for (const q of newHI) hiDiff[q.difficulty] = (hiDiff[q.difficulty] || 0) + 1;
    console.log(`  vi difficulty: 기초${viDiff[1]} / 중급${viDiff[2]} / 심화${viDiff[3]}`);
    console.log(`  hi difficulty: 기초${hiDiff[1]} / 중급${hiDiff[2]} / 심화${hiDiff[3]}`);
  }

  // ─── 최종 리포트 ─────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('전체 검증 결과 요약');
  console.log('='.repeat(70));

  const totalViolations =
    violations.refIntegrity.length +
    violations.valueConstraints.length +
    violations.completeness.length;
  // (ID naming 위반은 contract.md 자체가 보류 명시 — 카운트만)

  console.log(`\n총 위반 (ID naming 제외): ${totalViolations}건`);
  console.log(`  참조 무결성: ${violations.refIntegrity.length}건`);
  console.log(`  값 제약: ${violations.valueConstraints.length}건`);
  console.log(`  데이터 완결성: ${violations.completeness.length}건`);
  console.log(`  ID Naming (보류): ${violations.idNaming.length}건`);
  console.log(`\n신규 문항(vi+hi 40건) 위반: ${violations.newBatch.length}건`);

  if (violations.newBatch.length > 0) {
    console.log('\n[신규 문항 위반 세부]');
    violations.newBatch.forEach(v => console.log(`  - ${v.id}: ${v.issue}`));
  }

  // 값 제약 위반 세부 (전체 — 기존 대비 변화 파악)
  if (violations.valueConstraints.length > 0) {
    console.log('\n[값 제약 위반 세부 — 상위 30건]');
    violations.valueConstraints.slice(0, 30).forEach(v => console.log(`  - ${v.id}: ${v.issue}`));
    if (violations.valueConstraints.length > 30) {
      console.log(`  ... 외 ${violations.valueConstraints.length - 30}건`);
    }
  }

  // 참조 무결성 위반 세부 (상위)
  if (violations.refIntegrity.length > 0) {
    console.log('\n[참조 무결성 위반 세부 — 상위 20건]');
    violations.refIntegrity.slice(0, 20).forEach(v => console.log(`  - ${v.id}: ${v.issue}`));
    if (violations.refIntegrity.length > 20) {
      console.log(`  ... 외 ${violations.refIntegrity.length - 20}건`);
    }
  }

  // 완결성 위반 세부
  if (violations.completeness.length > 0) {
    console.log('\n[완결성 위반 세부]');
    violations.completeness.forEach(v => console.log(`  - ${v.id}: ${v.issue}`));
  }

  // 분포 요약
  console.log('\n[과목별 분포 요약]');
  console.log(
    'Subject'.padEnd(30) +
    'Total'.padStart(7) +
    'D1'.padStart(5) +
    'D2'.padStart(5) +
    'D3'.padStart(5) +
    '  Types'
  );
  console.log('-'.repeat(70));
  const subjects2 = await fetchAll('subjects', 'slug,title');
  for (const sub of subjects2.sort((a, b) => a.slug.localeCompare(b.slug))) {
    const d = distBySubject[sub.slug] || { total: 0, d1: 0, d2: 0, d3: 0, types: {} };
    const typeStr = Object.entries(d.types).map(([t, n]) => `${t}:${n}`).join(', ');
    console.log(
      sub.slug.padEnd(30) +
      String(d.total).padStart(7) +
      String(d.d1).padStart(5) +
      String(d.d2).padStart(5) +
      String(d.d3).padStart(5) +
      '  ' + typeStr
    );
  }

  console.log('\n' + '='.repeat(70));
  const verdict = violations.newBatch.length === 0
    ? 'CLEAN (신규 문항 위반 없음)'
    : `HAS_ISSUES (신규 위반 ${violations.newBatch.length}건)`;
  console.log(`최종 판정: ${verdict}`);
  console.log('='.repeat(70));

  return violations;
}

main().catch(e => {
  console.error('검증 스크립트 오류:', e);
  process.exit(1);
});
