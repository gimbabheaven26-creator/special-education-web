import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = Object.fromEntries(
  readFileSync('.env.local','utf8').trim().split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i+1)]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const files = [
  'scripts/quiz-data/bs-depth4-q241-260.json',
  'scripts/quiz-data/trans-depth2-q176-195.json',
  'scripts/quiz-data/asmnt-depth2-q280-299.json',
];

let totalInserted = 0;
for (const file of files) {
  const questions = JSON.parse(readFileSync(file, 'utf-8'));
  const { error } = await sb.from('quiz_questions').upsert(questions, { onConflict: 'id' });
  if (error) {
    console.error(`${file}: FAIL`, error.message);
  } else {
    console.log(`${file}: ${questions.length}건 삽입 완료`);
    totalInserted += questions.length;
  }
}

console.log(`\n총 삽입: ${totalInserted}건`);

const { count } = await sb.from('quiz_questions').select('*', { count: 'exact', head: true });
console.log(`quiz_questions 전체: ${count}건`);

// 과목별 확인
const checks = [
  { subject: 'behavior-support', prefix: 'bs', min: 241, max: 260 },
  { subject: 'transition', prefix: 'trans', min: 176, max: 195 },
  { subject: 'assessment', prefix: 'asmnt', min: 280, max: 299 },
];
for (const { subject, prefix, min, max } of checks) {
  const ids = Array.from({ length: 20 }, (_, i) => `${prefix}-q${min + i}`);
  const { count: c } = await sb.from('quiz_questions').select('*', { count: 'exact', head: true }).in('id', ids);
  console.log(`  ${subject} ${prefix}-q${min}~q${max}: ${c}/20 확인`);
}
