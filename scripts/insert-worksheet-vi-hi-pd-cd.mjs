/**
 * insert-worksheet-vi-hi-pd-cd.mjs
 * 시각장애·청각장애·지체장애·의사소통장애 워크시트 토픽 + 문항 삽입
 * 실행: node scripts/insert-worksheet-vi-hi-pd-cd.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// .env.local에서 환경변수 읽기
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp('^' + k + '=(.+)$', 'm'))?.[1]?.trim();

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co';
const SERVICE_ROLE_KEY = get('SUPABASE_SERVICE_ROLE_KEY');

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log('=== 워크시트 데이터 삽입 (VI/HI/PD/CD) ===\n');

  // Step 1: 토픽 upsert
  console.log('[1/3] 토픽 삽입 중...');
  const topicsPath = new URL('../data/worksheets/vi-hi-pd-cd-topics.json', import.meta.url);
  const topics = JSON.parse(readFileSync(topicsPath, 'utf8'));

  const { error: topicError } = await supabase
    .from('worksheet_topics')
    .upsert(topics, { onConflict: 'id' });

  if (topicError) {
    console.error('토픽 삽입 실패:', topicError.message);
    process.exit(1);
  }
  console.log(`  ${topics.length}개 토픽 삽입 완료`);

  // Step 2: 문항 upsert (50개씩 배치)
  console.log('\n[2/3] 문항 삽입 중...');
  const questionsPath = new URL('../data/worksheets/vi-hi-pd-cd-questions.json', import.meta.url);
  const questions = JSON.parse(readFileSync(questionsPath, 'utf8'));

  let inserted = 0;
  const errors = [];

  for (let i = 0; i < questions.length; i += 50) {
    const batch = questions.slice(i, i + 50);
    const { error } = await supabase
      .from('worksheet_questions')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      errors.push({ batch: `${i + 1}~${i + batch.length}`, error: error.message });
      console.error(`  배치 ${i + 1}~${i + batch.length} 실패: ${error.message}`);
    } else {
      inserted += batch.length;
      console.log(`  배치 ${i + 1}~${i + batch.length}: ${batch.length}문항 삽입`);
    }
  }

  // Step 3: 결과 요약
  console.log('\n[3/3] 결과 요약');
  console.log('==============================');
  console.log(`  토픽: ${topics.length}개 삽입`);
  console.log(`  문항: ${inserted}/${questions.length}개 삽입`);
  if (errors.length > 0) {
    console.log(`  오류: ${errors.length}건`);
    for (const e of errors) {
      console.log(`    - 배치 ${e.batch}: ${e.error}`);
    }
  } else {
    console.log('  오류: 0건');
  }

  // 과목별 분포 확인
  const subjectCounts = {};
  const typeCounts = { fill_in: 0, descriptive: 0 };
  const diffCounts = { 1: 0, 2: 0, 3: 0 };

  for (const q of questions) {
    subjectCounts[q.subject] = (subjectCounts[q.subject] || 0) + 1;
    typeCounts[q.type]++;
    diffCounts[q.difficulty]++;
  }

  console.log('\n  과목별 문항 수:');
  for (const [subject, count] of Object.entries(subjectCounts)) {
    console.log(`    ${subject}: ${count}문항`);
  }

  console.log('\n  유형별 분포:');
  console.log(`    fill_in: ${typeCounts.fill_in}문항`);
  console.log(`    descriptive: ${typeCounts.descriptive}문항`);

  console.log('\n  난이도별 분포:');
  console.log(`    기초(1): ${diffCounts[1]}문항`);
  console.log(`    중급(2): ${diffCounts[2]}문항`);
  console.log(`    심화(3): ${diffCounts[3]}문항`);

  // DB 검증
  console.log('\n=== DB 검증 ===');
  const { count: topicCount } = await supabase
    .from('worksheet_topics')
    .select('*', { count: 'exact', head: true });
  console.log(`  worksheet_topics 전체: ${topicCount}개`);

  const { count: questionCount } = await supabase
    .from('worksheet_questions')
    .select('*', { count: 'exact', head: true });
  console.log(`  worksheet_questions 전체: ${questionCount}개`);
}

main().catch(err => {
  console.error('스크립트 오류:', err);
  process.exit(1);
});
