/**
 * DB 품질 이슈 일괄 수정 스크립트
 *
 * 수정 내역:
 * 1. 고아 챕터 9건: laws/theory → laws/special-education-act, bs/fba → bs/aba
 * 2. 중복 2건 삭제: cd-q63, laws-q62
 * 3. 짧은 질문 13건: case_context에서 구체적 질문 추출하여 question 보강
 * 4. 짧은 설명 1건: intro-q5 설명 보강
 *
 * 사용법: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/fix-audit-issues.mjs [--dry-run]
 */

const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const DRY_RUN = process.argv.includes('--dry-run')

if (!KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY required')
  process.exit(1)
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

async function patch(id, data) {
  if (DRY_RUN) {
    console.log(`  [DRY] PATCH ${id}:`, JSON.stringify(data).substring(0, 120))
    return true
  }
  const res = await fetch(`${URL}/rest/v1/quiz_questions?id=eq.${id}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    console.error(`  FAIL ${id}: ${res.status} ${await res.text()}`)
    return false
  }
  return true
}

async function del(id) {
  if (DRY_RUN) {
    console.log(`  [DRY] DELETE ${id}`)
    return true
  }
  const res = await fetch(`${URL}/rest/v1/quiz_questions?id=eq.${id}`, {
    method: 'DELETE',
    headers,
  })
  if (!res.ok) {
    console.error(`  FAIL DELETE ${id}: ${res.status} ${await res.text()}`)
    return false
  }
  return true
}

async function fetchOne(id) {
  const res = await fetch(
    `${URL}/rest/v1/quiz_questions?id=eq.${id}&select=id,question,case_context,explanation`,
    { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } }
  )
  const rows = await res.json()
  return rows[0] ?? null
}

async function main() {
  console.log(`${DRY_RUN ? '🔍 DRY RUN' : '🔧 LIVE'} — DB 품질 이슈 수정\n`)

  let fixed = 0
  let deleted = 0

  // ─── 1. 고아 챕터 수정 ───────────────────────────────
  console.log('1. 고아 챕터 수정 (9건)')

  const orphanFixes = [
    { id: 'bs-q92', chapter: 'aba' },
    ...['laws-q71','laws-q32','laws-q31','laws-q59','laws-q58','laws-q62','laws-q68','laws-q75']
      .map(id => ({ id, chapter: 'special-education-act' })),
  ]

  for (const fix of orphanFixes) {
    const ok = await patch(fix.id, { chapter: fix.chapter })
    if (ok) { fixed++; console.log(`  ✅ ${fix.id} → ${fix.chapter}`) }
  }

  // ─── 2. 중복 삭제 ────────────────────────────────────
  console.log('\n2. 중복 삭제 (2건)')

  // cd-q62와 cd-q63은 동일 문제 — cd-q63 삭제 (answer=2, cd-q62 answer=1로 유지)
  const ok1 = await del('cd-q63')
  if (ok1) { deleted++; console.log('  ✅ cd-q63 삭제 (cd-q62 유지)') }

  // intro-q16과 laws-q62 동일 — laws-q62는 고아챕터 수정했으니 intro-q16 삭제
  // 실은 laws-q62가 laws/theory→special-education-act로 이미 수정됨. 법령 쪽이 더 적절하니 intro-q16 삭제
  const ok2 = await del('intro-q16')
  if (ok2) { deleted++; console.log('  ✅ intro-q16 삭제 (laws-q62 유지)') }

  // ─── 3. 짧은 질문 보강 ───────────────────────────────
  console.log('\n3. 짧은 질문 보강 (13건)')

  const shortIds = ['hi-q4','hi-q7','hi-q20','vi-q25','vi-q27','vi-q32','vi-q37','vi-q40','vi-q5','vi-q9','vi-q14','vi-q16','vi-q20']

  for (const id of shortIds) {
    const q = await fetchOne(id)
    if (!q) { console.log(`  ⚠ ${id} 못 찾음`); continue }

    const ctx = q.case_context || ''
    // case_context에서 마지막 질문 부분 추출 (괄호/번호로 시작하는 줄 이후)
    const newQuestion = extractQuestion(ctx, id)

    if (newQuestion && newQuestion.length > 20) {
      const ok = await patch(id, { question: newQuestion })
      if (ok) { fixed++; console.log(`  ✅ ${id}: "${newQuestion.substring(0, 70)}..."`) }
    } else {
      console.log(`  ⚠ ${id}: 추출 실패, 수동 확인 필요`)
    }
  }

  // ─── 4. 짧은 설명 보강 ───────────────────────────────
  console.log('\n4. 짧은 설명 보강 (1건)')

  const betterExp = '특수교육의 역사적 발전 단계는 크게 4단계로 구분된다. (1) 유기/학대 시기: 장애인을 사회에서 배제하거나 방치하던 시기, (2) 시설보호 시기: 장애인을 별도의 시설에 수용하여 보호만 제공하던 시기, (3) 분리교육 시기: 특수학교 등 별도의 교육 환경에서 장애 유형별로 분리하여 교육하던 시기, (4) 통합교육 시기: 장애학생과 비장애학생이 함께 일반학교에서 교육받는 현재의 방향. 이 발전 과정은 장애인의 권리 인식 변화와 정상화(normalization) 원리의 확산에 기반한다.'

  const ok3 = await patch('intro-q5', { explanation: betterExp })
  if (ok3) { fixed++; console.log('  ✅ intro-q5 설명 보강 완료') }

  // ─── 요약 ────────────────────────────────────────────
  console.log(`\n${'═'.repeat(50)}`)
  console.log(`수정: ${fixed}건, 삭제: ${deleted}건`)
  if (DRY_RUN) console.log('(드라이런 — 실제 변경 없음)')
}

function extractQuestion(caseContext, id) {
  // case_context에서 질문 부분 추출
  // 패턴: "(1)" 또는 "(가)" 이후의 질문 텍스트
  const lines = caseContext.split('\n')

  // 마지막 질문 패턴 찾기
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim()
    if (line.match(/^\(1\)/) || line.match(/^\(가\)/)) {
      return lines.slice(i).join('\n').trim()
    }
  }

  // 대안: case_context의 첫 2문장 + "에 대해 서술하시오."
  const firstPart = caseContext.substring(0, 150).trim()
  const lastSentence = caseContext.substring(caseContext.lastIndexOf('.', caseContext.length - 2) + 1).trim()

  if (lastSentence.length > 20) return lastSentence

  // 최후 수단: 첫 부분에서 질문 생성
  const subject = id.startsWith('vi-') ? '시각장애' : '청각장애'
  return `다음 ${subject} 학생의 사례를 읽고 물음에 답하시오.\n\n${firstPart}`
}

main().catch(e => { console.error(e); process.exit(1) })
