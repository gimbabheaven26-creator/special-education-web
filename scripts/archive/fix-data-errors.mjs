/**
 * fix-data-errors.mjs
 * data-validator 오류 일괄 수정
 * - OX answer "0"/"1" → "O"/"X"
 * - multiple answer 텍스트 → options 인덱스
 * - answer/WE 키 "4" → "3" (1-indexed 오입력 수정)
 * - WE에 answer 키 포함된 경우 제거
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DRY_RUN = process.argv.includes('--dry-run');

let fixed = 0, skipped = 0;

async function update(id, patch) {
  if (DRY_RUN) {
    console.log(`[dry] ${id}:`, JSON.stringify(patch));
    return;
  }
  const { error } = await sb.from('quiz_questions').update(patch).eq('id', id);
  if (error) {
    console.error(`❌ ${id}: ${error.message}`);
    skipped++;
  } else {
    console.log(`✅ ${id}`);
    fixed++;
  }
}

// ── 1. OX answer "0"→"O", "1"→"X" ──────────────────────────────────────────
console.log('\n■ 1. OX answer 수정 ("0"→"O", "1"→"X")');
const oxIds = [
  'intro-q138','intro-q145','intro-q151','intro-q156','intro-q162','intro-q166',
  'cur-q131','cur-q136',
  'bs-q147',
  'cd-q74',
  'hi-q77',
  'pd-q73',
  'trans-q117',
  'vi-q93','vi-q98',
];
const { data: oxData } = await sb.from('quiz_questions')
  .select('id,answer').in('id', oxIds);
for (const r of oxData) {
  const newAnswer = r.answer === '0' ? 'O' : r.answer === '1' ? 'X' : null;
  if (!newAnswer) { console.log(`  skip ${r.id}: answer="${r.answer}" 이미 정상`); continue; }
  await update(r.id, { answer: newAnswer });
}

// ── 2. multiple: 텍스트 answer → options 인덱스 변환 ────────────────────────
console.log('\n■ 2. multiple answer 텍스트 → 인덱스 변환');
const textAnswerIds = [
  'pd-q7','pd-q12','pd-q2',
  'cd-q2','cd-q10','cd-q16','cd-q33',  // cd-q33은 answer="4"이므로 아래서 처리
  'hi-q3','hi-q11','hi-q15',
  'vi-q4','vi-q19',
  'laws-q54','laws-q73',  // "4"이므로 아래서 처리
];
// cd-q33, laws-q54, laws-q73, asmnt-q32, vi-q36는 "4" 케이스 → 아래에서 처리

const textMultiIds = ['pd-q7','pd-q12','pd-q2','cd-q2','cd-q10','cd-q16','hi-q3','hi-q11','hi-q15','vi-q4','vi-q19'];
const { data: textMultiData } = await sb.from('quiz_questions')
  .select('id,type,answer,options,wrong_explanations').in('id', textMultiIds);

for (const r of textMultiData) {
  if (!r.options || !Array.isArray(r.options)) {
    console.log(`  skip ${r.id}: options 없음`);
    continue;
  }
  // answer가 이미 숫자 인덱스면 건너뜀
  if (['0','1','2','3'].includes(r.answer)) {
    console.log(`  skip ${r.id}: answer="${r.answer}" 이미 인덱스 형식`);
    continue;
  }
  const answerIdx = r.options.indexOf(r.answer);
  if (answerIdx === -1) {
    console.log(`  ⚠️  ${r.id}: answer="${r.answer.slice(0,20)}..." 옵션에서 못 찾음`);
    skipped++;
    continue;
  }
  const newAnswer = String(answerIdx);

  // WE 키도 텍스트면 인덱스로 변환
  let newWE = r.wrong_explanations;
  if (newWE && typeof newWE === 'object') {
    const keys = Object.keys(newWE);
    const allText = keys.every(k => !['0','1','2','3'].includes(k));
    if (allText) {
      const converted = {};
      for (const k of keys) {
        const idx = r.options.indexOf(k);
        if (idx === -1) {
          console.log(`    ⚠️  ${r.id} WE 키 "${k.slice(0,15)}..." 옵션에서 못 찾음 → 스킵`);
          continue;
        }
        if (String(idx) !== newAnswer) {  // 정답 키는 WE에 포함 안 함
          converted[String(idx)] = newWE[k];
        }
      }
      newWE = converted;
    }
  }

  await update(r.id, { answer: newAnswer, wrong_explanations: newWE });
}

// ── 3. answer/WE 키 "4" → "3" (1-indexed 오류) ─────────────────────────────
console.log('\n■ 3. answer "4" → "3" 수정');
const fourAnswerIds = ['cd-q33','laws-q54','laws-q73','asmnt-q32','vi-q36'];
const { data: fourData } = await sb.from('quiz_questions')
  .select('id,answer,wrong_explanations').in('id', fourAnswerIds);
for (const r of fourData) {
  const patch = {};
  if (r.answer === '4') patch.answer = '3';

  let newWE = r.wrong_explanations;
  if (newWE && typeof newWE === 'object' && '4' in newWE) {
    newWE = { ...newWE };
    newWE['3'] = newWE['4'];
    delete newWE['4'];
    patch.wrong_explanations = newWE;
  }

  if (Object.keys(patch).length === 0) {
    console.log(`  skip ${r.id}: 이미 수정됨`);
    continue;
  }
  await update(r.id, patch);
}

// WE 키 "4" 포함된 나머지 레코드들 (answer는 이미 정상인데 WE 키만 "4"인 경우)
console.log('\n■ 3b. WE 키 "4" → "3" (answer 정상, WE만 오류)');
const { data: weKeyData } = await sb.from('quiz_questions')
  .select('id,answer,wrong_explanations')
  .not('wrong_explanations', 'is', null)
  .limit(3000);

const weKeyFourCases = weKeyData.filter(r => {
  if (!r.wrong_explanations) return false;
  const keys = Object.keys(r.wrong_explanations);
  return keys.includes('4') && !fourAnswerIds.includes(r.id);  // 위에서 처리한 것 제외
});

console.log(`  WE "4" 키 케이스 (추가): ${weKeyFourCases.length}건`);
for (const r of weKeyFourCases) {
  const newWE = { ...r.wrong_explanations };
  if ('4' in newWE && !('3' in newWE)) {
    newWE['3'] = newWE['4'];
    delete newWE['4'];
    await update(r.id, { wrong_explanations: newWE });
  } else if ('4' in newWE && '3' in newWE) {
    delete newWE['4'];
    await update(r.id, { wrong_explanations: newWE });
  }
}

// ── 4. WE에 answer 키 포함 → 제거 ──────────────────────────────────────────
console.log('\n■ 4. WE 정답 키 제거');
const { data: allWEData } = await sb.from('quiz_questions')
  .select('id,answer,wrong_explanations')
  .not('wrong_explanations', 'is', null)
  .limit(3000);

const answerKeyInWE = allWEData.filter(r => {
  if (!r.wrong_explanations || !r.answer) return false;
  return ['0','1','2','3'].includes(r.answer) && Object.keys(r.wrong_explanations).includes(r.answer);
});
console.log(`  정답 키 포함 케이스: ${answerKeyInWE.length}건`);
for (const r of answerKeyInWE) {
  const newWE = { ...r.wrong_explanations };
  delete newWE[r.answer];
  await update(r.id, { wrong_explanations: newWE });
}

// ── 완료 ────────────────────────────────────────────────────────────────────
if (DRY_RUN) {
  console.log('\n[DRY-RUN] 실제 수정 없음');
} else {
  console.log(`\n완료: 수정 ${fixed}건 / 실패 ${skipped}건`);
}
