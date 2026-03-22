/**
 * Data Validator — 그린(GREEN)
 * 배치 검증: cd-q109~128, inc-q108~127, cur-q196~215
 * 2026-03-21
 *
 * 검증 항목:
 * 1. multiple answer: "0"/"1"/"2"/"3" (문자열)
 * 2. OX answer: "O" 또는 "X"
 * 3. fill_in/ox → wrong_explanations: null, options: null
 * 4. multiple wrong_explanations: 정답 키 포함 금지, "4" 키 금지
 * 5. wrong_explanations에 금지 문구 ("이 설명이 옳다", "옳은 설명이다", "정확하다", "맞다") 금지
 * 6. "옳지 않은 것" 유형: 정답 아닌 선지에 "이 선지는 옳은 내용이어서 정답이 아니다" 패턴 필요
 * 7. explanation NOT NULL, 30자 이상
 * 8. fill_in options: null
 * 9. descriptive: wrong_explanations null, options null
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// 검증 대상 ID 범위
const TARGETS = [
  // cd-q109 ~ cd-q128
  ...Array.from({ length: 20 }, (_, i) => `cd-q${109 + i}`),
  // inc-q108 ~ inc-q127
  ...Array.from({ length: 20 }, (_, i) => `inc-q${108 + i}`),
  // cur-q196 ~ cur-q215
  ...Array.from({ length: 20 }, (_, i) => `cur-q${196 + i}`),
];

const FORBIDDEN_PHRASES = [
  '이 설명이 옳다',
  '옳은 설명이다',
  '정확하다',
  '맞다',
];

// "옳지 않은 것" 유형 판별
function isNegativeType(question) {
  return (
    question.includes('옳지 않은') ||
    question.includes('틀린') ||
    question.includes('바르지 않은') ||
    question.includes('적절하지 않은') ||
    question.includes('잘못된') ||
    question.includes('아닌 것')
  );
}

function checkForbiddenPhrases(text) {
  if (!text) return [];
  return FORBIDDEN_PHRASES.filter((p) => text.includes(p));
}

async function main() {
  console.log('=== Data Validator — 배치 검증 2026-03-21b ===\n');
  console.log('대상 IDs:', TARGETS.join(', '));
  console.log(`총 ${TARGETS.length}건\n`);

  // Fetch all target rows
  const { data: rows, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('id', TARGETS)
    .order('id');

  if (error) {
    console.error('DB 조회 오류:', error);
    process.exit(1);
  }

  // 삽입 확인
  const fetchedIds = new Set(rows.map((r) => r.id));
  const missingIds = TARGETS.filter((id) => !fetchedIds.has(id));
  if (missingIds.length > 0) {
    console.warn('⚠️  DB에 없는 ID (미삽입):', missingIds.join(', '));
    console.log();
  } else {
    console.log(`✓ 전체 ${TARGETS.length}건 DB 삽입 확인\n`);
  }

  const violations = [];

  for (const row of rows) {
    const { id, type, answer, options, wrong_explanations, explanation, question } = row;

    // ── V1: multiple answer 검증 ──────────────────────────────────────────
    if (type === 'multiple') {
      if (!['0', '1', '2', '3'].includes(answer)) {
        violations.push({
          id,
          rule: 'V1',
          desc: `multiple answer 비정상값: "${answer}"`,
          field: 'answer',
          current: answer,
        });
      }
    }

    // ── V2: OX answer 검증 ───────────────────────────────────────────────
    if (type === 'ox') {
      if (!['O', 'X'].includes(answer)) {
        violations.push({
          id,
          rule: 'V2',
          desc: `ox answer 비정상값: "${answer}" (should be "O" or "X")`,
          field: 'answer',
          current: answer,
        });
      }
    }

    // ── V3: fill_in/ox → wrong_explanations null, options null ───────────
    if (type === 'fill_in' || type === 'ox') {
      if (wrong_explanations !== null) {
        violations.push({
          id,
          rule: 'V3',
          desc: `${type} 타입인데 wrong_explanations NOT NULL: ${JSON.stringify(wrong_explanations)}`,
          field: 'wrong_explanations',
          current: wrong_explanations,
          fix: null,
        });
      }
      if (options !== null) {
        violations.push({
          id,
          rule: 'V3',
          desc: `${type} 타입인데 options NOT NULL: ${JSON.stringify(options)}`,
          field: 'options',
          current: options,
          fix: null,
        });
      }
    }

    // ── V4: descriptive → wrong_explanations null, options null ─────────
    if (type === 'descriptive') {
      if (wrong_explanations !== null) {
        violations.push({
          id,
          rule: 'V4',
          desc: `descriptive 타입인데 wrong_explanations NOT NULL`,
          field: 'wrong_explanations',
          current: wrong_explanations,
          fix: null,
        });
      }
      if (options !== null) {
        violations.push({
          id,
          rule: 'V4',
          desc: `descriptive 타입인데 options NOT NULL`,
          field: 'options',
          current: options,
          fix: null,
        });
      }
    }

    // ── V5: multiple wrong_explanations 검증 ─────────────────────────────
    if (type === 'multiple' && wrong_explanations !== null) {
      const we = wrong_explanations;
      const weKeys = Object.keys(we);

      // V5a: 키 범위 ("4" 이상 금지)
      const invalidKeys = weKeys.filter((k) => !['0', '1', '2', '3'].includes(k));
      if (invalidKeys.length > 0) {
        violations.push({
          id,
          rule: 'V5a',
          desc: `wrong_explanations 허용 범위 밖 키: [${invalidKeys.join(', ')}]`,
          field: 'wrong_explanations',
          current: we,
          invalidKeys,
        });
      }

      // V5b: 정답 키 포함 금지
      if (weKeys.includes(answer)) {
        violations.push({
          id,
          rule: 'V5b',
          desc: `wrong_explanations에 정답 키 포함: answer="${answer}"가 WE 키에 존재`,
          field: 'wrong_explanations',
          current: we,
          answerKey: answer,
        });
      }
    }

    // ── V6: wrong_explanations 금지 문구 ─────────────────────────────────
    if (wrong_explanations !== null && type === 'multiple') {
      const we = wrong_explanations;
      const isNeg = isNegativeType(question);

      for (const [key, text] of Object.entries(we)) {
        if (typeof text !== 'string') continue;

        const found = checkForbiddenPhrases(text);

        if (isNeg) {
          // "옳지 않은 것" 유형: WE 텍스트에 금지 문구 있어도 접두어가 있으면 OK
          const hasPrefix = text.startsWith('이 선지는 옳은 내용이어서 정답이 아니다');
          if (found.length > 0 && !hasPrefix) {
            violations.push({
              id,
              rule: 'V6',
              desc: `"옳지 않은 것" 유형 WE[${key}] — 접두어 없이 금지 문구: ${found.join(', ')}`,
              field: `wrong_explanations[${key}]`,
              current: text,
            });
          }
        } else {
          // 일반 유형: 금지 문구 절대 금지
          if (found.length > 0) {
            violations.push({
              id,
              rule: 'V6',
              desc: `WE[${key}] 금지 문구 포함: ${found.join(', ')}`,
              field: `wrong_explanations[${key}]`,
              current: text,
            });
          }
        }
      }
    }

    // ── V7: explanation NOT NULL, 30자 이상 ──────────────────────────────
    if (!explanation) {
      violations.push({
        id,
        rule: 'V7',
        desc: 'explanation NULL 또는 빈 문자열',
        field: 'explanation',
        current: explanation,
      });
    } else if (explanation.length < 30) {
      violations.push({
        id,
        rule: 'V7',
        desc: `explanation 30자 미만: ${explanation.length}자 — "${explanation}"`,
        field: 'explanation',
        current: explanation,
      });
    }

    // ── V8: multiple options 정확히 4개 ──────────────────────────────────
    if (type === 'multiple') {
      if (!options || !Array.isArray(options)) {
        violations.push({
          id,
          rule: 'V8',
          desc: 'multiple 타입인데 options NULL 또는 배열 아님',
          field: 'options',
          current: options,
        });
      } else if (options.length !== 4) {
        violations.push({
          id,
          rule: 'V8',
          desc: `multiple options 4개 아님: ${options.length}개`,
          field: 'options',
          current: options,
        });
      }
    }
  }

  // ── 결과 출력 ────────────────────────────────────────────────────────────
  console.log('='.repeat(60));
  console.log(`검증 완료 — ${rows.length}건 검사, ${violations.length}건 위반`);
  console.log('='.repeat(60));

  if (violations.length === 0) {
    console.log('\n✓ CLEAN — 모든 항목 통과\n');
    return { violations: [] };
  }

  // 규칙별 그룹화
  const byRule = {};
  for (const v of violations) {
    if (!byRule[v.rule]) byRule[v.rule] = [];
    byRule[v.rule].push(v);
  }

  const ruleNames = {
    V1: 'multiple answer 값 ("0"~"3")',
    V2: 'OX answer 값 ("O"/"X")',
    V3: 'fill_in/ox wrong_explanations·options null 필요',
    V4: 'descriptive wrong_explanations·options null 필요',
    V5a: 'wrong_explanations 키 범위 초과 (>="4")',
    V5b: 'wrong_explanations 정답 키 포함 금지',
    V6: 'wrong_explanations 금지 문구',
    V7: 'explanation 미존재/30자 미만',
    V8: 'multiple options 4개',
  };

  for (const [rule, list] of Object.entries(byRule)) {
    console.log(`\n[${rule}] ${ruleNames[rule] || rule} — ${list.length}건`);
    for (const v of list) {
      console.log(`  ${v.id}: ${v.desc}`);
      if (v.current !== undefined && rule !== 'V7') {
        const display = typeof v.current === 'object'
          ? JSON.stringify(v.current).substring(0, 120)
          : String(v.current).substring(0, 120);
        console.log(`    현재값: ${display}`);
      }
    }
  }

  return { violations, rows };
}

// ── UPDATE 수정 함수 ────────────────────────────────────────────────────────
async function applyFixes(violations, rows) {
  if (violations.length === 0) return;

  const rowMap = Object.fromEntries(rows.map((r) => [r.id, r]));
  const updates = {};  // id → patch object

  for (const v of violations) {
    const row = rowMap[v.id];
    if (!row) continue;

    if (!updates[v.id]) updates[v.id] = {};

    // V2: OX answer "0"→"X", "1"→"O"
    if (v.rule === 'V2') {
      const fixed = v.current === '0' ? 'X' : v.current === '1' ? 'O' : null;
      if (fixed) {
        updates[v.id].answer = fixed;
        console.log(`  FIX V2 ${v.id}: answer "${v.current}" → "${fixed}"`);
      } else {
        console.warn(`  SKIP V2 ${v.id}: answer "${v.current}" — 자동 변환 불가`);
      }
    }

    // V3: fill_in/ox wrong_explanations → null, options → null
    if (v.rule === 'V3') {
      if (v.field === 'wrong_explanations') updates[v.id].wrong_explanations = null;
      if (v.field === 'options') updates[v.id].options = null;
      console.log(`  FIX V3 ${v.id}: ${v.field} → null`);
    }

    // V4: descriptive wrong_explanations → null, options → null
    if (v.rule === 'V4') {
      if (v.field === 'wrong_explanations') updates[v.id].wrong_explanations = null;
      if (v.field === 'options') updates[v.id].options = null;
      console.log(`  FIX V4 ${v.id}: ${v.field} → null`);
    }

    // V5a: wrong_explanations 허용 범위 밖 키 제거
    if (v.rule === 'V5a') {
      const we = { ...row.wrong_explanations, ...(updates[v.id].wrong_explanations || {}) };
      for (const k of v.invalidKeys) {
        delete we[k];
      }
      updates[v.id].wrong_explanations = we;
      console.log(`  FIX V5a ${v.id}: WE 키 [${v.invalidKeys.join(', ')}] 제거`);
    }

    // V5b: wrong_explanations 정답 키 제거
    if (v.rule === 'V5b') {
      const we = { ...(updates[v.id].wrong_explanations || row.wrong_explanations) };
      delete we[v.answerKey];
      updates[v.id].wrong_explanations = we;
      console.log(`  FIX V5b ${v.id}: WE 정답 키 "${v.answerKey}" 제거`);
    }
  }

  // V1 (multiple answer 비정상) — 자동 수정 불가, 수동 필요
  const v1Violations = violations.filter((v) => v.rule === 'V1');
  if (v1Violations.length > 0) {
    console.log('\n  [수동 필요] V1 multiple answer 비정상값:');
    for (const v of v1Violations) {
      console.log(`    ${v.id}: "${v.current}" — options 확인 후 수동 수정 필요`);
    }
  }

  // V6 (금지 문구) — 수동 재작성 필요
  const v6Violations = violations.filter((v) => v.rule === 'V6');
  if (v6Violations.length > 0) {
    console.log('\n  [수동 필요] V6 wrong_explanations 금지 문구:');
    for (const v of v6Violations) {
      console.log(`    ${v.id} ${v.field}: "${v.current?.substring(0, 100)}"`);
    }
  }

  // V7 (explanation) — 수동 필요
  const v7Violations = violations.filter((v) => v.rule === 'V7');
  if (v7Violations.length > 0) {
    console.log('\n  [수동 필요] V7 explanation 미달:');
    for (const v of v7Violations) {
      console.log(`    ${v.id}: ${v.desc}`);
    }
  }

  // DB UPDATE 실행
  const patchIds = Object.keys(updates);
  const autoFixCount = patchIds.length;

  if (autoFixCount === 0) {
    console.log('\n  자동 수정 대상 없음');
    return;
  }

  console.log(`\n  자동 수정 ${autoFixCount}건 UPDATE 실행...`);
  let successCount = 0;
  let failCount = 0;

  for (const [id, patch] of Object.entries(updates)) {
    const { error } = await supabase
      .from('quiz_questions')
      .update(patch)
      .eq('id', id);

    if (error) {
      console.error(`  ERROR ${id}:`, error.message);
      failCount++;
    } else {
      console.log(`  ✓ UPDATE ${id}: ${Object.keys(patch).join(', ')}`);
      successCount++;
    }
  }

  console.log(`\n  자동 수정 결과: ${successCount}건 성공, ${failCount}건 실패`);
}

// ── 재검증 ──────────────────────────────────────────────────────────────────
async function revalidate() {
  console.log('\n=== 재검증 ===\n');
  const { data: rows, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('id', TARGETS)
    .order('id');

  if (error) {
    console.error('재검증 조회 오류:', error);
    return;
  }

  const violations = [];

  for (const row of rows) {
    const { id, type, answer, options, wrong_explanations, explanation, question } = row;

    if (type === 'multiple' && !['0', '1', '2', '3'].includes(answer)) {
      violations.push({ id, rule: 'V1', desc: `answer: "${answer}"` });
    }
    if (type === 'ox' && !['O', 'X'].includes(answer)) {
      violations.push({ id, rule: 'V2', desc: `answer: "${answer}"` });
    }
    if ((type === 'fill_in' || type === 'ox') && wrong_explanations !== null) {
      violations.push({ id, rule: 'V3', desc: 'wrong_explanations not null' });
    }
    if ((type === 'fill_in' || type === 'ox') && options !== null) {
      violations.push({ id, rule: 'V3', desc: 'options not null' });
    }
    if (type === 'descriptive' && wrong_explanations !== null) {
      violations.push({ id, rule: 'V4', desc: 'WE not null' });
    }
    if (type === 'descriptive' && options !== null) {
      violations.push({ id, rule: 'V4', desc: 'options not null' });
    }
    if (type === 'multiple' && wrong_explanations) {
      const weKeys = Object.keys(wrong_explanations);
      const invalid = weKeys.filter((k) => !['0', '1', '2', '3'].includes(k));
      if (invalid.length) violations.push({ id, rule: 'V5a', desc: `키: [${invalid.join(',')}]` });
      if (weKeys.includes(answer)) violations.push({ id, rule: 'V5b', desc: `정답키 ${answer}` });
    }
    if (type === 'multiple' && wrong_explanations) {
      const isNeg = isNegativeType(question);
      for (const [key, text] of Object.entries(wrong_explanations)) {
        if (typeof text !== 'string') continue;
        const found = checkForbiddenPhrases(text);
        if (found.length > 0) {
          const hasPrefix = text.startsWith('이 선지는 옳은 내용이어서 정답이 아니다');
          if (!isNeg || !hasPrefix) {
            violations.push({ id, rule: 'V6', desc: `WE[${key}] 금지문구: ${found.join(',')}` });
          }
        }
      }
    }
    if (!explanation || explanation.length < 30) {
      violations.push({ id, rule: 'V7', desc: `explanation ${explanation?.length ?? 0}자` });
    }
    if (type === 'multiple' && (!options || options.length !== 4)) {
      violations.push({ id, rule: 'V8', desc: `options ${options?.length ?? 'null'}개` });
    }
  }

  if (violations.length === 0) {
    console.log('✓ 재검증 CLEAN — 모든 항목 통과\n');
  } else {
    console.log(`재검증 ${violations.length}건 잔존 위반:`);
    for (const v of violations) {
      console.log(`  ${v.id} [${v.rule}]: ${v.desc}`);
    }
  }
  return violations;
}

// ── 실행 ────────────────────────────────────────────────────────────────────
const { violations, rows } = await main();

if (violations && violations.length > 0) {
  console.log('\n=== 자동 수정 시작 ===\n');
  await applyFixes(violations, rows);
  await revalidate();
} else {
  console.log('\n위반 없음 — 수정 불필요\n');
}
