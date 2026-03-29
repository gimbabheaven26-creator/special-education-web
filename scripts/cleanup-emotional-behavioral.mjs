/**
 * cleanup-emotional-behavioral.mjs
 * emotional-behavioral 빈 과목을 정리한다.
 *
 * 사전 조건: 33건 퀴즈가 behavior-support/ebd로 이미 이동 완료.
 * 동작:
 *   1. emotional-behavioral 과목에 남은 퀴즈/워크시트가 없는지 확인
 *   2. 빈 챕터 삭제
 *   3. subjects에서 emotional-behavioral 삭제
 *
 * 실행: node scripts/cleanup-emotional-behavioral.mjs [--dry-run]
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

const SUBJECT = 'emotional-behavioral';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`=== emotional-behavioral 과목 정리 ${DRY_RUN ? '(DRY RUN)' : ''} ===\n`);

  // Step 1: 잔여 데이터 확인
  console.log('[1/4] 잔여 데이터 확인...');

  const { data: quizzes } = await supabase
    .from('quiz_questions')
    .select('id')
    .eq('subject', SUBJECT);

  const { data: wsTopics } = await supabase
    .from('worksheet_topics')
    .select('id')
    .eq('subject', SUBJECT);

  const { data: wsQuestions } = await supabase
    .from('worksheet_questions')
    .select('id')
    .eq('subject', SUBJECT);

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, slug')
    .eq('subject_slug', SUBJECT);

  console.log(`  퀴즈: ${quizzes?.length ?? 0}건`);
  console.log(`  워크시트 토픽: ${wsTopics?.length ?? 0}건`);
  console.log(`  워크시트 문제: ${wsQuestions?.length ?? 0}건`);
  console.log(`  챕터: ${chapters?.length ?? 0}건`);

  if ((quizzes?.length ?? 0) > 0) {
    console.log('\n[중단] 아직 퀴즈가 남아있습니다. 먼저 이동하세요.');
    console.log('  남은 퀴즈 ID:', quizzes.map((q) => q.id).join(', '));
    process.exit(1);
  }

  if ((wsQuestions?.length ?? 0) > 0 || (wsTopics?.length ?? 0) > 0) {
    console.log('\n[중단] 워크시트 데이터가 남아있습니다.');
    process.exit(1);
  }

  // Step 2: 빈 챕터 삭제
  if (chapters && chapters.length > 0) {
    console.log(`\n[2/4] 빈 챕터 ${chapters.length}개 삭제...`);
    for (const ch of chapters) {
      console.log(`  삭제: chapters.id=${ch.id} slug="${ch.slug}"`);
    }
    if (!DRY_RUN) {
      const { error } = await supabase
        .from('chapters')
        .delete()
        .eq('subject_slug', SUBJECT);
      if (error) {
        console.error('  [ERROR] 챕터 삭제 실패:', error.message);
        process.exit(1);
      }
    }
  } else {
    console.log('\n[2/4] 삭제할 챕터 없음');
  }

  // Step 3: subjects에서 삭제
  console.log(`\n[3/4] subjects에서 "${SUBJECT}" 삭제...`);
  if (!DRY_RUN) {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('slug', SUBJECT);
    if (error) {
      console.error('  [ERROR] 과목 삭제 실패:', error.message);
      process.exit(1);
    }
  }

  // Step 4: 확인
  console.log(`\n[4/4] 확인...`);
  if (!DRY_RUN) {
    const { data: check } = await supabase
      .from('subjects')
      .select('slug')
      .eq('slug', SUBJECT);
    if (check && check.length === 0) {
      console.log(`  "${SUBJECT}" 삭제 확인 완료`);
    } else {
      console.log('  [경고] 삭제가 확인되지 않았습니다');
    }
  }

  console.log(`\n=== 결과 ===`);
  console.log(`emotional-behavioral 과목 정리 ${DRY_RUN ? '(DRY RUN — 실제 변경 없음)' : '완료'}`);
  console.log(`\n다음 단계:`);
  console.log(`  1. validate-data.mjs로 전체 검증`);
  console.log(`  2. contract.md에서 emotional-behavioral 관련 내용 업데이트`);
  console.log(`  3. 프론트엔드 과목 목록 확인 (11 → 10개)`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
