/**
 * Data Validation Script — 2026-03-22
 * Target: 클루디 2026-03-19 세션 17건 수정 반영 여부 검증
 *   - answer 오류 5건 (multiple/ox 포맷 위반)
 *   - wrong_explanations 키 오류 11건 (텍스트 키 또는 포맷 오류)
 *   - wrong_explanations 정답 키 포함 1건
 *
 * Read-only — NO data modifications.
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ─── 이전 검증(2026-03-21)에서 기록된 잔존 위반 목록 ─────────────────────────
// 출처: project_validation-history.md "2026-03-21 기존 잔존 위반" 항목
const KNOWN_VIOLATIONS_2026_03_21 = {
  // multiple answer 위반 (answer 값이 "0"~"3" 아님)
  multipleAnswerViolations: ['cd-q33', 'hi-q15'],
  // ox answer 위반 ("O" 또는 "X" 아님)
  oxAnswerViolations: ['cd-q74', 'intro-q162', 'vi-q98'],
  // wrong_explanations 텍스트/"4" 키 위반
  weKeyViolations: ['cd-q37', 'hi-q29', 'laws-q66'],
  // wrong_explanations 정답 키 포함
  weCorrectKeyViolations: ['laws-q79'],
}

// 페이지네이션으로 전체 quiz_questions 로드
async function fetchAllQuizQuestions() {
  const PAGE_SIZE = 1000
  let page = 0
  const all = []
  while (true) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, type, answer, wrong_explanations, options')
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
      .order('id')
    if (error) throw new Error(`Supabase query failed: ${error.message}`)
    if (!data || data.length === 0) break
    all.push(...data)
    if (data.length < PAGE_SIZE) break
    page++
  }
  return all
}

function validateAnswerFormat(row) {
  const violations = []
  const { id, type, answer } = row

  if (type === 'multiple') {
    if (!['0', '1', '2', '3'].includes(answer)) {
      violations.push({
        id,
        rule: 'multiple-answer',
        detail: `answer="${answer}" (expected "0"~"3")`,
      })
    }
  }

  if (type === 'ox') {
    if (!['O', 'X'].includes(answer)) {
      violations.push({
        id,
        rule: 'ox-answer',
        detail: `answer="${answer}" (expected "O" or "X")`,
      })
    }
  }

  return violations
}

function validateWrongExplanations(row) {
  const violations = []
  const { id, type, answer, wrong_explanations: we } = row

  // fill_in, ox, descriptive는 wrong_explanations가 null이어야 함 (multiple만 사용)
  // contract.md는 NULL 허용으로 명시 — non-multiple에 WE가 있어도 오류는 아니나
  // multiple 유형에서 키 형식 검사
  if (type !== 'multiple') return violations
  if (!we) return violations

  // wrong_explanations는 jsonb: {"0": "...", "2": "..."} 형식이어야 함
  // 키는 "0"~"3" 범위의 숫자 문자열, 정답 인덱스 키는 포함 금지
  const allowedKeys = new Set(['0', '1', '2', '3'])

  let parsed
  if (typeof we === 'string') {
    try {
      parsed = JSON.parse(we)
    } catch {
      violations.push({ id, rule: 'we-parse-error', detail: 'wrong_explanations is invalid JSON string' })
      return violations
    }
  } else {
    parsed = we
  }

  for (const key of Object.keys(parsed)) {
    if (!allowedKeys.has(key)) {
      violations.push({
        id,
        rule: 'we-invalid-key',
        detail: `wrong_explanations has non-numeric key "${key}"`,
      })
    } else if (key === answer) {
      violations.push({
        id,
        rule: 'we-correct-key',
        detail: `wrong_explanations includes correct answer key "${key}" (answer="${answer}")`,
      })
    } else if (key === '4') {
      violations.push({
        id,
        rule: 'we-out-of-range-key',
        detail: `wrong_explanations has out-of-range key "4"`,
      })
    }
  }

  return violations
}

async function main() {
  console.log('=== Data Validation Report ===')
  console.log('Date: 2026-03-22')
  console.log('Target: answer + wrong_explanations 포맷 검증')
  console.log('Focus: 클루디 2026-03-19 세션 17건 수정 반영 여부')
  console.log('')

  console.log('Fetching quiz_questions from Supabase...')
  const rows = await fetchAllQuizQuestions()
  console.log(`Total rows fetched: ${rows.length}`)
  console.log('')

  const answerViolations = []
  const weViolations = []

  for (const row of rows) {
    answerViolations.push(...validateAnswerFormat(row))
    weViolations.push(...validateWrongExplanations(row))
  }

  // ─── Answer 위반 리포트 ───────────────────────────────────────────────────
  console.log('=== [1] Answer Format Violations ===')
  const multipleAnswerViol = answerViolations.filter(v => v.rule === 'multiple-answer')
  const oxAnswerViol = answerViolations.filter(v => v.rule === 'ox-answer')

  console.log(`Multiple answer violations: ${multipleAnswerViol.length}건`)
  for (const v of multipleAnswerViol.slice(0, 10)) {
    const tag = KNOWN_VIOLATIONS_2026_03_21.multipleAnswerViolations.includes(v.id) ? '[KNOWN]' : '[NEW]'
    console.log(`  ${tag} ${v.id}: ${v.detail}`)
  }

  console.log(`OX answer violations: ${oxAnswerViol.length}건`)
  for (const v of oxAnswerViol.slice(0, 10)) {
    const tag = KNOWN_VIOLATIONS_2026_03_21.oxAnswerViolations.includes(v.id) ? '[KNOWN]' : '[NEW]'
    console.log(`  ${tag} ${v.id}: ${v.detail}`)
  }

  // ─── Wrong Explanations 키 위반 리포트 ──────────────────────────────────
  console.log('')
  console.log('=== [2] Wrong Explanations Key Violations ===')
  const weInvalidKey = weViolations.filter(v => v.rule === 'we-invalid-key')
  const weCorrectKey = weViolations.filter(v => v.rule === 'we-correct-key')
  const weOutOfRange = weViolations.filter(v => v.rule === 'we-out-of-range-key')

  console.log(`Non-numeric key violations: ${weInvalidKey.length}건`)
  for (const v of weInvalidKey.slice(0, 10)) {
    const tag = KNOWN_VIOLATIONS_2026_03_21.weKeyViolations.includes(v.id) ? '[KNOWN]' : '[NEW]'
    console.log(`  ${tag} ${v.id}: ${v.detail}`)
  }

  console.log(`Correct-answer key included: ${weCorrectKey.length}건`)
  for (const v of weCorrectKey.slice(0, 10)) {
    const tag = KNOWN_VIOLATIONS_2026_03_21.weCorrectKeyViolations.includes(v.id) ? '[KNOWN]' : '[NEW]'
    console.log(`  ${tag} ${v.id}: ${v.detail}`)
  }

  console.log(`Out-of-range "4" key violations: ${weOutOfRange.length}건`)
  for (const v of weOutOfRange.slice(0, 10)) {
    console.log(`  ${v.id}: ${v.detail}`)
  }

  // ─── 2026-03-19 수정 대상 17건 직접 검증 ─────────────────────────────────
  console.log('')
  console.log('=== [3] 2026-03-19 수정 대상 17건 상태 확인 ===')

  // 이전 검증(2026-03-21)에서 잔존으로 기록된 항목들
  const targetIds = [
    // answer 오류 (5건) — 클루디 세션에서 수정 예정이었던 항목
    // 2026-03-21 기록에서 잔존: cd-q33, hi-q15, cd-q74, intro-q162, vi-q98
    'cd-q33', 'hi-q15', 'cd-q74', 'intro-q162', 'vi-q98',
    // wrong_explanations 키 오류 (11건) — 클루디가 수정 예정
    // 2026-03-21 기록: cd-q37, hi-q29, laws-q66 (잔존), 기타 이전 목록에서
    // 2026-03-19 최초 검증에서 41건 중 수정 예정 그룹
    'cd-q37', 'hi-q29', 'laws-q66', 'pd-q7', 'cd-q10',
    'laws-q79', 'laws-q46', 'laws-q41', 'laws-q93', 'laws-q84',
    // WE 정답 키 (1건)
    // laws-q79 포함됨 (위에서 이미 카운트)
  ]

  // 중복 제거
  const uniqueTargetIds = [...new Set(targetIds)]

  const targetMap = new Map(rows.map(r => [r.id, r]))

  console.log(`검증 대상 ID: ${uniqueTargetIds.length}건`)
  console.log('')

  let fixedCount = 0
  let stillViolatingCount = 0
  let notFoundCount = 0

  for (const targetId of uniqueTargetIds) {
    const row = targetMap.get(targetId)
    if (!row) {
      console.log(`  [NOT FOUND] ${targetId} — 행이 존재하지 않음`)
      notFoundCount++
      continue
    }

    const aViol = validateAnswerFormat(row)
    const wViol = validateWrongExplanations(row)
    const allViol = [...aViol, ...wViol]

    if (allViol.length === 0) {
      console.log(`  [FIXED] ${targetId} — 위반 없음 (수정 완료)`)
      fixedCount++
    } else {
      for (const v of allViol) {
        console.log(`  [STILL VIOLATING] ${v.id}: ${v.rule} — ${v.detail}`)
      }
      stillViolatingCount++
    }
  }

  console.log('')
  console.log('─── 17건 수정 검증 요약 ───')
  console.log(`FIXED:           ${fixedCount}건`)
  console.log(`STILL VIOLATING: ${stillViolatingCount}건`)
  console.log(`NOT FOUND:       ${notFoundCount}건`)

  // ─── 전체 요약 ────────────────────────────────────────────────────────────
  const totalAnswerViol = answerViolations.length
  const totalWeViol = weViolations.length
  const totalViol = totalAnswerViol + totalWeViol

  console.log('')
  console.log('=== [4] 전체 현황 요약 ===')
  console.log(`검사 대상: ${rows.length}건`)
  console.log(`Answer 위반: ${totalAnswerViol}건 (multiple=${multipleAnswerViol.length}, ox=${oxAnswerViol.length})`)
  console.log(`WE 위반: ${totalWeViol}건 (invalid-key=${weInvalidKey.length}, correct-key=${weCorrectKey.length}, out-of-range=${weOutOfRange.length})`)
  console.log(`총 위반: ${totalViol}건`)
  console.log('')

  // 결론
  if (stillViolatingCount === 0 && notFoundCount === 0) {
    console.log('결론: 17건 수정 완료 (모두 FIXED)')
  } else if (stillViolatingCount > 0) {
    console.log(`결론: 미완료 — ${stillViolatingCount}건 여전히 위반 중`)
  } else {
    console.log(`결론: 부분 완료 — ${fixedCount}건 FIXED, ${notFoundCount}건 NOT FOUND (행 삭제됐을 수 있음)`)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
