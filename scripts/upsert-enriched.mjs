/**
 * enriched 데이터를 achievement_standards 테이블에 upsert
 * normalized JSON → DB (code 기준 매칭)
 *
 * 사전 조건:
 *   1. 20260330000001_enrichment_columns.sql 실행 완료
 *   2. SUPABASE_SERVICE_ROLE_KEY 환경변수 설정
 *
 * 실행: SUPABASE_SERVICE_ROLE_KEY=... node scripts/upsert-enriched.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL) {
  throw new Error('SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL env var required')
}
if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

function loadNormalized(filename) {
  const path = join(__dirname, '..', 'data', 'curriculum', '2022-enriched', 'normalized', filename)
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function flattenStandards(data) {
  const results = []
  for (const domain of data.domains) {
    for (const std of domain.standards) {
      results.push({
        code: std.code,
        considerations: std.considerations || [],
        curriculum_levels: std.curriculum_levels || [],
        achievement_pool: std.achievement_pool || {},
        content_elements: std.content_elements || {},
        teaching_references: std.teaching_references || [],
      })
    }
  }
  return results
}

async function upsertEnriched() {
  const files = ['korean-middle.json', 'math-middle.json', 'career-middle.json']
  let totalUpdated = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const file of files) {
    const data = loadNormalized(file)
    const standards = flattenStandards(data)

    for (const std of standards) {
      const { data: existing, error: fetchErr } = await supabase
        .from('achievement_standards')
        .select('id, code')
        .eq('code', std.code)
        .single()

      if (fetchErr || !existing) {
        console.log(`⚠ ${std.code}: DB에 없음 (skip)`)
        totalSkipped++
        continue
      }

      const { error: updateErr } = await supabase
        .from('achievement_standards')
        .update({
          considerations: std.considerations,
          curriculum_levels: std.curriculum_levels,
          achievement_pool: std.achievement_pool,
          content_elements: std.content_elements,
          teaching_references: std.teaching_references,
        })
        .eq('code', std.code)

      if (updateErr) {
        console.error(`✗ ${std.code}: ${updateErr.message}`)
        totalErrors++
      } else {
        totalUpdated++
      }
    }

    console.log(`✓ ${file}: ${standards.length}개 처리`)
  }

  console.log(`\n=== 결과 ===`)
  console.log(`업데이트: ${totalUpdated}`)
  console.log(`스킵 (DB에 없음): ${totalSkipped}`)
  console.log(`에러: ${totalErrors}`)

  // 검증: enriched 컬럼이 채워진 행 수
  const { count } = await supabase
    .from('achievement_standards')
    .select('*', { count: 'exact', head: true })
    .neq('achievement_pool', '{}')

  console.log(`\nDB 검증: achievement_pool 채워진 행 = ${count}`)
}

upsertEnriched().catch(console.error)
