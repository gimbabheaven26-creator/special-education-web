import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('/Users/gihoonkim/Projects/special-education-web/.env.local', 'utf8');
const get = (key) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();

const url = get('NEXT_PUBLIC_SUPABASE_URL');
const key = get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: p, error: pe } = await supabase.from('profiles').select('id').limit(1);
const { data: u, error: ue } = await supabase.from('user_data').select('id').limit(1);

console.log('profiles:', pe ? '❌ ' + pe.message : '✅ OK (테이블 존재)');
console.log('user_data:', ue ? '❌ ' + ue.message : '✅ OK (테이블 존재)');
