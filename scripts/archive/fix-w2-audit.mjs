/**
 * fix-w2-audit.mjs
 * Wave 2 감사 결과 자동 수정 스크립트
 * 수정 1: 구형 용어 교체 (간질→뇌전증, 정신지체→지적장애)
 * 수정 2: explanation 30자 미만 문항 보강 (허용 과목만)
 * 수정 3: tags 빈값 문항 자동 배정 (허용 과목만)
 * 수정 4: 실제 콘텐츠 중복 처리 (is_active 확인 후)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// 수정 금지 과목
const BLOCKED_SUBJECTS = new Set(['assessment', 'curriculum', 'laws'])
// 수정 허용 과목 (tags/explanation 보강용)
const ALLOWED_SUBJECTS = new Set([
  'introduction', 'behavior-support', 'transition',
  'visual', 'hearing', 'communication-disorder',
  'physical-disability', 'inclusion',
  // audit에서 확인된 실제 subject slug 변형도 포함
  'inclusive-education'
])

const results = {
  fix1: { success: [], failed: [] },
  fix2: { success: [], failed: [], skipped: [] },
  fix3: { success: 0, failed: 0, skipped: 0 },
  fix4: { is_active_exists: false, actions: [] },
}

// ─────────────────────────────────────────────
// 수정 1: 구형 용어 교체
// ─────────────────────────────────────────────
async function fix1_outdatedTerms() {
  console.log('\n=== 수정 1: 구형 용어 교체 ===')

  const targets = [
    'introduction-disability-types-ox-cb455bd8', // 간질
    'physical-disability-cp-types-ox-ad5f488f',  // 간질
    'pd-q61',                                     // 간질
    'intro-q204',                                 // 정신지체
  ]

  for (const id of targets) {
    const { data: q, error: fetchErr } = await supabase
      .from('quiz_questions')
      .select('id, question, explanation, wrong_explanations')
      .eq('id', id)
      .single()

    if (fetchErr || !q) {
      console.log(`  [FAIL] ${id} fetch error: ${fetchErr?.message}`)
      results.fix1.failed.push({ id, reason: fetchErr?.message })
      continue
    }

    // 용어 교체 (question + explanation + wrong_explanations)
    let newQuestion = q.question
      .replaceAll('간질', '뇌전증')
      .replaceAll('정신지체', '지적장애')

    let newExplanation = (q.explanation || '')
      .replaceAll('간질', '뇌전증')
      .replaceAll('정신지체', '지적장애')

    let newWrongExplanations = q.wrong_explanations
    if (Array.isArray(q.wrong_explanations)) {
      newWrongExplanations = q.wrong_explanations.map(we => {
        if (typeof we === 'string') {
          return we.replaceAll('간질', '뇌전증').replaceAll('정신지체', '지적장애')
        }
        if (typeof we === 'object' && we !== null) {
          const updated = { ...we }
          if (updated.text) updated.text = updated.text.replaceAll('간질', '뇌전증').replaceAll('정신지체', '지적장애')
          if (updated.explanation) updated.explanation = updated.explanation.replaceAll('간질', '뇌전증').replaceAll('정신지체', '지적장애')
          return updated
        }
        return we
      })
    }

    // 변경 여부 확인
    const changed =
      newQuestion !== q.question ||
      newExplanation !== (q.explanation || '') ||
      JSON.stringify(newWrongExplanations) !== JSON.stringify(q.wrong_explanations)

    if (!changed) {
      console.log(`  [SKIP] ${id} — 교체 대상 용어 없음 (이미 수정됨)`)
      results.fix1.skipped = (results.fix1.skipped || [])
      results.fix1.skipped.push(id)
      continue
    }

    const { error: updateErr } = await supabase
      .from('quiz_questions')
      .update({
        question: newQuestion,
        explanation: newExplanation,
        wrong_explanations: newWrongExplanations,
      })
      .eq('id', id)

    if (updateErr) {
      console.log(`  [FAIL] ${id}: ${updateErr.message}`)
      results.fix1.failed.push({ id, reason: updateErr.message })
    } else {
      const foundTerms = []
      if (q.question.includes('간질') || (q.explanation || '').includes('간질')) foundTerms.push('간질→뇌전증')
      if (q.question.includes('정신지체') || (q.explanation || '').includes('정신지체')) foundTerms.push('정신지체→지적장애')
      console.log(`  [OK] ${id} — ${foundTerms.join(', ')} 교체 완료`)
      results.fix1.success.push({ id, terms: foundTerms })
    }
  }
}

// ─────────────────────────────────────────────
// 수정 2: explanation 30자 미만 문항 보강
// ─────────────────────────────────────────────

// 허용 과목의 짧은 explanation 문항만 대상
const SHORT_EXPLANATION_TARGETS = [
  {
    id: 'introduction-understanding-ox-2670c250',
    subject: 'introduction',
    currentExpl: '특수교육법 제2조 제6호의 정의이다.',
    newExpl: '특수교육법 제2조 제6호에 따르면 특수교육 관련 서비스란 특수교육 대상자의 교육을 효율적으로 실시하기 위해 필요한 인적·물적 자원을 제공하는 서비스로, 상담지원·가족지원·치료지원·보조인력지원·보조공학기기지원·학습보조기기지원·통학지원·정보접근지원 등이 포함된다.',
  },
  {
    id: 'behavior-support-aba-ox-f151e5f5',
    subject: 'behavior-support',
    currentExpl: '이 7가지 차원은 ABA를 정의하는 핵심 기준이다.',
    newExpl: 'Baer, Wolf & Risley(1968)가 제시한 ABA의 7가지 차원은 응용성(Applied), 행동성(Behavioral), 분석성(Analytic), 기술성(Technological), 개념적 체계성(Conceptually Systematic), 효과성(Effective), 일반성(Generality)이다. 이 차원들은 행동분석이 과학적·실용적으로 적용되기 위한 필수 속성을 정의한다.',
  },
]

async function fix2_shortExplanations() {
  console.log('\n=== 수정 2: explanation 30자 미만 보강 ===')

  // audit 목록 13건 중 허용 과목 필터링
  const allShortIds = [
    { id: 'introduction-understanding-ox-2670c250', subject: 'introduction' },
    { id: 'curriculum-iep-ox-1c2d4d7a', subject: 'curriculum' },          // 금지
    { id: 'behavior-support-aba-ox-f151e5f5', subject: 'behavior-support' },
    { id: 'laws-special-education-act-ox-34912f8a', subject: 'laws' },      // 금지
    { id: 'laws-special-education-act-ox-591d5b05', subject: 'laws' },      // 금지
    { id: 'laws-special-education-act-ox-68b90804', subject: 'laws' },      // 금지
    { id: 'laws-special-education-act-ox-cd7316f0', subject: 'laws' },      // 금지
    { id: 'assessment-standardized-tests-ox-0572b7b7', subject: 'assessment' }, // 금지
    { id: 'laws-special-education-act-ox-11339668', subject: 'laws' },      // 금지
    { id: 'laws-special-education-act-ox-0358899a', subject: 'laws' },      // 금지
    { id: 'kice-2020-전공B-q08-02', subject: 'assessment' },                // 금지
    { id: 'kice-2022-전공A-q05-03', subject: 'curriculum' },                // 금지
    { id: 'kice-2023-전공B-q05-01', subject: 'laws' },                      // 금지
  ]

  for (const item of allShortIds) {
    if (BLOCKED_SUBJECTS.has(item.subject)) {
      console.log(`  [SKIP] ${item.id} — 수정 금지 과목(${item.subject})`)
      results.fix2.skipped.push(item.id)
      continue
    }

    // 허용 과목 중 보강 내용이 준비된 것만 처리
    const target = SHORT_EXPLANATION_TARGETS.find(t => t.id === item.id)
    if (!target) {
      console.log(`  [SKIP] ${item.id} — 보강 내용 미준비 (수동 검토 필요)`)
      results.fix2.skipped.push(item.id)
      continue
    }

    // 현재 값 확인
    const { data: q, error: fetchErr } = await supabase
      .from('quiz_questions')
      .select('id, explanation')
      .eq('id', item.id)
      .single()

    if (fetchErr || !q) {
      console.log(`  [FAIL] ${item.id}: ${fetchErr?.message}`)
      results.fix2.failed.push({ id: item.id, reason: fetchErr?.message })
      continue
    }

    const { error: updateErr } = await supabase
      .from('quiz_questions')
      .update({ explanation: target.newExpl })
      .eq('id', item.id)

    if (updateErr) {
      console.log(`  [FAIL] ${item.id}: ${updateErr.message}`)
      results.fix2.failed.push({ id: item.id, reason: updateErr.message })
    } else {
      console.log(`  [OK] ${item.id} — ${q.explanation?.length || 0}자 → ${target.newExpl.length}자`)
      results.fix2.success.push(item.id)
    }
  }
}

// ─────────────────────────────────────────────
// 수정 3: tags 빈값 문항 자동 배정
// ─────────────────────────────────────────────

const SUBJECT_TAG_MAP = {
  'introduction': { '주제': ['개론', '특수교육 기초'], 'KICE가중치': '중' },
  'inclusive-education': { '주제': ['통합교육', 'IEP'], 'KICE가중치': '중상' },
  'inclusion': { '주제': ['통합교육', 'IEP'], 'KICE가중치': '중상' },
  'behavior-support': { '주제': ['행동지원', 'PBS'], 'KICE가중치': '상' },
  'transition': { '주제': ['전환교육', 'IDEA'], 'KICE가중치': '중' },
  'visual': { '주제': ['시각장애'], 'KICE가중치': '상' },
  'hearing': { '주제': ['청각장애'], 'KICE가중치': '중상' },
  'communication-disorder': { '주제': ['의사소통장애', 'AAC'], 'KICE가중치': '상' },
  'physical-disability': { '주제': ['지체장애', '뇌성마비'], 'KICE가중치': '중' },
}

// audit 검사 3 대상 168건 — 허용 과목만 추출
const TAGS_NULL_IDS = [
  { id: 'bs-q53', subject: 'behavior-support' },
  { id: 'inc-q32', subject: 'inclusive-education' },
  { id: 'bs-q94', subject: 'behavior-support' },
  { id: 'trans-q54', subject: 'transition' },
  { id: 'bs-q40', subject: 'behavior-support' },
  { id: 'trans-q31', subject: 'transition' },
  { id: 'bs-q52', subject: 'behavior-support' },
  { id: 'intro-q47', subject: 'introduction' },
  { id: 'trans-q65', subject: 'transition' },
  { id: 'bs-q55', subject: 'behavior-support' },
  { id: 'bs-q38', subject: 'behavior-support' },
  { id: 'inc-q43', subject: 'inclusive-education' },
  { id: 'inc-q45', subject: 'inclusive-education' },
  { id: 'trans-q43', subject: 'transition' },
  { id: 'trans-q44', subject: 'transition' },
  { id: 'intro-q35', subject: 'introduction' },
  { id: 'bs-q34', subject: 'behavior-support' },
  { id: 'inc-q35', subject: 'inclusive-education' },
  { id: 'bs-q57', subject: 'behavior-support' },
  { id: 'bs-q39', subject: 'behavior-support' },
  { id: 'bs-q36', subject: 'behavior-support' },
  { id: 'bs-q45', subject: 'behavior-support' },
  { id: 'bs-q95', subject: 'behavior-support' },
  { id: 'inc-q85', subject: 'inclusive-education' },
  // 금지 과목 제외: asmnt-*, cur-*, laws-*
]

async function fix3_emptyTags() {
  console.log('\n=== 수정 3: tags 빈값 자동 배정 ===')

  // 전체 허용 과목의 tags=null 문항을 DB에서 직접 조회
  const allowedSubjectSlugs = Object.keys(SUBJECT_TAG_MAP)

  // 허용 과목별로 tags null인 문항 조회
  let allNullTagRows = []
  for (const subjectSlug of allowedSubjectSlugs) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, subject, type, tags')
      .eq('subject', subjectSlug)
      .is('tags', null)

    if (error) {
      console.log(`  [WARN] subject=${subjectSlug} 조회 오류: ${error.message}`)
      continue
    }
    if (data && data.length > 0) {
      allNullTagRows.push(...data)
    }
  }

  // tags = {} (빈 객체) 인 경우도 조회
  for (const subjectSlug of allowedSubjectSlugs) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, subject, type, tags')
      .eq('subject', subjectSlug)
      .not('tags', 'is', null)

    if (error) continue
    if (data) {
      const emptyTagRows = data.filter(r => {
        if (!r.tags) return false
        if (typeof r.tags === 'object') return Object.keys(r.tags).length === 0
        return false
      })
      allNullTagRows.push(...emptyTagRows)
    }
  }

  console.log(`  대상 문항 총 ${allNullTagRows.length}건 (허용 과목 tags null/빈값)`)

  let successCount = 0
  let failCount = 0

  for (const row of allNullTagRows) {
    const subjectMap = SUBJECT_TAG_MAP[row.subject]
    if (!subjectMap) {
      failCount++
      continue
    }

    const newTags = {
      ...subjectMap,
      '유형': [row.type || 'unknown'],
    }

    const { error: updateErr } = await supabase
      .from('quiz_questions')
      .update({ tags: newTags })
      .eq('id', row.id)

    if (updateErr) {
      console.log(`  [FAIL] ${row.id}: ${updateErr.message}`)
      failCount++
    } else {
      successCount++
    }
  }

  results.fix3.success = successCount
  results.fix3.failed = failCount
  results.fix3.total = allNullTagRows.length
  console.log(`  완료: 성공 ${successCount}건, 실패 ${failCount}건`)
}

// ─────────────────────────────────────────────
// 수정 4: 실제 콘텐츠 중복 처리
// ─────────────────────────────────────────────

async function fix4_duplicates() {
  console.log('\n=== 수정 4: 콘텐츠 중복 처리 ===')

  // is_active 컬럼 존재 여부 확인
  const { data: testRow, error: testErr } = await supabase
    .from('quiz_questions')
    .select('is_active')
    .limit(1)

  const hasIsActive = !testErr && testRow !== null && testRow.length > 0 && 'is_active' in testRow[0]
  results.fix4.is_active_exists = hasIsActive
  console.log(`  is_active 컬럼 존재: ${hasIsActive}`)

  // 중복 그룹 1: inc-q83, intro-q111, intro-q154 (삽입교수) — cur-q141은 수정 금지
  const dupGroup1 = ['inc-q83', 'intro-q111', 'intro-q154']

  // 중복 그룹 2: cd-q62, cd-q63 (EMT 기법)
  const dupGroup2 = ['cd-q62', 'cd-q63']

  for (const group of [dupGroup1, dupGroup2]) {
    const { data: rows, error: fetchErr } = await supabase
      .from('quiz_questions')
      .select('id, subject, question, explanation, type')
      .in('id', group)

    if (fetchErr || !rows) {
      console.log(`  [FAIL] 그룹 ${group.join(',')} 조회 실패: ${fetchErr?.message}`)
      results.fix4.actions.push({ group, status: 'fetch_error', reason: fetchErr?.message })
      continue
    }

    console.log(`  그룹 [${group.join(', ')}] — ${rows.length}건 조회됨`)
    for (const r of rows) {
      console.log(`    ${r.id}: question=${r.question?.substring(0, 60)}... (expl ${r.explanation?.length || 0}자)`)
    }

    if (!hasIsActive) {
      console.log(`  → is_active 컬럼 없음: soft-delete 불가, 결과만 보고`)
      results.fix4.actions.push({
        group,
        status: 'no_is_active_column',
        note: '삭제 불가 — is_active 컬럼 없음. 수동 처리 필요.',
        rows: rows.map(r => ({ id: r.id, explLen: r.explanation?.length || 0 })),
      })
      continue
    }

    // is_active 있는 경우: explanation이 짧거나 question이 짧은 쪽 soft-delete
    // cur-q141은 건드리지 않으므로 제외됨 (group에 포함 안 됨)
    const sorted = [...rows].sort((a, b) => {
      const aScore = (a.explanation?.length || 0) + (a.question?.length || 0)
      const bScore = (b.explanation?.length || 0) + (b.question?.length || 0)
      return bScore - aScore // 내림차순 (가장 상세한 것이 앞)
    })

    // 가장 상세한 1건 유지, 나머지 soft-delete
    const toKeep = sorted[0]
    const toDeactivate = sorted.slice(1)

    console.log(`  → 유지: ${toKeep.id} (점수 ${(toKeep.explanation?.length || 0) + (toKeep.question?.length || 0)})`)

    for (const item of toDeactivate) {
      console.log(`  → soft-delete: ${item.id}`)
      const { error: deactivateErr } = await supabase
        .from('quiz_questions')
        .update({ is_active: false })
        .eq('id', item.id)

      if (deactivateErr) {
        console.log(`    [FAIL] ${item.id}: ${deactivateErr.message}`)
        results.fix4.actions.push({ group, id: item.id, status: 'deactivate_failed', reason: deactivateErr.message })
      } else {
        console.log(`    [OK] ${item.id} is_active=false`)
        results.fix4.actions.push({ group, id: item.id, status: 'deactivated', kept: toKeep.id })
      }
    }
  }
}

// ─────────────────────────────────────────────
// 메인 실행
// ─────────────────────────────────────────────

async function main() {
  console.log('=== fix-w2-audit.mjs 시작 ===')
  console.log(`실행 시각: ${new Date().toISOString()}`)

  await fix1_outdatedTerms()
  await fix2_shortExplanations()
  await fix3_emptyTags()
  await fix4_duplicates()

  console.log('\n=== 최종 결과 요약 ===')
  console.log('\n[수정 1] 구형 용어 교체')
  console.log(`  성공: ${results.fix1.success.length}건`)
  for (const s of results.fix1.success) {
    console.log(`    ${s.id} — ${s.terms.join(', ')}`)
  }
  if (results.fix1.failed.length > 0) {
    console.log(`  실패: ${results.fix1.failed.length}건`)
    for (const f of results.fix1.failed) console.log(`    ${f.id}: ${f.reason}`)
  }

  console.log('\n[수정 2] explanation 보강')
  console.log(`  성공: ${results.fix2.success.length}건 — ${results.fix2.success.join(', ')}`)
  console.log(`  건너뜀: ${results.fix2.skipped.length}건 (금지 과목 또는 보강 내용 미준비)`)
  if (results.fix2.failed.length > 0) {
    console.log(`  실패: ${results.fix2.failed.length}건`)
  }

  console.log('\n[수정 3] tags 배정')
  console.log(`  총 대상: ${results.fix3.total || 0}건 (허용 과목 tags null/빈값)`)
  console.log(`  성공: ${results.fix3.success}건`)
  console.log(`  실패: ${results.fix3.failed}건`)

  console.log('\n[수정 4] 중복 처리')
  console.log(`  is_active 컬럼: ${results.fix4.is_active_exists ? '있음' : '없음'}`)
  for (const action of results.fix4.actions) {
    if (action.status === 'deactivated') {
      console.log(`  [OK] ${action.id} → soft-delete (유지: ${action.kept})`)
    } else if (action.status === 'no_is_active_column') {
      console.log(`  [INFO] 그룹 [${action.group?.join(', ')}] — ${action.note}`)
    } else {
      console.log(`  [${action.status}] ${action.id || action.group}: ${action.reason || ''}`)
    }
  }

  const totalSuccess =
    results.fix1.success.length +
    results.fix2.success.length +
    results.fix3.success +
    results.fix4.actions.filter(a => a.status === 'deactivated').length

  const totalFailed =
    results.fix1.failed.length +
    results.fix2.failed.length +
    results.fix3.failed +
    results.fix4.actions.filter(a => a.status === 'deactivate_failed' || a.status === 'fetch_error').length

  console.log(`\n전체: 성공 ${totalSuccess}건, 실패 ${totalFailed}건`)
}

main().catch(err => {
  console.error('스크립트 오류:', err)
  process.exit(1)
})
