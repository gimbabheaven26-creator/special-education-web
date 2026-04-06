/**
 * T-11: quiz_questions display_id 배치 할당 스크립트
 * 과목별 created_at ASC 정렬 → {한국어과목명}-{3자리순번} 형식으로 할당
 * 예: 청각장애-001, 시각장애-042
 */

import { getClient } from './lib/supabase-client.mjs';

const sb = getClient();

const SUBJECT_LABELS = {
  'assessment':              '진단평가',
  'behavior-support':        '행동수정',
  'communication-disorder':  '의사소통',
  'curriculum':              '교육과정',
  'inclusive-education':     '통합교육',
  'introduction':            '개론',
  'laws':                    '특수교육법',
  'physical-disability':     '지체장애',
  'transition':              '전환교육',
  'visual-impairment':       '시각장애',
  'hearing-impairment':      '청각장애',
};

const PAGE_SIZE = 1000;
const CONCURRENCY = 20; // 동시 업데이트 수

async function fetchAll(subject) {
  const rows = [];
  let offset = 0;
  while (true) {
    const { data, error } = await sb
      .from('quiz_questions')
      .select('id, created_at')
      .eq('subject', subject)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);
    if (error) throw new Error(`fetchAll error for ${subject}: ${error.message}`);
    if (!data || data.length === 0) break;
    rows.push(...data);
    if (data.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }
  return rows;
}

async function updateOne(id, displayId) {
  const { error } = await sb
    .from('quiz_questions')
    .update({ display_id: displayId })
    .eq('id', id);
  if (error) throw new Error(`update error for ${id}: ${error.message}`);
}

async function runWithConcurrency(tasks, limit) {
  const results = [];
  let idx = 0;
  async function worker() {
    while (idx < tasks.length) {
      const i = idx++;
      results[i] = await tasks[i]();
    }
  }
  const workers = Array.from({ length: limit }, worker);
  await Promise.all(workers);
  return results;
}

async function main() {
  let totalUpdated = 0;

  for (const [subject, label] of Object.entries(SUBJECT_LABELS)) {
    const rows = await fetchAll(subject);
    if (rows.length === 0) {
      console.log(`[SKIP] ${subject}: 문항 없음`);
      continue;
    }

    const tasks = rows.map((row, idx) => () =>
      updateOne(row.id, `${label}-${String(idx + 1).padStart(3, '0')}`)
    );

    await runWithConcurrency(tasks, CONCURRENCY);

    totalUpdated += rows.length;
    console.log(`[OK] ${subject} (${label}): ${rows.length}문항 → ${label}-001 ~ ${label}-${String(rows.length).padStart(3,'0')}`);
  }

  // NULL 잔존 확인
  const { count: nullCount } = await sb
    .from('quiz_questions')
    .select('id', { count: 'exact' })
    .is('display_id', null)
    .limit(0);

  console.log('\n=== 완료 ===');
  console.log(`총 할당: ${totalUpdated}건`);
  console.log(`display_id NULL 잔존: ${nullCount}건`);

  if (nullCount && nullCount > 0) {
    const { data: nullRows } = await sb
      .from('quiz_questions')
      .select('id, subject')
      .is('display_id', null)
      .limit(10);
    console.log('NULL 샘플:', nullRows?.map(r => r.id));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
