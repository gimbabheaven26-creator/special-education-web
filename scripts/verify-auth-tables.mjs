import { getClient } from './lib/supabase-client.mjs';

const supabase = getClient();

const { data: p, error: pe } = await supabase.from('profiles').select('id').limit(1);
const { data: u, error: ue } = await supabase.from('user_data').select('id').limit(1);

console.log('profiles:', pe ? '❌ ' + pe.message : '✅ OK (테이블 존재)');
console.log('user_data:', ue ? '❌ ' + ue.message : '✅ OK (테이블 존재)');
