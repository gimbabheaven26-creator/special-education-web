/**
 * audit-fill-in.mjs
 * 단답형(fill_in) 문항 현황 진단
 * 실행: node scripts/audit-fill-in.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false }
});

let page = 0, all = [];
while (true) {
  const { data } = await sb.from('quiz_questions')
    .select('id,subject,chapter,question,answer,explanation')
    .eq('type', 'fill_in')
    .range(page * 1000, (page + 1) * 1000 - 1);
  if (!data || data.length === 0) break;
  all = all.concat(data);
  page++;
}

console.log(`\n=== fill_in 단답형 현황 진단 ===`);
console.log(`총 fill_in 문항: ${all.length}건\n`);

// 과목별 분포
const bySubject = {};
for (const r of all) {
  bySubject[r.subject] = (bySubject[r.subject] || 0) + 1;
}
console.log('── 과목별 분포 ──');
for (const [s, n] of Object.entries(bySubject).sort((a,b) => b[1]-a[1])) {
  console.log(`  ${s.padEnd(25)} ${n}건`);
}

// "긴 문항" 판별: 문장 수 3개 이상 OR 줄바꿈 포함 OR 150자 초과
function isLong(q) {
  if (q.includes('\n')) return true;
  const sentences = q.split(/[.。!?]\s+/).filter(s => s.trim().length > 5);
  if (sentences.length >= 3) return true;
  if (q.length > 150) return true;
  return false;
}

const longOnes = all.filter(r => isLong(r.question));
const shortOnes = all.filter(r => !isLong(r.question));

console.log(`\n── 길이별 분류 ──`);
console.log(`  3줄 이상 (삭제 대상): ${longOnes.length}건`);
console.log(`  정상 길이:            ${shortOnes.length}건`);

// 복수 정답 후보 (answer에 공백 또는 "/"나 "," 포함)
const multiAnswer = all.filter(r => /[,\/]|및|과\s|와\s/.test(r.answer));
console.log(`\n── 복수 정답 후보 (answer에 구분자 포함): ${multiAnswer.length}건 ──`);
for (const r of multiAnswer.slice(0, 10)) {
  console.log(`  [${r.id}] answer: "${r.answer}"`);
}

// ___ 미포함 문항 (빈칸 위치 미표시)
const noBlank = all.filter(r => !r.question.includes('___') && !r.question.includes('(  )') && !r.question.includes('( )'));
console.log(`\n── 빈칸 위치 미표시 (___없음): ${noBlank.length}건 / ${all.length}건`);

// 긴 문항 샘플 5개 출력
console.log(`\n── 긴 문항 샘플 (최대 5개) ──`);
for (const r of longOnes.slice(0, 5)) {
  console.log(`\n  [${r.id}] (${r.subject}/${r.chapter})`);
  console.log(`  Q: ${r.question.substring(0, 200)}${r.question.length > 200 ? '...' : ''}`);
  console.log(`  A: ${r.answer}`);
}

// 정상 길이 샘플 5개 출력
console.log(`\n── 정상 길이 샘플 (최대 5개) ──`);
for (const r of shortOnes.slice(0, 5)) {
  console.log(`\n  [${r.id}] (${r.subject}/${r.chapter})`);
  console.log(`  Q: ${r.question}`);
  console.log(`  A: ${r.answer}`);
}

// 삭제 대상 ID 목록
console.log(`\n── 삭제 대상 ID 목록 (${longOnes.length}건) ──`);
console.log(longOnes.map(r => r.id).join('\n'));
