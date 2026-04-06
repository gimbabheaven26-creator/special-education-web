/**
 * create-auth-tables.mjs
 *
 * Verifies profiles/user_data schema and outputs migration SQL if needed.
 * NOTE: DDL cannot be executed via the JS client. Run the SQL in the Supabase Dashboard:
 *   https://supabase.com/dashboard/project/ssluhxvbyzqmdkbjwoke/editor
 *
 * Usage: node scripts/create-auth-tables.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const env = readFileSync(join(__dirname, '../.env.local'), 'utf8');
const get = (key) => env.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();

const url = get('NEXT_PUBLIC_SUPABASE_URL');
const key = get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Schema verification ─────────────────────────────────────────────────────

async function checkColumn(table, column) {
  const { error } = await supabase.from(table).select(column).limit(0);
  return !error;
}

async function verifySchema() {
  console.log('\n🔍 Schema Verification\n');

  const checks = [
    ['profiles', 'id'],
    ['profiles', 'display_name'],
    ['profiles', 'nickname'],
    ['profiles', 'role'],
    ['profiles', 'email'],
    ['profiles', 'avatar_url'],
    ['profiles', 'exam_date'],
    ['user_data', 'user_id'],
    ['user_data', 'store_key'],
    ['user_data', 'data'],
    ['user_data', 'updated_at'],
  ];

  const missing = [];
  for (const [table, column] of checks) {
    const ok = await checkColumn(table, column);
    console.log(`  ${ok ? '✅' : '❌'} ${table}.${column}`);
    if (!ok) missing.push({ table, column });
  }

  return missing;
}

// ─── Function integration tests ───────────────────────────────────────────────

async function runIntegrationTests() {
  console.log('\n🧪 Integration Tests (db.ts functions)\n');

  // Test 1: profiles SELECT works
  const { error: e1 } = await supabase.from('profiles').select('id, display_name, nickname, role').limit(1);
  console.log('  getProfile (core fields):', e1 ? `❌ ${e1.message}` : '✅');

  // Test 2: user_data SELECT works
  const { error: e2 } = await supabase.from('user_data').select('id, user_id, store_key, data, updated_at').limit(1);
  console.log('  getUserData:', e2 ? `❌ ${e2.message}` : '✅');

  // Test 3: user_data upsert structure (dry run)
  const testPayload = {
    user_id: '00000000-0000-0000-0000-000000000000',
    store_key: 'study',
    data: { test: true },
    updated_at: new Date().toISOString(),
  };
  // We expect this to fail FK constraint (no such user) — that's OK, it means schema is correct
  const { error: e3 } = await supabase.from('user_data').upsert(testPayload, { onConflict: 'user_id,store_key' });
  const schemaOk = !e3 || e3.code === '23503'; // 23503 = FK violation (expected)
  console.log('  upsertUserData schema:', schemaOk ? '✅ schema valid (FK violation expected)' : `❌ ${e3?.message}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const missing = await verifySchema();
await runIntegrationTests();

if (missing.length > 0) {
  console.log('\n⚠️  Missing columns detected. Run the following migration in Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/ssluhxvbyzqmdkbjwoke/editor\n');
  console.log('   File: supabase/migrations/20260322000001_profiles_expand.sql\n');
  const migSql = readFileSync(join(__dirname, '../supabase/migrations/20260322000001_profiles_expand.sql'), 'utf8');
  console.log('─'.repeat(70));
  console.log(migSql);
  console.log('─'.repeat(70));
} else {
  console.log('\n✅ All schema checks passed. No migration needed.\n');
}
