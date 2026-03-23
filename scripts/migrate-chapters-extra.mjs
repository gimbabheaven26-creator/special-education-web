/**
 * migrate-chapters-extra.mjs
 * SQL 스크립트에 누락된 39개 영어 slug 추가 마이그레이션
 * 실행: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/migrate-chapters-extra.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const EXTRA_MIGRATIONS = [
  // assessment
  { subject: 'assessment', old: 'learning-disability',   new: '학습검사' },

  // behavior-support
  { subject: 'behavior-support', old: 'adaptive-behavior',          new: '기본이론' },
  { subject: 'behavior-support', old: 'adhd',                       new: '행동감소전략' },
  { subject: 'behavior-support', old: 'applied-behavior-analysis',  new: '기본이론' },
  { subject: 'behavior-support', old: 'asd',                        new: '긍정적행동지원' },
  { subject: 'behavior-support', old: 'behavior-intervention',      new: '행동감소전략' },
  { subject: 'behavior-support', old: 'bip',                        new: '긍정적행동지원' },
  { subject: 'behavior-support', old: 'ebd',                        new: '기본이론' },
  { subject: 'behavior-support', old: 'emotional-behavioral',       new: '기본이론' },
  { subject: 'behavior-support', old: 'fba',                        new: '관찰측정과단일대상설계' },
  { subject: 'behavior-support', old: 'positive-behavior-support',  new: '긍정적행동지원' },
  { subject: 'behavior-support', old: 'standardized-tests',         new: '관찰측정과단일대상설계' },

  // communication-disorder
  { subject: 'communication-disorder', old: 'articulation-disorder', new: '말장애' },

  // curriculum
  { subject: 'curriculum', old: 'cbi', new: '전환교육과정' },

  // hearing-impairment
  { subject: 'hearing-impairment', old: 'basic-curriculum',   new: '교육적접근' },
  { subject: 'hearing-impairment', old: 'hearing-assessment', new: '청력검사' },
  { subject: 'hearing-impairment', old: 'oral-method',        new: '교육적접근' },
  { subject: 'hearing-impairment', old: 'standardized-tests', new: '청력검사' },

  // inclusive-education
  { subject: 'inclusive-education', old: 'cooperative-learning',  new: '협력교수와협동학습' },
  { subject: 'inclusive-education', old: 'inclusive-strategies',  new: '교수적합화' },
  { subject: 'inclusive-education', old: 'understanding',         new: '개념과협력팀' },

  // introduction
  { subject: 'introduction', old: 'autism-characteristics',   new: '장애유형별핵심개념' },
  { subject: 'introduction', old: 'disability-concept',       new: '특수교육의정의와대상' },
  { subject: 'introduction', old: 'intellectual-disability',  new: '장애유형별핵심개념' },

  // laws
  { subject: 'laws', old: 'health-impairment-education', new: '특수교육대상자선정과배치' },

  // physical-disability
  { subject: 'physical-disability', old: 'aac',                new: '보조공학과접근성' },
  { subject: 'physical-disability', old: 'assistive-tech',     new: '보조공학과접근성' },
  { subject: 'physical-disability', old: 'assistive-technology', new: '보조공학과접근성' },
  { subject: 'physical-disability', old: 'cbi',                new: '건강장애심화와전환교육' },
  { subject: 'physical-disability', old: 'cerebral-palsy',     new: '이해와뇌성마비' },
  { subject: 'physical-disability', old: 'disability-types',   new: '이해와뇌성마비' },

  // transition
  { subject: 'transition', old: 'community-based',     new: '전환결과고용' },
  { subject: 'transition', old: 'itp',                 new: '전환교육개요' },
  { subject: 'transition', old: 'postsecondary',       new: '전환결과고용' },
  { subject: 'transition', old: 'supported-employment', new: '전환결과고용' },
  { subject: 'transition', old: 'transition-assessment', new: '전환평가' },
  { subject: 'transition', old: 'transition-planning',  new: '전환교육개요' },

  // visual-impairment
  { subject: 'visual-impairment', old: 'deafblind',  new: '이해와안질환' },
  { subject: 'visual-impairment', old: 'low-vision', new: '이해와안질환' },
]

const ENGLISH_SLUG_PATTERN = /^[a-z]/
const KEEP_ENGLISH = new Set(['cbm', 'iep', 'udl'])

async function fetchAllWithPagination(table, select = '*') {
  const PAGE_SIZE = 1000
  let allData = []
  let page = 0
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    if (error) throw new Error(`Fetch error: ${error.message}`)
    if (!data || data.length === 0) break
    allData = allData.concat(data)
    if (data.length < PAGE_SIZE) break
    page++
  }
  return allData
}

async function main() {
  console.log('=== 추가 마이그레이션 (39개 slug) ===\n')

  let successCount = 0
  const errors = []

  for (const m of EXTRA_MIGRATIONS) {
    const { error } = await supabase
      .from('quiz_questions')
      .update({ chapter: m.new })
      .eq('subject', m.subject)
      .eq('chapter', m.old)

    if (error) {
      errors.push({ ...m, error: error.message })
      console.error(`  ❌ FAIL: ${m.subject}/${m.old} → ${m.new}: ${error.message}`)
    } else {
      successCount++
      console.log(`  ✅ OK  : ${m.subject}/${m.old} → ${m.new}`)
    }
  }

  // 검증
  console.log('\n검증 중...')
  const allChapters = await fetchAllWithPagination('quiz_questions', 'subject, chapter')

  const remaining = allChapters.filter(
    row => ENGLISH_SLUG_PATTERN.test(row.chapter) && !KEEP_ENGLISH.has(row.chapter)
  )
  const remainingDistinct = [
    ...new Map(remaining.map(r => [`${r.subject}::${r.chapter}`, r])).values()
  ]

  console.log('\n==============================')
  console.log('  추가 마이그레이션 결과')
  console.log('==============================')
  console.log(`  UPDATE 성공: ${successCount}/${EXTRA_MIGRATIONS.length}`)
  console.log(`  에러: ${errors.length}건`)
  console.log(`  영어 slug 잔존 (cbm/iep/udl 제외): ${remainingDistinct.length}건`)

  if (remainingDistinct.length > 0) {
    console.log('\n  ⚠️  잔존 영어 slug 목록:')
    for (const r of remainingDistinct) {
      console.log(`    ${r.subject} / ${r.chapter}`)
    }
    console.log('\n  ❌ 미완료 — 추가 확인 필요')
  } else {
    console.log('\n  ✅ 검증 통과 — 영어 slug 0건')
  }
}

main().catch(err => {
  console.error('스크립트 오류:', err)
  process.exit(1)
})
