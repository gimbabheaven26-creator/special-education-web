import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const env = Object.fromEntries(
  readFileSync(join(__dirname, '../.env.local'), 'utf8').trim().split('\n')
    .filter(l => l && !l.startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1)]; })
);

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const questions = JSON.parse(
  readFileSync(join(__dirname, 'quiz-data/cd-depth2-q129-148.json'), 'utf-8')
);

const { error } = await sb.from('quiz_questions').upsert(questions, { onConflict: 'id' });
if (error) {
  console.error('FAIL:', error.message);
  process.exit(1);
}

console.log(`삽입 완료: ${questions.length}건`);

const ids = questions.map(q => q.id);
const { count } = await sb.from('quiz_questions').select('*', { count: 'exact', head: true }).in('id', ids);
console.log(`확인: ${count}/${questions.length}건`);

const { data: rows } = await sb.from('quiz_questions').select('id,chapter,type,difficulty').in('id', ids);
const byChapter = {};
const byType = {};
const byDiff = {};
for (const r of rows) {
  byChapter[r.chapter] = (byChapter[r.chapter] || 0) + 1;
  byType[r.type] = (byType[r.type] || 0) + 1;
  byDiff[r.difficulty] = (byDiff[r.difficulty] || 0) + 1;
}
console.log('\n챕터별:', JSON.stringify(byChapter, null, 2));
console.log('유형별:', JSON.stringify(byType, null, 2));
console.log('난이도별:', JSON.stringify(byDiff, null, 2));
