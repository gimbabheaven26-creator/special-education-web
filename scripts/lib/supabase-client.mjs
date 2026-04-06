/**
 * scripts/lib/supabase-client.mjs
 *
 * 공용 Supabase 클라이언트 — 모든 스크립트가 이 모듈만 사용한다.
 * 하드코딩된 URL/키 제거, env var 강제, 페이지네이션 헬퍼 포함.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * .env.local에서 환경변수를 로드한다 (process.env에 없을 때만).
 * 프로젝트 루트의 .env.local을 읽어서 NEXT_PUBLIC_SUPABASE_URL과
 * SUPABASE_SERVICE_ROLE_KEY를 process.env에 주입한다.
 */
function loadEnvLocal() {
  const envPath = resolve(__dirname, '../../.env.local');
  try {
    const content = readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.+)$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = match[2].trim();
      }
    }
  } catch {
    // .env.local 없으면 process.env에서 직접 읽기
  }
}

/**
 * Supabase 클라이언트를 생성한다.
 *
 * 우선순위: process.env > .env.local
 * service role key가 없으면 즉시 throw.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function getClient() {
  loadEnvLocal();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set.\n' +
      'Set it via: export SUPABASE_SERVICE_ROLE_KEY=your-key'
    );
  }

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * 테이블의 모든 행을 페이지네이션으로 가져온다.
 * PostgREST 기본 limit(1000)을 우회한다.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} table
 * @param {string} columns
 * @param {number} pageSize
 * @returns {Promise<any[]>}
 */
export async function fetchAll(supabase, table, columns = '*', pageSize = 1000) {
  const rows = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`fetchAll(${table}) failed at offset ${offset}: ${error.message}`);
    }
    if (!data || data.length === 0) break;

    rows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

/**
 * 테이블에서 조건 필터링 후 모든 행을 가져온다.
 *
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} table
 * @param {Record<string, any>} filters - eq 필터 조건 (e.g. { subject: 'laws' })
 * @param {string} columns
 * @returns {Promise<any[]>}
 */
export async function fetchFiltered(supabase, table, filters = {}, columns = '*') {
  let query = supabase.from(table).select(columns);

  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }

  const { data, error } = await query.limit(10000);

  if (error) {
    throw new Error(`fetchFiltered(${table}) failed: ${error.message}`);
  }

  return data || [];
}
