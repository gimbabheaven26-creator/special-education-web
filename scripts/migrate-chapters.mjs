/**
 * migrate-chapters.mjs
 * quiz_questions.chapter 영어 slug → MDX concept slug 마이그레이션
 * 실행: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/migrate-chapters.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// 58개 UPDATE 정의 (SQL 스크립트와 동일)
const MIGRATIONS = [
  // assessment
  { subject: 'assessment', old: 'theory',             new: '평가기초와측정' },
  { subject: 'assessment', old: 'standardized-tests', new: '표준화검사와점수' },
  { subject: 'assessment', old: 'fba',                new: '타당도신뢰도와사정' },
  { subject: 'assessment', old: 'strategies',         new: '비공식평가와사정방법' },
  { subject: 'assessment', old: 'practices',          new: '형성평가와진전도' },
  // behavior-support
  { subject: 'behavior-support', old: 'aba',          new: '기본이론' },
  { subject: 'behavior-support', old: 'pbs',          new: '긍정적행동지원' },
  { subject: 'behavior-support', old: 'intervention', new: '행동감소전략' },
  { subject: 'behavior-support', old: 'assessment',   new: '관찰측정과단일대상설계' },
  { subject: 'behavior-support', old: 'strategies',   new: '강화와행동증가' },
  // communication-disorder
  { subject: 'communication-disorder', old: 'articulation',     new: '말장애' },
  { subject: 'communication-disorder', old: 'aac',              new: '중재전략과평가' },
  { subject: 'communication-disorder', old: 'spontaneous-speech', new: '중재전략과평가' },
  { subject: 'communication-disorder', old: 'emt',              new: '언어장애' },
  { subject: 'communication-disorder', old: 'fluency',          new: '말장애' },
  // curriculum
  { subject: 'curriculum', old: 'general-curriculum', new: '2022개정교육과정' },
  { subject: 'curriculum', old: 'basic-curriculum',   new: '교육과정재구성' },
  { subject: 'curriculum', old: 'theory',             new: 'udl' },
  { subject: 'curriculum', old: 'planning',           new: '전환교육과정' },
  { subject: 'curriculum', old: 'evaluation',         new: '교육과정재구성' },
  // hearing-impairment
  { subject: 'hearing-impairment', old: 'sign-language',    new: '수어심화' },
  { subject: 'hearing-impairment', old: 'hearing-aid',      new: '보조기기' },
  { subject: 'hearing-impairment', old: 'cochlear-implant', new: '보조기기' },
  { subject: 'hearing-impairment', old: 'audiogram',        new: '청력검사' },
  { subject: 'hearing-impairment', old: 'classroom',        new: '교실환경지원' },
  // inclusive-education
  { subject: 'inclusive-education', old: 'co-teaching', new: '협력교수와협동학습' },
  { subject: 'inclusive-education', old: 'theory',      new: '개념과협력팀' },
  { subject: 'inclusive-education', old: 'strategies',  new: '교수적합화' },
  { subject: 'inclusive-education', old: 'practices',   new: '삽입교수와중복교육과정' },
  { subject: 'inclusive-education', old: 'udl',         new: '보편적학습설계심화' },
  // introduction
  { subject: 'introduction', old: 'history',         new: '특수교육역사와패러다임' },
  { subject: 'introduction', old: 'disability-types', new: '장애유형별핵심개념' },
  { subject: 'introduction', old: 'understanding',   new: '특수교육의정의와대상' },
  // laws
  { subject: 'laws', old: 'special-education-act',   new: '특수교육법총칙과국가의무' },
  { subject: 'laws', old: 'anti-discrimination-act', new: '특수교육대상자선정과배치' },
  { subject: 'laws', old: 'welfare-act',             new: '특수교육기관과권리구제' },
  { subject: 'laws', old: 'theory',                  new: '특수교육법총칙과국가의무' },
  { subject: 'laws', old: 'strategies',              new: '개별화교육계획법적요건과지원' },
  { subject: 'laws', old: 'practices',               new: '특수교육기관과권리구제' },
  // physical-disability
  { subject: 'physical-disability', old: 'cp-types',          new: '이해와뇌성마비' },
  { subject: 'physical-disability', old: 'primitive-reflexes', new: '뇌성마비특성과기타유형' },
  { subject: 'physical-disability', old: 'gmfcs',             new: '뇌성마비특성과기타유형' },
  { subject: 'physical-disability', old: 'positioning',       new: '자세보행일상생활' },
  { subject: 'physical-disability', old: 'muscular-dystrophy', new: '건강장애와병원학교' },
  // transition
  { subject: 'transition', old: 'planning',          new: '전환교육개요' },
  { subject: 'transition', old: 'cbi',               new: '전환결과고용' },
  { subject: 'transition', old: 'self-determination', new: '전환교육개요' },
  { subject: 'transition', old: 'theory',            new: '전환교육개요' },
  { subject: 'transition', old: 'strategies',        new: '전환평가' },
  { subject: 'transition', old: 'practices',         new: '전환결과고용' },
  // visual-impairment
  { subject: 'visual-impairment', old: 'braille',              new: '촉각청각점자' },
  { subject: 'visual-impairment', old: 'orientation-mobility', new: '보행기술' },
  { subject: 'visual-impairment', old: 'visual-acuity',        new: '검사와보행훈련' },
  { subject: 'visual-impairment', old: 'visual-training',      new: '교육과정' },
  { subject: 'visual-impairment', old: 'assistive-tech',       new: '보조공학' },
]

// 영어 slug 패턴 목록 (cbm, iep, udl 제외한 예상 영어 slugs)
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
  console.log('=== quiz_questions.chapter 마이그레이션 시작 ===\n')

  // ─── Step 1: 로컬 백업 ───
  console.log('[1/3] 백업 중...')
  const backup = await fetchAllWithPagination('quiz_questions', 'id, subject, chapter')
  const backupPath = '/Users/gihoonkim/Projects/special-education-web/scripts/output/quiz_questions_chapter_backup.json'
  writeFileSync(backupPath, JSON.stringify(backup, null, 2))
  console.log(`✅ 백업 완료: ${backup.length}건 → ${backupPath}\n`)

  // ─── Step 2: UPDATE 실행 ───
  console.log('[2/3] 마이그레이션 실행 중...')
  let successCount = 0
  const errors = []

  for (const m of MIGRATIONS) {
    const { error, count } = await supabase
      .from('quiz_questions')
      .update({ chapter: m.new })
      .eq('subject', m.subject)
      .eq('chapter', m.old)
      .select('id', { count: 'exact', head: true })

    if (error) {
      errors.push({ ...m, error: error.message })
      console.error(`  ❌ FAIL: ${m.subject}/${m.old} → ${m.new}: ${error.message}`)
    } else {
      successCount++
      console.log(`  ✅ OK  : ${m.subject}/${m.old} → ${m.new}`)
    }
  }

  // ─── Step 3: 검증 ───
  console.log('\n[3/3] 검증 중...')
  const allChapters = await fetchAllWithPagination('quiz_questions', 'subject, chapter')

  const remaining = allChapters.filter(
    row => ENGLISH_SLUG_PATTERN.test(row.chapter) && !KEEP_ENGLISH.has(row.chapter)
  )

  // 중복 제거
  const remainingDistinct = [
    ...new Map(remaining.map(r => [`${r.subject}::${r.chapter}`, r])).values()
  ]

  console.log('\n==============================')
  console.log('  마이그레이션 결과 요약')
  console.log('==============================')
  console.log(`  총 문항: ${allChapters.length}건`)
  console.log(`  UPDATE 성공: ${successCount}/${MIGRATIONS.length}`)
  console.log(`  에러: ${errors.length}건`)
  console.log(`  영어 slug 잔존 (cbm/iep/udl 제외): ${remainingDistinct.length}건`)

  if (remainingDistinct.length > 0) {
    console.log('\n  ⚠️  잔존 영어 slug 목록:')
    for (const r of remainingDistinct) {
      console.log(`    ${r.subject} / ${r.chapter}`)
    }
    console.log('\n  ❌ 마이그레이션 미완료')
  } else {
    console.log('\n  ✅ 검증 통과 — 영어 slug 0건')
  }

  if (errors.length > 0) {
    console.log('\n  에러 목록:')
    for (const e of errors) {
      console.log(`    ${e.subject}/${e.old}: ${e.error}`)
    }
  }
}

main().catch(err => {
  console.error('스크립트 오류:', err)
  process.exit(1)
})
