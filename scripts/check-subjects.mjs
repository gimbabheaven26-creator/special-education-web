import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } });

const known = new Set(['introduction','behavior-support','visual-impairment','hearing-impairment','communication-disorder','physical-disability','curriculum','transition','inclusive-education','assessment','laws']);

let page = 0, all = [];
while (true) {
  const { data } = await sb.from('quiz_questions').select('id,subject').range(page*1000,(page+1)*1000-1);
  if (!data || data.length === 0) break;
  all = all.concat(data);
  page++;
}

const counts = {};
for (const r of all) {
  counts[r.subject] = (counts[r.subject] || 0) + 1;
}

const unknown = Object.entries(counts).filter(([s]) => !known.has(s));
const knownSum = Object.entries(counts).filter(([s]) => known.has(s)).reduce((a,[,v]) => a+v, 0);
console.log(`총 ${all.length}건 | 알려진 subject 합계: ${knownSum} | 미분류: ${all.length - knownSum}`);
console.log('\n미분류 subjects:');
unknown.sort((a,b)=>b[1]-a[1]).forEach(([s,n]) => console.log(` ${s}: ${n}건`));
