#!/usr/bin/env node
/**
 * Phase 1: 성취기준 90개를 Supabase achievement_standards 테이블에 삽입
 * 실행: node scripts/insert-achievement-standards.mjs
 * 필요: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (.env.local)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── env ──────────────────────────────────────────────────────
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  throw new Error(
    'Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY\n' +
    'Run: source .env.local (or export them manually)'
  )
}

const supabase = createClient(url, serviceKey)

// ── JSON 파일 로드 ───────────────────────────────────────────
const DATA_DIR = resolve(__dirname, '../../data/curriculum/achievement-stds')

const FILES = [
  'korean-middle.json',
  'math-middle.json',
  'career-middle.json',
  'english-middle.json',
]

function loadJson(filename) {
  const path = resolve(DATA_DIR, filename)
  return JSON.parse(readFileSync(path, 'utf-8'))
}

// ── 성취기준 평탄화 ──────────────────────────────────────────
function flattenStandards(curriculum) {
  const rows = []
  const base = {
    subject: curriculum.subject,
    curriculum: curriculum.curriculum,
    grade_group: curriculum.grade_group,
    grade_group_code: curriculum.grade_group_code,
  }

  for (const domain of curriculum.domains) {
    const domainBase = {
      ...base,
      domain: domain.domain,
      domain_code: domain.domain_code,
      key_ideas: domain.key_ideas,
      content_elements: domain.content_elements,
    }

    // 수학: sub_domains 배열이 있음
    if (domain.sub_domains) {
      for (const sub of domain.sub_domains) {
        for (const std of sub.standards) {
          rows.push({
            ...domainBase,
            sub_domain: sub.name,
            code: std.code,
            content: std.content,
            explanation: std.explanation || '',
          })
        }
      }
    } else {
      // 국어, 진로와직업, 생활영어: standards 직접
      for (const std of domain.standards) {
        rows.push({
          ...domainBase,
          sub_domain: null,
          code: std.code,
          content: std.content,
          explanation: std.explanation || '',
        })
      }
    }
  }

  return rows
}

// ── 메인 ─────────────────────────────────────────────────────
async function main() {
  const allRows = []

  for (const file of FILES) {
    const data = loadJson(file)
    const rows = flattenStandards(data)
    allRows.push(...rows)
    console.log(`  ${data.subject}: ${rows.length}개`)
  }

  console.log(`\n총 ${allRows.length}개 성취기준 삽입 시작...\n`)

  // upsert: code가 unique이므로 중복 실행 시 덮어쓰기
  const { data, error } = await supabase
    .from('achievement_standards')
    .upsert(allRows, { onConflict: 'code' })
    .select('code')

  if (error) {
    console.error('삽입 실패:', error.message)
    console.error('상세:', JSON.stringify(error, null, 2))
    process.exit(1)
  }

  console.log(`삽입 완료: ${data.length}개`)

  // 검증: 과목별 카운트
  const { data: counts, error: countErr } = await supabase
    .from('achievement_standards')
    .select('subject')

  if (countErr) {
    console.error('검증 쿼리 실패:', countErr.message)
    process.exit(1)
  }

  const bySubject = {}
  for (const row of counts) {
    bySubject[row.subject] = (bySubject[row.subject] || 0) + 1
  }

  console.log('\n과목별 검증:')
  for (const [subject, count] of Object.entries(bySubject)) {
    console.log(`  ${subject}: ${count}개`)
  }
  console.log(`  합계: ${counts.length}개`)
}

main().catch((err) => {
  console.error('스크립트 오류:', err)
  process.exit(1)
})
