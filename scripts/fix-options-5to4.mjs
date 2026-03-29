/**
 * fix-options-5to4.mjs
 * 선택지 5개인 객관식 문제를 4개로 수정한다.
 * contract.md 규칙: multiple 타입은 정확히 4개 선택지
 *
 * 실행: node scripts/fix-options-5to4.mjs [--dry-run]
 * --dry-run: 수정 대상만 출력, DB 변경 없음
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = (k) => env.match(new RegExp('^' + k + '=(.+)$', 'm'))?.[1]?.trim();

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co';
const SERVICE_ROLE_KEY = get('SUPABASE_SERVICE_ROLE_KEY');

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DRY_RUN = process.argv.includes('--dry-run');

async function fetchAll(table, columns = '*') {
  const PAGE_SIZE = 1000;
  let rows = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(`${table} fetch error: ${error.message}`);
    if (!data || data.length === 0) break;
    rows = rows.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

async function main() {
  console.log(`=== 선택지 5→4 수정 ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  // Step 1: 선택지 5개인 문제 찾기
  const quizzes = await fetchAll('quiz_questions', 'id,subject,type,options,answer,wrong_explanations');
  const targets = quizzes.filter(
    (q) => q.type === 'multiple' && Array.isArray(q.options) && q.options.length === 5
  );

  console.log(`전체 객관식: ${quizzes.filter((q) => q.type === 'multiple').length}건`);
  console.log(`선택지 5개: ${targets.length}건\n`);

  if (targets.length === 0) {
    console.log('수정 대상 없음. 종료.');
    return;
  }

  // Step 2: 각 문제 분석 + 수정
  let fixed = 0;
  let needsReview = 0;

  for (const q of targets) {
    const answerIdx = parseInt(q.answer, 10);

    console.log(`[${q.id}] subject=${q.subject} answer="${q.answer}" options=${q.options.length}`);

    if (answerIdx <= 3) {
      // 정답이 0~3 범위 → 5번째(index 4) 선택지를 제거
      const newOptions = q.options.slice(0, 4);

      // wrong_explanations에서 "4" 키 제거
      let newWE = q.wrong_explanations;
      if (newWE && typeof newWE === 'object' && '4' in newWE) {
        newWE = { ...newWE };
        delete newWE['4'];
      }

      console.log(`  → 5번째 선택지 제거: "${q.options[4]?.slice(0, 40)}..."`);

      if (!DRY_RUN) {
        const { error } = await supabase
          .from('quiz_questions')
          .update({
            options: newOptions,
            wrong_explanations: newWE,
          })
          .eq('id', q.id);

        if (error) {
          console.error(`  [ERROR] ${q.id}: ${error.message}`);
          continue;
        }
      }
      fixed++;
    } else if (answerIdx === 4) {
      // 정답이 5번째 선택지 → 재배치 필요
      // 전략: 5번째(정답)를 index 0으로 이동, 기존 0번(오답)을 제거
      const correctOption = q.options[4];
      const wrongOptions = q.options.slice(0, 4);

      // 0번을 제거하고, 정답을 0번 위치에 삽입
      const newOptions = [correctOption, ...wrongOptions.slice(1)];
      const newAnswer = '0';

      // wrong_explanations 키 조정:
      // 기존: "0","1","2","3" 중 오답 해설 (4가 정답이므로 0~3 모두 오답)
      // 새로: 0이 정답이므로 1,2,3이 오답
      let newWE = null;
      if (q.wrong_explanations && typeof q.wrong_explanations === 'object') {
        newWE = {};
        // 기존 key 1→1, 2→2, 3→3 (0번은 제거했으므로 0번 해설은 드랍)
        if (q.wrong_explanations['1']) newWE['1'] = q.wrong_explanations['1'];
        if (q.wrong_explanations['2']) newWE['2'] = q.wrong_explanations['2'];
        if (q.wrong_explanations['3']) newWE['3'] = q.wrong_explanations['3'];
        if (Object.keys(newWE).length === 0) newWE = null;
      }

      console.log(`  → 정답이 5번째! 재배치: "${correctOption?.slice(0, 40)}..." → index 0`);
      console.log(`  → 제거된 오답: "${wrongOptions[0]?.slice(0, 40)}..."`);

      if (!DRY_RUN) {
        const { error } = await supabase
          .from('quiz_questions')
          .update({
            options: newOptions,
            answer: newAnswer,
            wrong_explanations: newWE,
          })
          .eq('id', q.id);

        if (error) {
          console.error(`  [ERROR] ${q.id}: ${error.message}`);
          continue;
        }
      }
      fixed++;
      needsReview++;
    } else {
      console.log(`  [SKIP] 예상치 못한 answer 값: "${q.answer}"`);
    }
  }

  console.log(`\n=== 결과 ===`);
  console.log(`수정: ${fixed}/${targets.length}건${DRY_RUN ? ' (DRY RUN — 실제 변경 없음)' : ''}`);
  if (needsReview > 0) {
    console.log(`[주의] ${needsReview}건은 정답이 5번째 선택지여서 재배치됨 — 도메인 검증 권장`);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
