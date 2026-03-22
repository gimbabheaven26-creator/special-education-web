import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } });

// 1. OX 확인
const oxIds = ['bs-q147','cd-q74','intro-q138','intro-q162'];
const { data: ox } = await sb.from('quiz_questions').select('id,type,answer').in('id', oxIds);
console.log('OX answers (should be O/X):');
ox.forEach(r => console.log(` ${r.id}: answer="${r.answer}" ${['O','X'].includes(r.answer) ? '✅' : '❌'}`));

// 2. multiple text answer 확인
const multiIds = ['cd-q10','cd-q16','pd-q7','vi-q4'];
const { data: multi } = await sb.from('quiz_questions').select('id,type,answer').in('id', multiIds);
console.log('\nMultiple answers (should be 0-3):');
multi.forEach(r => console.log(` ${r.id}: answer="${r.answer}" ${['0','1','2','3'].includes(r.answer) ? '✅' : '❌'}`));

// 3. "4"→"3" 확인
const fourIds = ['asmnt-q32','laws-q54','laws-q73','cd-q33'];
const { data: four } = await sb.from('quiz_questions').select('id,answer,wrong_explanations').in('id', fourIds);
console.log('\nAnswer "4" fixed (should be "3"):');
four.forEach(r => {
  const hasWEKey4 = r.wrong_explanations ? Object.keys(r.wrong_explanations).includes('4') : false;
  console.log(` ${r.id}: answer="${r.answer}" WE_has_4=${hasWEKey4} ${r.answer === '3' ? '✅' : '❌'}`);
});
