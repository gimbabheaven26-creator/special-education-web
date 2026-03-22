/**
 * Data Validation Script — 2026-03-21 (Session B)
 * 검증 대상:
 *   1. 신규 문항 집중 검증: bs-q201~220, trans-q156~175, vi-q129~148, hi-q107~126
 *   2. 전체 DB answer/WE 정합성 검증
 *
 * 검증 규칙 (contract.md):
 *   R1. answer: multiple="0"~"3", ox="O"/"X", fill_in=텍스트
 *   R2. wrong_explanations: multiple에만 존재, 정답키 제외, "4"키 금지
 *   R3. ox/fill_in/descriptive의 wrong_explanations: null 필수
 *   R4. explanation: NOT NULL, 30자 이상
 *   R5. 금지 문구: wrong_explanations 내 "이 설명이 옳다", "옳은 설명이다", "정확하다", "맞다"
 *   R6. "옳지 않은 것" 유형: "이 선지는 옳은 내용이어서 정답이 아니다" 패턴 필수
 *
 * 데이터 수정: 위반 발견 시 즉시 UPDATE
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY 환경변수 미설정');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// ─── 금번 세션 신규 배치 범위 ───
const NEW_BATCH_RANGES = [
  { prefix: 'bs-q', start: 201, end: 220, label: 'behavior-support 심화' },
  { prefix: 'trans-q', start: 156, end: 175, label: '전환교육 심화' },
  { prefix: 'vi-q', start: 129, end: 148, label: '시각장애 심화' },
  { prefix: 'hi-q', start: 107, end: 126, label: '청각장애 심화' },
];

// 신규 배치 ID 목록 생성
const NEW_BATCH_IDS = [];
for (const range of NEW_BATCH_RANGES) {
  for (let n = range.start; n <= range.end; n++) {
    NEW_BATCH_IDS.push(`${range.prefix}${n}`);
  }
}

// ─── 위반 및 수정 추적 ───
const violations = [];
const fixes = [];
const fixErrors = [];

function addViolation(id, rule, detail, fixable = false, fixData = null) {
  violations.push({ id, rule, detail, fixable, fixData });
}

// ─── 유틸: 페이지네이션으로 전체 조회 ───
async function fetchAll(table, columns, filter = null) {
  const PAGE_SIZE = 1000;
  let allRows = [];
  let from = 0;

  while (true) {
    let query = supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);

    if (filter) {
      query = filter(query);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`fetchAll ${table} 오류:`, error.message);
      break;
    }
    if (!data || data.length === 0) break;
    allRows = allRows.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return allRows;
}

// ─── 금지 문구 목록 ───
const FORBIDDEN_PHRASES = [
  '이 설명이 옳다',
  '옳은 설명이다',
  '정확하다',
  '맞다',
];

// ─── "옳지 않은 것" 유형 감지 패턴 ───
const WRONG_QUESTION_PATTERN = /옳지 않은|틀린|잘못된|해당하지 않는/;
const REQUIRED_WE_PATTERN = /이 선지는 옳은 내용이어서 정답이 아니다/;

// ─── 검증 함수 ───

function validateAnswerFormat(row) {
  const { id, type, answer } = row;

  if (type === 'multiple') {
    if (!['0', '1', '2', '3'].includes(answer)) {
      addViolation(id, 'R1', `multiple answer 비정상값: "${answer}" (기대: "0"~"3")`);
    }
  } else if (type === 'ox') {
    if (!['O', 'X'].includes(answer)) {
      let fix = null;
      if (answer === '0') fix = 'X';
      else if (answer === '1') fix = 'O';

      if (fix) {
        addViolation(id, 'R1', `OX answer 숫자 인덱스: "${answer}" → "${fix}" 수정 필요`, true, {
          table: 'quiz_questions',
          id,
          update: { answer: fix },
        });
      } else {
        addViolation(id, 'R1', `OX answer 비정상값: "${answer}" (기대: "O"/"X")`);
      }
    }
  }
}

function validateWrongExplanations(row) {
  const { id, type, answer, wrong_explanations: we, question } = row;

  // R3: ox/fill_in/descriptive는 WE가 null이어야 함
  if (['ox', 'fill_in', 'descriptive'].includes(type) && we !== null) {
    addViolation(id, 'R3', `${type} 타입인데 wrong_explanations 존재: ${JSON.stringify(we)}`, true, {
      table: 'quiz_questions',
      id,
      update: { wrong_explanations: null },
    });
    return;
  }

  if (type !== 'multiple') return;
  if (!we || typeof we !== 'object') return;

  const keys = Object.keys(we);

  // R2-a: 키가 "4" 이상이면 안 됨
  const invalidKeys = keys.filter(k => {
    const n = parseInt(k);
    return isNaN(n) || n < 0 || n > 3;
  });
  if (invalidKeys.length > 0) {
    // 자동 수정: "4" 이상 키 제거
    const cleaned = {};
    for (const k of keys) {
      const n = parseInt(k);
      if (!isNaN(n) && n >= 0 && n <= 3) {
        cleaned[k] = we[k];
      }
    }
    addViolation(id, 'R2', `WE 키 범위 초과: ${JSON.stringify(invalidKeys)} → 제거 필요`, true, {
      table: 'quiz_questions',
      id,
      update: { wrong_explanations: cleaned },
    });
  }

  // R2-b: 정답 키가 WE에 포함되면 안 됨
  if (answer && we.hasOwnProperty(answer)) {
    const cleaned = { ...we };
    delete cleaned[answer];
    addViolation(id, 'R2', `WE에 정답 키(${answer}) 포함 → 제거 필요`, true, {
      table: 'quiz_questions',
      id,
      update: { wrong_explanations: cleaned },
    });
  }
}

function validateForbiddenPhrases(row) {
  const { id, wrong_explanations: we } = row;
  if (!we || typeof we !== 'object') return;

  for (const [key, text] of Object.entries(we)) {
    if (typeof text !== 'string') continue;
    for (const phrase of FORBIDDEN_PHRASES) {
      if (text.includes(phrase)) {
        addViolation(id, 'R5', `WE[${key}]에 금지 문구 "${phrase}" 포함: "${text.substring(0, 60)}..."`);
      }
    }
  }
}

function validateExplanationLength(row) {
  const { id, explanation } = row;
  if (!explanation || explanation.trim().length < 30) {
    addViolation(id, 'R4', `explanation 30자 미만 또는 null: "${explanation?.substring(0, 50)}"`);
  }
}

function validateWrongQuestionPattern(row) {
  const { id, type, question, wrong_explanations: we } = row;
  if (type !== 'multiple') return;
  if (!question) return;

  if (WRONG_QUESTION_PATTERN.test(question)) {
    // "옳지 않은 것" 유형 — WE가 있어야 하고, 각 WE 항목에 패턴이 있어야 함
    if (!we || typeof we !== 'object') return;
    for (const [key, text] of Object.entries(we)) {
      if (typeof text !== 'string') continue;
      if (!REQUIRED_WE_PATTERN.test(text)) {
        addViolation(id, 'R6', `"옳지 않은 것" 유형 WE[${key}]에 필수 패턴 없음: "${text.substring(0, 80)}"`);
      }
    }
  }
}

function validateOptions(row) {
  const { id, type, options } = row;
  if (type !== 'multiple') return;
  if (!options || !Array.isArray(options) || options.length !== 4) {
    addViolation(id, 'VC', `multiple 타입 options가 4개가 아님: ${options ? options.length : 'null'}개`);
  }
}

// ─── 단일 row 전체 검증 ───
function validateRow(row) {
  validateAnswerFormat(row);
  validateWrongExplanations(row);
  validateForbiddenPhrases(row);
  validateExplanationLength(row);
  validateWrongQuestionPattern(row);
  validateOptions(row);
}

// ─── 수정 실행 ───
async function applyFix(violation) {
  if (!violation.fixable || !violation.fixData) return;
  const { table, id, update } = violation.fixData;

  const { error } = await supabase.from(table).update(update).eq('id', id);
  if (error) {
    fixErrors.push({ id, rule: violation.rule, error: error.message });
    console.error(`  [FIX FAIL] ${id} (${violation.rule}): ${error.message}`);
  } else {
    fixes.push({ id, rule: violation.rule, update: JSON.stringify(update).substring(0, 80) });
    console.log(`  [FIX OK] ${id} (${violation.rule})`);
  }
}

// ─── 메인 실행 ───
async function main() {
  console.log('='.repeat(60));
  console.log('Data Validation Report — 2026-03-21 (Session B)');
  console.log('='.repeat(60));
  console.log();

  // ── STEP 1: 신규 배치 문항 존재 확인 ──
  console.log('[ STEP 1 ] 신규 배치 문항 DB 존재 확인');
  const missingIds = [];
  const existingBatch = [];

  // 신규 배치를 배치별로 조회
  for (const range of NEW_BATCH_RANGES) {
    const ids = [];
    for (let n = range.start; n <= range.end; n++) {
      ids.push(`${range.prefix}${n}`);
    }
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, type, answer, explanation, wrong_explanations, options, question, subject, chapter, difficulty')
      .in('id', ids);

    if (error) {
      console.error(`  [ERROR] ${range.label} 조회 실패:`, error.message);
      continue;
    }

    const foundIds = new Set((data || []).map(r => r.id));
    const missing = ids.filter(id => !foundIds.has(id));

    console.log(`  ${range.label}: ${(data || []).length}/${ids.length}건 존재, ${missing.length}건 미존재`);
    if (missing.length > 0) {
      console.log(`    미존재 ID: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '...' : ''}`);
      missingIds.push(...missing);
    }
    existingBatch.push(...(data || []));
  }
  console.log(`  -> 신규 배치 총 ${existingBatch.length}건 조회됨, ${missingIds.length}건 미존재`);
  console.log();

  // ── STEP 2: 신규 배치 전 항목 검증 ──
  console.log('[ STEP 2 ] 신규 배치 문항 상세 검증 (80건)');
  const batchViolationsBefore = violations.length;
  for (const row of existingBatch) {
    validateRow(row);
  }
  const batchViolationsAfter = violations.length;
  const batchViolationCount = batchViolationsAfter - batchViolationsBefore;
  console.log(`  신규 배치 위반: ${batchViolationCount}건`);
  if (batchViolationCount > 0) {
    for (const v of violations.slice(batchViolationsBefore)) {
      console.log(`  [VIOLATION] ${v.id} (${v.rule}): ${v.detail}`);
    }
  }
  console.log();

  // ── STEP 3: 전체 DB answer/WE 검증 (페이지네이션) ──
  console.log('[ STEP 3 ] 전체 DB 검증 (페이지네이션, 집중: answer/WE/금지문구/explanation)');
  const allRows = await fetchAll(
    'quiz_questions',
    'id, type, answer, explanation, wrong_explanations, options, question, subject, chapter, difficulty'
  );
  console.log(`  전체 조회: ${allRows.length}건`);

  const globalViolationsBefore = violations.length;

  // 신규 배치는 이미 검증했으므로 제외
  const newBatchIdSet = new Set(existingBatch.map(r => r.id));
  let checkedCount = 0;
  for (const row of allRows) {
    if (newBatchIdSet.has(row.id)) continue; // 중복 방지
    validateRow(row);
    checkedCount++;
  }

  const globalViolationsAfter = violations.length;
  const globalViolationCount = globalViolationsAfter - globalViolationsBefore;
  console.log(`  기존 문항 검증: ${checkedCount}건, 위반: ${globalViolationCount}건`);
  console.log();

  // ── STEP 4: 위반 항목 수정 ──
  const fixableViolations = violations.filter(v => v.fixable);
  console.log(`[ STEP 4 ] 자동 수정 실행 (fixable: ${fixableViolations.length}건)`);

  // 동일 ID에 여러 위반이 있으면 병합해서 1회 UPDATE
  const fixMap = new Map(); // id → merged update object
  for (const v of fixableViolations) {
    if (!v.fixData) continue;
    const { id, update } = v.fixData;
    if (!fixMap.has(id)) {
      fixMap.set(id, { ...update });
    } else {
      // 병합: 같은 ID에 여러 필드 수정이 있을 경우
      // wrong_explanations는 마지막 수정본이 우선 (키 제거 → 정답 키 제거 순서 고려)
      Object.assign(fixMap.get(id), update);
    }
  }

  for (const [id, update] of fixMap.entries()) {
    const { error } = await supabase.from('quiz_questions').update(update).eq('id', id);
    if (error) {
      fixErrors.push({ id, error: error.message });
      console.log(`  [FIX FAIL] ${id}: ${error.message}`);
    } else {
      fixes.push({ id, update: JSON.stringify(update).substring(0, 100) });
      console.log(`  [FIX OK] ${id}: ${JSON.stringify(update).substring(0, 80)}`);
    }
  }
  console.log();

  // ── STEP 5: 신규 배치 분포 분석 ──
  console.log('[ STEP 5 ] 신규 배치 분포 분석');
  const batchBySubject = {};
  for (const row of existingBatch) {
    const sub = row.subject;
    if (!batchBySubject[sub]) {
      batchBySubject[sub] = { total: 0, byType: {}, byDiff: { 1: 0, 2: 0, 3: 0 } };
    }
    batchBySubject[sub].total++;
    batchBySubject[sub].byType[row.type] = (batchBySubject[sub].byType[row.type] || 0) + 1;
    batchBySubject[sub].byDiff[row.difficulty] = (batchBySubject[sub].byDiff[row.difficulty] || 0) + 1;
  }

  for (const [sub, stats] of Object.entries(batchBySubject)) {
    const typeStr = Object.entries(stats.byType).map(([t, n]) => `${t}:${n}`).join(', ');
    const diffStr = `D1:${stats.byDiff[1]} D2:${stats.byDiff[2]} D3:${stats.byDiff[3]}`;
    const diffAllSame = Object.values(stats.byDiff).filter(v => v > 0).length === 1;
    console.log(`  ${sub}: ${stats.total}건 | ${typeStr} | ${diffStr}${diffAllSame ? ' ⚠ 단일 난이도' : ''}`);
  }
  console.log();

  // ── FINAL REPORT ──
  console.log('='.repeat(60));
  console.log('FINAL REPORT');
  console.log('='.repeat(60));
  console.log(`검증 총계: ${allRows.length}건 (신규 배치 ${existingBatch.length}건 포함)`);
  console.log(`총 위반: ${violations.length}건`);
  console.log(`  - 신규 배치 위반: ${batchViolationCount}건`);
  console.log(`  - 기존 문항 위반: ${globalViolationCount}건`);
  console.log(`자동 수정 시도: ${fixMap.size}건`);
  console.log(`  - 수정 성공: ${fixes.length}건`);
  console.log(`  - 수정 실패: ${fixErrors.length}건`);
  console.log(`신규 배치 미존재: ${missingIds.length}건`);
  console.log();

  // 규칙별 집계
  const ruleCount = {};
  for (const v of violations) {
    ruleCount[v.rule] = (ruleCount[v.rule] || 0) + 1;
  }
  if (Object.keys(ruleCount).length > 0) {
    console.log('위반 규칙별 분포:');
    for (const [rule, cnt] of Object.entries(ruleCount)) {
      console.log(`  ${rule}: ${cnt}건`);
    }
    console.log();
    console.log('위반 상세 (최초 30건):');
    for (const v of violations.slice(0, 30)) {
      console.log(`  [${v.rule}] ${v.id}: ${v.detail}${v.fixable ? ' [FIX]' : ''}`);
    }
    if (violations.length > 30) {
      console.log(`  ... 외 ${violations.length - 30}건`);
    }
  }
  console.log();

  const totalViolationsAfterFix = violations.length - fixes.length;
  if (missingIds.length === 0 && totalViolationsAfterFix === 0) {
    console.log('판정: PASS — 모든 검증 항목 통과, 수정 완료');
  } else {
    console.log('판정: HAS_ISSUES');
    if (missingIds.length > 0) {
      console.log(`  - 신규 배치 미존재 ${missingIds.length}건: ${missingIds.slice(0, 20).join(', ')}`);
    }
    if (fixErrors.length > 0) {
      console.log(`  - 수정 실패 ${fixErrors.length}건`);
    }
    const unfixed = violations.filter(v => !v.fixable);
    if (unfixed.length > 0) {
      console.log(`  - 수동 수정 필요 ${unfixed.length}건`);
    }
  }
}

main().catch(e => {
  console.error('스크립트 실행 오류:', e);
  process.exit(1);
});
