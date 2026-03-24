/**
 * delete-long-fill-in.mjs
 * 부적절한 fill_in 문항 삭제
 * 기준1 (장문): 줄바꿈 포함 OR 문장 3개 이상 OR 150자 초과
 * 기준2 (복수답): ①②③ / ㉠㉡㉢ 등 복수 빈칸 요구 패턴
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 기준1: 장문
function isLong(q) {
  if (q.includes('\n')) return true;
  const sentences = q.split(/[.。!?]\s+/).filter(s => s.trim().length > 5);
  if (sentences.length >= 3) return true;
  if (q.length > 150) return true;
  return false;
}

// 기준2: 복수 빈칸 요구 (①②③, ㉠㉡㉢ 등)
const MULTI_BLANK_PATTERNS = [
  /[①②③④⑤]/,
  /[㉠㉡㉢㉣㉤㉥]/,
  /①~|㉠~/,
];
function hasMultiBlanks(q) {
  return MULTI_BLANK_PATTERNS.some(p => p.test(q));
}

let page = 0, all = [];
while (true) {
  const { data } = await sb.from('quiz_questions')
    .select('id,subject,question')
    .eq('type', 'fill_in')
    .range(page * 1000, (page + 1) * 1000 - 1);
  if (!data || data.length === 0) break;
  all = all.concat(data);
  page++;
}

const targets = all.filter(r => isLong(r.question) || hasMultiBlanks(r.question));
console.log(`삭제 대상: ${targets.length}건\n`);

const ids = targets.map(r => r.id);
if (ids.length === 0) {
  console.log('삭제할 문항 없음 ✅');
  process.exit(0);
}

const { error } = await sb.from('quiz_questions').delete().in('id', ids);

if (error) {
  console.error('❌ 삭제 실패:', error.message);
  process.exit(1);
}

console.log(`✅ ${ids.length}건 삭제 완료`);
