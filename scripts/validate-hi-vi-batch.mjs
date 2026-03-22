/**
 * Data Validator — hi-q127~146 (20문항) + vi-q149~168 (20문항) + 전체 DB 검증
 * 검증 규칙:
 *   V1. explanation NOT NULL
 *   V2. multiple: wrong_explanations에 정답 키 포함 금지
 *   V3. multiple: wrong_explanations에 "4" 키 금지
 *   V4. fill_in/ox: wrong_explanations null 필수
 *   V5. fill_in/ox: options null 필수
 *   V6. WE 금지 문구: "이 설명이 옳다", "옳은 설명이다", "정확하다", "맞다"
 *   V7. "옳지 않은 것" 유형: WE에 "이 선지는 옳은 내용이어서 정답이 아니다" 패턴 필수
 *   V8. options는 반드시 text[] 배열 (jsonb 객체 형식 금지)
 *   V9. answer 형식: multiple="0"~"3", ox="O"/"X"
 *  V10. multiple answer index 교차 확인 (options 배열에서 해당 인덱스 선지 존재 확인)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// ─── helpers ───────────────────────────────────────────────────────────────

const FORBIDDEN_PHRASES = ['이 설명이 옳다', '옳은 설명이다', '정확하다', '맞다'];
const CORRECT_PATTERN = '이 선지는 옳은 내용이어서 정답이 아니다';

function isOptionsJsonbObject(options) {
  // text[] 이면 배열, jsonb 객체이면 plain object
  if (options === null || options === undefined) return false;
  if (Array.isArray(options)) return false;
  if (typeof options === 'object') return true;
  return false;
}

function hasForbiddenPhrase(text) {
  if (!text) return false;
  return FORBIDDEN_PHRASES.some(p => text.includes(p));
}

function weValues(we) {
  if (!we) return [];
  return Object.values(we);
}

function checkV6(row) {
  // WE 값들에서 금지 문구 검출 (단, "이 선지는 옳은 내용이어서 정답이 아니다" 로 시작하는 경우 허용)
  const violations = [];
  const we = row.wrong_explanations;
  if (!we) return violations;
  for (const [k, v] of Object.entries(we)) {
    if (!v) continue;
    // "이 선지는 옳은 내용이어서 정답이 아니다"로 시작하면 V7 충족 → V6는 원본 부분만 검사
    const textToCheck = v.startsWith(CORRECT_PATTERN)
      ? v.slice(CORRECT_PATTERN.length).trim()
      : v;
    if (hasForbiddenPhrase(textToCheck)) {
      violations.push({ key: k, text: v.slice(0, 80) });
    }
  }
  return violations;
}

function checkV7(row) {
  // "옳지 않은 것" 유형: wrong_explanations의 정답 이외 키에 CORRECT_PATTERN 필수
  if (!row.question.includes('옳지 않은 것')) return [];
  const we = row.wrong_explanations;
  if (!we) return [{ msg: 'wrong_explanations 자체가 null — 옳지않은것 유형에 필수' }];
  const violations = [];
  for (const [k, v] of Object.entries(we)) {
    if (k === row.answer) continue; // 정답 키는 제외
    if (!v || !v.includes(CORRECT_PATTERN)) {
      violations.push({ key: k, text: (v || '').slice(0, 60) });
    }
  }
  return violations;
}

// ─── fetch target rows ──────────────────────────────────────────────────────

async function fetchRows(ids) {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('id', ids);
  if (error) throw new Error(`fetchRows error: ${error.message}`);
  return data || [];
}

async function fetchAllRows() {
  let all = [];
  let from = 0;
  const pageSize = 1000;
  while (true) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`fetchAllRows error: ${error.message}`);
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return all;
}

// ─── validate a set of rows ─────────────────────────────────────────────────

function validateRows(rows, label) {
  const violations = [];

  for (const row of rows) {
    const id = row.id;
    const type = row.type;
    const we = row.wrong_explanations;
    const opts = row.options;

    // V1: explanation NOT NULL
    if (!row.explanation || row.explanation.trim() === '') {
      violations.push({ id, rule: 'V1', msg: 'explanation이 NULL 또는 빈 문자열' });
    }

    // V8: options는 text[] 배열 (jsonb 객체 금지)
    if (opts !== null && opts !== undefined && isOptionsJsonbObject(opts)) {
      violations.push({ id, rule: 'V8', msg: `options가 jsonb 객체 형식 — text[] 배열로 수정 필요: ${JSON.stringify(opts).slice(0, 80)}` });
    }

    if (type === 'multiple') {
      // V2: wrong_explanations에 정답 키 포함 금지
      if (we && row.answer && we[row.answer] !== undefined) {
        violations.push({ id, rule: 'V2', msg: `WE에 정답 키 "${row.answer}" 포함 — 정답 해설은 explanation에만` });
      }

      // V3: wrong_explanations에 "4" 키 금지
      if (we && we['4'] !== undefined) {
        violations.push({ id, rule: 'V3', msg: `WE에 키 "4" 존재 (options는 0~3 인덱스만)` });
      }

      // V9: answer = "0"~"3"
      if (!['0', '1', '2', '3'].includes(row.answer)) {
        violations.push({ id, rule: 'V9', msg: `multiple answer="${row.answer}" — "0"~"3"이어야 함` });
      }

      // V10: answer index가 options 배열에 존재하는지 확인
      if (Array.isArray(opts) && ['0','1','2','3'].includes(row.answer)) {
        const idx = parseInt(row.answer, 10);
        if (!opts[idx] || opts[idx].trim() === '') {
          violations.push({ id, rule: 'V10', msg: `options[${idx}]가 비어있거나 없음 — answer와 options 불일치` });
        }
      }

      // V6: WE 금지 문구
      const v6 = checkV6(row);
      for (const v of v6) {
        violations.push({ id, rule: 'V6', msg: `WE key="${v.key}" 금지 문구 포함: "${v.text}"` });
      }

      // V7: "옳지 않은 것" 유형 패턴 확인
      const v7 = checkV7(row);
      for (const v of v7) {
        violations.push({ id, rule: 'V7', msg: v.msg || `WE key="${v.key}" — "이 선지는 옳은 내용이어서 정답이 아니다" 누락: "${v.text}"` });
      }
    }

    if (type === 'ox') {
      // V4: wrong_explanations null 필수
      if (we !== null && we !== undefined) {
        violations.push({ id, rule: 'V4', msg: `ox 타입인데 wrong_explanations가 non-null: ${JSON.stringify(we).slice(0, 60)}` });
      }
      // V5: options null 필수
      if (opts !== null && opts !== undefined) {
        violations.push({ id, rule: 'V5', msg: `ox 타입인데 options가 non-null` });
      }
      // V9: answer = "O" or "X"
      if (!['O', 'X'].includes(row.answer)) {
        violations.push({ id, rule: 'V9', msg: `ox answer="${row.answer}" — "O" 또는 "X"이어야 함` });
      }
    }

    if (type === 'fill_in') {
      // V4: wrong_explanations null 필수
      if (we !== null && we !== undefined) {
        violations.push({ id, rule: 'V4', msg: `fill_in 타입인데 wrong_explanations가 non-null` });
      }
      // V5: options null 필수
      if (opts !== null && opts !== undefined) {
        violations.push({ id, rule: 'V5', msg: `fill_in 타입인데 options가 non-null` });
      }
    }
  }

  return violations;
}

// ─── report ────────────────────────────────────────────────────────────────

function printReport(label, violations, total) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[${label}] 총 ${total}건 검증 → 위반 ${violations.length}건`);
  if (violations.length === 0) {
    console.log('  PASS — 모든 항목 통과');
  } else {
    // group by rule
    const byRule = {};
    for (const v of violations) {
      if (!byRule[v.rule]) byRule[v.rule] = [];
      byRule[v.rule].push(v);
    }
    for (const [rule, vs] of Object.entries(byRule)) {
      console.log(`\n  [${rule}] ${vs.length}건:`);
      for (const v of vs) {
        console.log(`    - ${v.id}: ${v.msg}`);
      }
    }
  }
}

// ─── auto-fix helpers ───────────────────────────────────────────────────────

async function fixV8(rows) {
  // options jsonb 객체 → text[] 배열 변환
  const targets = rows.filter(r => r.options && isOptionsJsonbObject(r.options));
  let fixed = 0;
  for (const row of targets) {
    const opts = row.options;
    const arr = ['0','1','2','3'].map(k => opts[k] || '').filter(Boolean);
    if (arr.length !== 4) {
      console.log(`  [SKIP V8] ${row.id} — 배열 재조립 실패 (keys: ${Object.keys(opts).join(',')})`);
      continue;
    }
    const { error } = await supabase
      .from('quiz_questions')
      .update({ options: arr })
      .eq('id', row.id);
    if (error) {
      console.log(`  [ERROR V8] ${row.id}: ${error.message}`);
    } else {
      console.log(`  [FIX V8] ${row.id} — options jsonb→text[] 수정`);
      fixed++;
    }
  }
  return fixed;
}

async function fixV3(rows) {
  // wrong_explanations에서 "4" 키 제거
  const targets = rows.filter(r => r.wrong_explanations && r.wrong_explanations['4'] !== undefined);
  let fixed = 0;
  for (const row of targets) {
    const we = { ...row.wrong_explanations };
    delete we['4'];
    const { error } = await supabase
      .from('quiz_questions')
      .update({ wrong_explanations: we })
      .eq('id', row.id);
    if (error) {
      console.log(`  [ERROR V3] ${row.id}: ${error.message}`);
    } else {
      console.log(`  [FIX V3] ${row.id} — WE "4" 키 제거`);
      fixed++;
    }
  }
  return fixed;
}

async function fixV2(rows) {
  // wrong_explanations에서 정답 키 제거
  const targets = rows.filter(r => {
    const we = r.wrong_explanations;
    return r.type === 'multiple' && we && r.answer && we[r.answer] !== undefined;
  });
  let fixed = 0;
  for (const row of targets) {
    const we = { ...row.wrong_explanations };
    delete we[row.answer];
    const { error } = await supabase
      .from('quiz_questions')
      .update({ wrong_explanations: we })
      .eq('id', row.id);
    if (error) {
      console.log(`  [ERROR V2] ${row.id}: ${error.message}`);
    } else {
      console.log(`  [FIX V2] ${row.id} — WE 정답 키 "${row.answer}" 제거`);
      fixed++;
    }
  }
  return fixed;
}

async function fixV9Ox(rows) {
  // OX answer "0"→"X", "1"→"O" 변환
  const targets = rows.filter(r => r.type === 'ox' && ['0','1'].includes(r.answer));
  let fixed = 0;
  for (const row of targets) {
    const newAnswer = row.answer === '0' ? 'X' : 'O';
    const { error } = await supabase
      .from('quiz_questions')
      .update({ answer: newAnswer })
      .eq('id', row.id);
    if (error) {
      console.log(`  [ERROR V9] ${row.id}: ${error.message}`);
    } else {
      console.log(`  [FIX V9] ${row.id} — ox answer "${row.answer}"→"${newAnswer}"`);
      fixed++;
    }
  }
  return fixed;
}

// ─── distribution analysis ──────────────────────────────────────────────────

function distributionAnalysis(rows, label) {
  const diffCount = { 1: 0, 2: 0, 3: 0 };
  const typeCount = {};
  for (const r of rows) {
    if (r.difficulty) diffCount[r.difficulty] = (diffCount[r.difficulty] || 0) + 1;
    if (r.type) typeCount[r.type] = (typeCount[r.type] || 0) + 1;
  }
  const total = rows.length;
  console.log(`\n[분포 분석 — ${label}] 총 ${total}건`);
  console.log(`  난이도: D1=${diffCount[1]}(${Math.round(diffCount[1]/total*100)}%) D2=${diffCount[2]}(${Math.round(diffCount[2]/total*100)}%) D3=${diffCount[3]}(${Math.round(diffCount[3]/total*100)}%)`);
  console.log(`  유형: ${Object.entries(typeCount).map(([k,v])=>`${k}=${v}`).join(' ')}`);
  if (diffCount[1]/total > 0.9 || diffCount[2]/total > 0.9 || diffCount[3]/total > 0.9) {
    console.log(`  [WARNING] 난이도 편향 감지 — 한 레벨이 90%+ 이상`);
  }
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Data Validator (그린/GREEN) — hi-q127~146 + vi-q149~168 + 전체 DB 검증');
  console.log(`시각: ${new Date().toISOString()}`);

  // 대상 ID 생성
  const hiIds = Array.from({ length: 20 }, (_, i) => `hi-q${127 + i}`);
  const viIds = Array.from({ length: 20 }, (_, i) => `vi-q${149 + i}`);
  const targetIds = [...hiIds, ...viIds];

  console.log(`\n검증 대상 ID (40건):`);
  console.log(`  hi: ${hiIds.join(', ')}`);
  console.log(`  vi: ${viIds.join(', ')}`);

  // 1. 대상 배치 fetch
  console.log('\n[STEP 1] 대상 40건 fetch...');
  const targetRows = await fetchRows(targetIds);
  console.log(`  fetch 결과: ${targetRows.length}건`);

  // 존재 여부 확인
  const fetchedIds = new Set(targetRows.map(r => r.id));
  const missingIds = targetIds.filter(id => !fetchedIds.has(id));
  if (missingIds.length > 0) {
    console.log(`  [WARN] DB에 없는 ID (${missingIds.length}건): ${missingIds.join(', ')}`);
  }

  // 2. 대상 배치 검증
  console.log('\n[STEP 2] 대상 40건 검증...');
  const batchViolations = validateRows(targetRows, 'target-batch');

  // hi 분리 보고
  const hiRows = targetRows.filter(r => r.id.startsWith('hi-q'));
  const viRows = targetRows.filter(r => r.id.startsWith('vi-q'));
  const hiViolations = validateRows(hiRows, 'hi-q127~146');
  const viViolations = validateRows(viRows, 'vi-q149~168');

  printReport('hi-q127~146 (청각장애)', hiViolations, hiRows.length);
  printReport('vi-q149~168 (시각장애)', viViolations, viRows.length);

  distributionAnalysis(hiRows, 'hi-q127~146');
  distributionAnalysis(viRows, 'vi-q149~168');

  // 3. 자동 수정 가능 위반 처리
  if (batchViolations.length > 0) {
    console.log(`\n[STEP 3] 자동 수정 시도 (${batchViolations.length}건 위반)...`);
    let totalFixed = 0;

    // V8: options jsonb→text[]
    const v8Fixed = await fixV8(targetRows);
    totalFixed += v8Fixed;

    // V3: WE "4" 키 제거
    const v3Fixed = await fixV3(targetRows);
    totalFixed += v3Fixed;

    // V2: WE 정답 키 제거
    const v2Fixed = await fixV2(targetRows);
    totalFixed += v2Fixed;

    // V9: OX answer 변환
    const v9Fixed = await fixV9Ox(targetRows);
    totalFixed += v9Fixed;

    console.log(`  자동 수정 완료: ${totalFixed}건`);

    if (totalFixed > 0) {
      // 재검증
      console.log('\n[STEP 4] 수정 후 재검증...');
      const reRows = await fetchRows(targetIds.filter(id => fetchedIds.has(id)));
      const reHiRows = reRows.filter(r => r.id.startsWith('hi-q'));
      const reViRows = reRows.filter(r => r.id.startsWith('vi-q'));
      const reHiViolations = validateRows(reHiRows, 'hi-recheck');
      const reViViolations = validateRows(reViRows, 'vi-recheck');
      printReport('hi-q127~146 재검증', reHiViolations, reHiRows.length);
      printReport('vi-q149~168 재검증', reViViolations, reViRows.length);
    }
  }

  // 4. 전체 DB 검증
  console.log('\n[STEP 5] 전체 DB fetch...');
  const allRows = await fetchAllRows();
  console.log(`  전체 fetch: ${allRows.length}건`);

  console.log('\n[STEP 6] 전체 DB 검증 (V1~V10)...');
  const allViolations = validateRows(allRows, 'all-db');

  // 과목별 집계
  const bySubject = {};
  for (const v of allViolations) {
    const row = allRows.find(r => r.id === v.id);
    const subj = row ? row.subject : 'unknown';
    if (!bySubject[subj]) bySubject[subj] = [];
    bySubject[subj].push(v);
  }

  printReport('전체 DB', allViolations, allRows.length);

  if (allViolations.length > 0) {
    console.log('\n[전체 DB 과목별 위반 집계]');
    for (const [subj, vs] of Object.entries(bySubject)) {
      const byRule = {};
      for (const v of vs) byRule[v.rule] = (byRule[v.rule] || 0) + 1;
      console.log(`  ${subj}: ${vs.length}건 — ${Object.entries(byRule).map(([r,n])=>`${r}(${n})`).join(' ')}`);
    }
  }

  // 5. 분포 분석 (전체)
  distributionAnalysis(allRows, '전체 DB');

  // 6. 최종 판정
  const finalTarget = validateRows(
    await fetchRows(targetIds.filter(id => fetchedIds.has(id))),
    'final'
  );
  const remainingAll = allViolations.length;

  console.log('\n' + '='.repeat(60));
  console.log('최종 판정');
  console.log(`  대상 배치 (40건): ${finalTarget.length === 0 ? 'PASS' : `FAIL — ${finalTarget.length}건 위반 잔존`}`);
  console.log(`  전체 DB (${allRows.length}건): ${remainingAll === 0 ? 'PASS' : `HAS_ISSUES — ${remainingAll}건 위반`}`);

  if (finalTarget.length > 0) {
    console.log('\n[수동 수정 필요 — 대상 배치 잔존 위반]');
    for (const v of finalTarget) {
      console.log(`  ${v.id} [${v.rule}]: ${v.msg}`);
    }
  }
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
