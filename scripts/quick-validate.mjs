import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } });

let page = 0, all = [];
while (true) {
  const { data } = await sb.from('quiz_questions')
    .select('id,type,answer,wrong_explanations')
    .range(page * 1000, (page + 1) * 1000 - 1);
  if (!data || data.length === 0) break;
  all = all.concat(data);
  page++;
}
console.log(`총 ${all.length}건 로드\n`);

// 1. OX answer 오류
const oxErr = all.filter(r => r.type === 'ox' && !['O','X'].includes(r.answer));
console.log(`OX answer 오류: ${oxErr.length}건`, oxErr.length > 0 ? oxErr.map(r=>r.id).join(', ') : '✅');

// 2. multiple answer 오류
const multiErr = all.filter(r => r.type === 'multiple' && !['0','1','2','3'].includes(r.answer));
console.log(`multiple answer 오류: ${multiErr.length}건`, multiErr.length > 0 ? multiErr.map(r=>r.id).join(', ') : '✅');

// 3. WE 키 오류
const weKeyErr = all.filter(r => {
  if (!r.wrong_explanations || typeof r.wrong_explanations !== 'object') return false;
  if (Array.isArray(r.wrong_explanations)) return false;
  return Object.keys(r.wrong_explanations).some(k => !['0','1','2','3'].includes(k));
});
console.log(`WE 키 오류: ${weKeyErr.length}건`, weKeyErr.length > 0 ? weKeyErr.slice(0,10).map(r=>r.id).join(', ') : '✅');

// 4. WE 정답 키 포함
const weAnswerErr = all.filter(r => {
  if (!r.wrong_explanations || !r.answer) return false;
  if (Array.isArray(r.wrong_explanations)) return false;
  return ['0','1','2','3'].includes(r.answer) && Object.keys(r.wrong_explanations).includes(r.answer);
});
console.log(`WE 정답 키 포함: ${weAnswerErr.length}건`, weAnswerErr.length > 0 ? weAnswerErr.map(r=>r.id).join(', ') : '✅');
