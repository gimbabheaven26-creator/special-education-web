#!/usr/bin/env node
/**
 * 성취기준 JSON 데이터를 Supabase achievement_standards 테이블에 삽입한다.
 *
 * 사용법:
 *   node scripts/insert-achievement-stds.mjs [--dry-run]
 *
 * 필요 환경변수 (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * JSON 소스: data/curriculum/achievement-stds/ (SEW 루트)
 *           또는 src/data/achievement-stds/ (nadaun 복사본)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const sewRoot = path.resolve(projectRoot, '..')
const dryRun = process.argv.includes('--dry-run')

// .env.local 로드
function loadEnv() {
  const envPath = path.join(projectRoot, '.env.local')
  if (!fs.existsSync(envPath)) {
    throw new Error('.env.local이 없습니다. .env.local.example을 참고하세요.')
  }
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    const val = trimmed.slice(eq + 1)
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('NEXT_PUBLIC_SUPABASE_URL과 SUPABASE_SERVICE_ROLE_KEY가 필요합니다.')
  process.exit(1)
}

const supabase = createClient(url, serviceKey)

// JSON 파일 경로 (nadaun 복사본 우선, 없으면 SEW 루트)
function getDataDir() {
  const nadaunData = path.join(projectRoot, 'src/data/achievement-stds')
  if (fs.existsSync(nadaunData) && fs.readdirSync(nadaunData).some(f => f.endsWith('.json'))) {
    return nadaunData
  }
  const sewData = path.join(sewRoot, 'data/curriculum/achievement-stds')
  if (fs.existsSync(sewData)) return sewData
  throw new Error('성취기준 JSON 데이터를 찾을 수 없습니다.')
}

function flattenStandards(jsonData) {
  const { subject, curriculum, grade_group, grade_group_code, domains } = jsonData
  const rows = []

  for (const domain of domains) {
    const baseRow = {
      subject,
      curriculum,
      grade_group,
      grade_group_code,
      domain: domain.domain,
      domain_code: domain.domain_code,
      key_ideas: domain.key_ideas ?? [],
      content_elements: domain.content_elements ?? {},
    }

    // 수학: sub_domains 구조
    if (domain.sub_domains) {
      for (const sd of domain.sub_domains) {
        for (const std of sd.standards) {
          rows.push({
            ...baseRow,
            sub_domain: sd.name,
            code: std.code,
            content: std.content,
            explanation: std.explanation ?? '',
          })
        }
      }
    }

    // 국어/영어/진로: standards 직접
    if (domain.standards) {
      for (const std of domain.standards) {
        rows.push({
          ...baseRow,
          sub_domain: null,
          code: std.code,
          content: std.content,
          explanation: std.explanation ?? '',
        })
      }
    }
  }

  return rows
}

async function main() {
  const dataDir = getDataDir()
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'))

  console.log(`데이터 디렉토리: ${dataDir}`)
  console.log(`JSON 파일: ${files.length}개`)
  if (dryRun) console.log('[DRY RUN] 실제 삽입하지 않습니다.\n')

  let totalInserted = 0

  for (const file of files) {
    const filePath = path.join(dataDir, file)
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    const rows = flattenStandards(jsonData)

    console.log(`${jsonData.subject}: ${rows.length}개 성취기준`)

    if (dryRun) {
      for (const row of rows.slice(0, 2)) {
        console.log(`  ${row.code}: ${row.content.slice(0, 40)}...`)
      }
      if (rows.length > 2) console.log(`  ... +${rows.length - 2}개`)
      totalInserted += rows.length
      continue
    }

    // upsert (code가 unique)
    const { error, count } = await supabase
      .from('achievement_standards')
      .upsert(rows, { onConflict: 'code', ignoreDuplicates: false })
      .select('code')

    if (error) {
      console.error(`  ❌ 에러: ${error.message}`)
    } else {
      console.log(`  ✅ ${rows.length}건 upsert 완료`)
      totalInserted += rows.length
    }
  }

  console.log(`\n총 ${totalInserted}개 성취기준 ${dryRun ? '(예정)' : '삽입 완료'}`)

  if (!dryRun) {
    // 확인
    const { count } = await supabase
      .from('achievement_standards')
      .select('*', { count: 'exact', head: true })
    console.log(`DB 현재 총: ${count}건`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
