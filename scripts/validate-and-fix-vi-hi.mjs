/**
 * validate-and-fix-vi-hi.mjs
 * vi-q109~vi-q148, hi-q87~hi-q126 contract.md 규칙 검증 및 자동 수정
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ── ID 범위 생성 ──────────────────────────────────────────────
function range(prefix, start, end) {
  const ids = []
  for (let i = start; i <= end; i++) {
    ids.push(`${prefix}${i}`)
  }
  return ids
}

const viIds = range('vi-q', 109, 148)
const hiIds = range('hi-q', 87, 126)
const allIds = [...viIds, ...hiIds]

// ── 금지 문구 (wrong_explanations 내) ─────────────────────────
const BANNED_PHRASES = ['이 설명이 옳다', '옳은 설명이다', '정확하다', '맞다']

// ── 검증 함수 ─────────────────────────────────────────────────
function validateQuestion(q) {
  const issues = []

  // 1. answer 형식
  if (q.type === 'multiple') {
    if (!['0', '1', '2', '3'].includes(q.answer)) {
      issues.push({ rule: 'answer_format', detail: `answer="${q.answer}" must be "0"/"1"/"2"/"3"` })
    }
  } else if (q.type === 'ox') {
    if (!['O', 'X'].includes(q.answer)) {
      issues.push({ rule: 'answer_format', detail: `answer="${q.answer}" must be "O" or "X" (uppercase)` })
    }
  }

  // 2. wrong_explanations 형식
  if (q.type === 'multiple') {
    if (!q.wrong_explanations || typeof q.wrong_explanations !== 'object') {
      issues.push({ rule: 'wrong_exp_null', detail: 'wrong_explanations must be a non-null object for multiple' })
    } else {
      // 정답 인덱스 키 포함 금지
      if (q.answer && q.wrong_explanations[q.answer] !== undefined) {
        issues.push({ rule: 'wrong_exp_has_answer_key', detail: `wrong_explanations has key "${q.answer}" (same as answer)` })
      }
      // "4" 키 금지
      if (q.wrong_explanations['4'] !== undefined) {
        issues.push({ rule: 'wrong_exp_key4', detail: 'wrong_explanations has forbidden key "4"' })
      }
      // 빈 객체 금지
      if (Object.keys(q.wrong_explanations).length === 0) {
        issues.push({ rule: 'wrong_exp_empty', detail: 'wrong_explanations is empty object {}' })
      }
      // 금지 문구 검사
      for (const [key, val] of Object.entries(q.wrong_explanations)) {
        if (typeof val === 'string') {
          for (const phrase of BANNED_PHRASES) {
            if (val.includes(phrase)) {
              issues.push({ rule: 'banned_phrase', detail: `wrong_explanations["${key}"] contains banned phrase: "${phrase}"` })
            }
          }
        }
      }
    }
  } else if (q.type === 'ox' || q.type === 'fill_in') {
    if (q.wrong_explanations !== null) {
      issues.push({ rule: 'wrong_exp_not_null', detail: `wrong_explanations must be null for type="${q.type}", got: ${JSON.stringify(q.wrong_explanations)}` })
    }
  }

  // 3. options 형식
  if (q.type === 'multiple') {
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      issues.push({ rule: 'options_length', detail: `options must be array[4], got: ${JSON.stringify(q.options)}` })
    }
  } else if (q.type === 'ox' || q.type === 'fill_in') {
    if (q.options !== null && !(Array.isArray(q.options) && q.options.length === 0)) {
      // null이어야 함, 빈 배열도 금지
      if (Array.isArray(q.options) && q.options.length === 0) {
        issues.push({ rule: 'options_empty_array', detail: `options must be null for type="${q.type}", got []` })
      } else if (q.options !== null) {
        issues.push({ rule: 'options_not_null', detail: `options must be null for type="${q.type}", got: ${JSON.stringify(q.options)}` })
      }
    }
    // 빈 배열도 금지
    if (Array.isArray(q.options) && q.options.length === 0) {
      issues.push({ rule: 'options_empty_array', detail: `options must be null for type="${q.type}", got []` })
    }
  }

  // 4. explanation NOT NULL + 30자 이상
  if (!q.explanation || typeof q.explanation !== 'string') {
    issues.push({ rule: 'explanation_null', detail: 'explanation is null or missing' })
  } else if (q.explanation.trim().length < 30) {
    issues.push({ rule: 'explanation_short', detail: `explanation too short: ${q.explanation.trim().length} chars` })
  }

  return issues
}

// ── 자동 수정 가능 여부 판별 ──────────────────────────────────
function buildFix(q, issues) {
  const patch = {}
  const unfixable = []

  for (const issue of issues) {
    switch (issue.rule) {
      case 'answer_format': {
        if (q.type === 'ox') {
          // "0" → "O", "1" → "X", 그 외는 수동 필요
          if (q.answer === '0') { patch.answer = 'O'; break }
          if (q.answer === '1') { patch.answer = 'X'; break }
          if (q.answer === 'o') { patch.answer = 'O'; break }
          if (q.answer === 'x') { patch.answer = 'X'; break }
        }
        unfixable.push(issue)
        break
      }
      case 'wrong_exp_not_null': {
        patch.wrong_explanations = null
        break
      }
      case 'wrong_exp_has_answer_key': {
        // 정답 키 제거
        if (!patch.wrong_explanations) {
          patch.wrong_explanations = { ...q.wrong_explanations }
        }
        const ansKey = q.answer
        delete patch.wrong_explanations[ansKey]
        break
      }
      case 'wrong_exp_key4': {
        if (!patch.wrong_explanations) {
          patch.wrong_explanations = { ...q.wrong_explanations }
        }
        delete patch.wrong_explanations['4']
        break
      }
      case 'options_empty_array':
      case 'options_not_null': {
        if (q.type === 'ox' || q.type === 'fill_in') {
          patch.options = null
        } else {
          unfixable.push(issue)
        }
        break
      }
      case 'banned_phrase': {
        unfixable.push(issue)
        break
      }
      case 'wrong_exp_empty':
      case 'wrong_exp_null':
      case 'options_length':
      case 'explanation_null':
      case 'explanation_short': {
        unfixable.push(issue)
        break
      }
      default:
        unfixable.push(issue)
    }
  }

  return { patch, unfixable }
}

// ── 메인 ──────────────────────────────────────────────────────
async function main() {
  console.log(`\n=== Contract.md 검증 시작 ===`)
  console.log(`대상: vi-q109~vi-q148 (${viIds.length}개), hi-q87~hi-q126 (${hiIds.length}개)`)
  console.log(`총 ${allIds.length}개\n`)

  // 1. 데이터 가져오기
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('id', allIds)

  if (error) {
    console.error('Fetch error:', error)
    process.exit(1)
  }

  console.log(`실제 조회된 문항: ${data.length}개`)

  // ID 누락 확인
  const foundIds = new Set(data.map(q => q.id))
  const missing = allIds.filter(id => !foundIds.has(id))
  if (missing.length > 0) {
    console.log(`\n[주의] DB에 없는 ID (${missing.length}개):`, missing.join(', '))
  }

  // 2. 검증
  const allViolations = []
  let totalIssues = 0
  const ruleCount = {}

  for (const q of data) {
    const issues = validateQuestion(q)
    if (issues.length > 0) {
      allViolations.push({ q, issues })
      totalIssues += issues.length
      for (const iss of issues) {
        ruleCount[iss.rule] = (ruleCount[iss.rule] || 0) + 1
      }
    }
  }

  console.log(`\n--- 검증 결과 ---`)
  console.log(`위반 문항: ${allViolations.length}개 / 전체 ${data.length}개`)
  console.log(`총 위반 건수: ${totalIssues}건`)

  if (Object.keys(ruleCount).length > 0) {
    console.log('\n규칙별 위반 건수:')
    for (const [rule, cnt] of Object.entries(ruleCount)) {
      console.log(`  ${rule}: ${cnt}건`)
    }
  }

  if (allViolations.length === 0) {
    console.log('\n모든 문항이 contract.md 규칙을 준수합니다.')
    return
  }

  // 3. 수정 시도
  console.log('\n--- 수정 시작 ---')
  let fixedCount = 0
  let failedCount = 0
  const unfixableList = []

  for (const { q, issues } of allViolations) {
    const { patch, unfixable } = buildFix(q, issues)

    if (unfixable.length > 0) {
      for (const iss of unfixable) {
        unfixableList.push({ id: q.id, type: q.type, issue: iss })
      }
    }

    if (Object.keys(patch).length > 0) {
      console.log(`\n[수정] ${q.id} (type=${q.type})`)
      console.log(`  patch:`, JSON.stringify(patch, null, 2))

      const { error: updateError } = await supabase
        .from('quiz_questions')
        .update(patch)
        .eq('id', q.id)

      if (updateError) {
        console.error(`  ✗ 수정 실패:`, updateError.message)
        failedCount++
      } else {
        console.log(`  ✓ 수정 성공`)
        fixedCount++
      }
    }
  }

  // 4. 결과 요약
  console.log('\n=== 수정 결과 요약 ===')
  console.log(`수정 성공: ${fixedCount}건`)
  console.log(`수정 실패: ${failedCount}건`)
  console.log(`수동 수정 필요: ${unfixableList.length}건`)

  if (unfixableList.length > 0) {
    console.log('\n--- 수동 수정 필요 목록 ---')
    for (const item of unfixableList) {
      console.log(`  [${item.id}] type=${item.type} | rule=${item.issue.rule} | ${item.issue.detail}`)
    }
  }

  // 5. 검증 후 재확인 (수정된 문항)
  if (fixedCount > 0) {
    console.log('\n--- 수정 후 재검증 ---')
    const fixedIds = allViolations
      .filter(({ q, issues }) => {
        const { patch } = buildFix(q, issues)
        return Object.keys(patch).length > 0
      })
      .map(({ q }) => q.id)

    const { data: reData, error: reError } = await supabase
      .from('quiz_questions')
      .select('*')
      .in('id', fixedIds)

    if (!reError && reData) {
      let reViolations = 0
      for (const q of reData) {
        const issues = validateQuestion(q)
        if (issues.length > 0) {
          reViolations++
          console.log(`  [재위반] ${q.id}:`, issues.map(i => i.rule).join(', '))
        }
      }
      if (reViolations === 0) {
        console.log(`  재검증 통과: ${reData.length}개 모두 정상`)
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
