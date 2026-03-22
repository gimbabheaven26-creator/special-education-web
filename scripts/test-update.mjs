import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const get = k => env.match(new RegExp(`^${k}=(.+)$`, 'm'))?.[1]?.trim();
const sb = createClient(get('NEXT_PUBLIC_SUPABASE_URL'), get('SUPABASE_SERVICE_ROLE_KEY'), { auth: { autoRefreshToken: false, persistSession: false } });

// Before
const { data: before } = await sb.from('quiz_questions').select('id,answer').eq('id','bs-q147');
console.log('Before:', before);

// Update
const { data: updated, error } = await sb.from('quiz_questions')
  .update({ answer: 'O' })
  .eq('id', 'bs-q147')
  .select('id,answer');
console.log('Update result:', updated, 'Error:', error);

// After
const { data: after } = await sb.from('quiz_questions').select('id,answer').eq('id','bs-q147');
console.log('After:', after);
