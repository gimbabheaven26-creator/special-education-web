/**
 * fix-banned-phrases-vi-hi.mjs
 * banned_phrase 위반 6개 문항 수정
 *
 * 모든 문항: "옳지 않은 것은?" 유형 → wrong_explanations는 "옳은 선지" 설명
 * contract.md 규칙: "이 선지는 옳은 내용이어서 정답이 아니다."로 시작해야 함
 *
 * 전략: 금지 문구("맞다", "옳은 설명이다" 등) 포함 문장을
 *       "이 선지는 옳은 내용이어서 정답이 아니다. <핵심 내용>" 형태로 재작성
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_ROLE_KEY) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// ── 수작업 수정 데이터 ─────────────────────────────────────────
// 각 문항의 wrong_explanations를 contract.md 규정에 맞게 재작성
// "이 선지는 옳은 내용이어서 정답이 아니다. <핵심 설명>"

const FIXES = {
  'hi-q105': {
    "0": "이 선지는 옳은 내용이어서 정답이 아니다. 귀걸이형(BTE) 보청기는 귀 뒤에 본체가 위치하며 음관으로 소리를 전달한다.",
    "1": "이 선지는 옳은 내용이어서 정답이 아니다. 귓속형(ITE) 보청기는 귓바퀴 안쪽에 맞춤 제작된다.",
    "3": "이 선지는 옳은 내용이어서 정답이 아니다. 고막형(CIC) 보청기는 귓속형 중 가장 깊이 삽입되어 외관상 잘 보이지 않는다."
  },
  'hi-q92': {
    "0": "이 선지는 옳은 내용이어서 정답이 아니다. 분류사는 지시 대상의 형태·크기·움직임 등 시각적 특성을 손 모양으로 나타낸다.",
    "1": "이 선지는 옳은 내용이어서 정답이 아니다. 분류사를 통해 사물의 위치, 이동 경로, 방향을 표현할 수 있다.",
    "3": "이 선지는 옳은 내용이어서 정답이 아니다. 수레형 분류사는 바퀴 달린 이동 수단을 나타낼 때 사용된다."
  },
  'hi-q94': {
    "0": "이 선지는 옳은 내용이어서 정답이 아니다. 지문자는 한국어 자음·모음을 손 모양으로 나타낸 기호 체계이다.",
    "2": "이 선지는 옳은 내용이어서 정답이 아니다. 지문자는 한국수어에 없는 고유명사·전문용어 표현에 주로 사용된다.",
    "3": "이 선지는 옳은 내용이어서 정답이 아니다. 한국 지문자 자음은 한글 자음의 획 모양을 손으로 나타낸 형태에서 출발한다."
  },
  'vi-q115': {
    "0": "이 선지는 옳은 내용이어서 정답이 아니다. 약자는 빈번히 쓰이는 글자를 간결화한 규정으로, 읽기·쓰기 속도 향상을 목적으로 한다.",
    "1": "이 선지는 옳은 내용이어서 정답이 아니다. 'ㅎ'은 초성 약자가 없으며, 초성 약자는 일부 자음에만 존재한다.",
    "3": "이 선지는 옳은 내용이어서 정답이 아니다. 일부 약자는 특정 맥락(예: 외래어, 고유명사 등)에서 약자 대신 풀어쓰기를 허용한다."
  },
  'vi-q122': {
    "0": "이 선지는 옳은 내용이어서 정답이 아니다. 터치법은 지팡이 끝을 좌우로 번갈아 들었다 놓으며 장애물을 탐지하는 기본 보행 기법이다.",
    "1": "이 선지는 옳은 내용이어서 정답이 아니다. 슬라이드법은 지팡이 끝이 항상 지면에 접촉하여 노면의 질감·경사 변화를 감지하는 기법이다.",
    "3": "이 선지는 옳은 내용이어서 정답이 아니다. 상부보호법은 팔을 들어 올려 얼굴과 머리를 보호하는 기법으로, 지팡이와 무관하게 사용되는 기본 자기보호 기법이다."
  },
  'vi-q125': {
    "0": "이 선지는 옳은 내용이어서 정답이 아니다. 돋보기·망원경·단안경 등은 모두 렌즈를 활용하는 광학 기기이다.",
    "1": "이 선지는 옳은 내용이어서 정답이 아니다. 큰 활자 인쇄물, 독서대, 조명 기기는 광학 원리 없이 환경·자료를 수정하여 시기능을 지원하는 비광학 기기이다.",
    "2": "이 선지는 옳은 내용이어서 정답이 아니다. 화면 확대 소프트웨어(예: 줌텍스트), CCTV 독서기, 화면낭독 소프트웨어는 전자 보조기기에 해당한다."
  }
}

const BANNED_PHRASES = ['이 설명이 옳다', '옳은 설명이다', '정확하다', '맞다']
function hasBanned(text) {
  return BANNED_PHRASES.some(p => text.includes(p))
}

async function main() {
  console.log('=== banned_phrase 위반 수정 ===\n')

  // 1. 원본 데이터 가져오기 (검증용)
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('id', Object.keys(FIXES))

  if (error) { console.error('Fetch error:', error); process.exit(1) }
  if (!data) { console.error('no data'); process.exit(1) }

  console.log(`원본 조회: ${data.length}개\n`)

  let fixedCount = 0
  let failedCount = 0

  for (const q of data) {
    const fix = FIXES[q.id]
    if (!fix) continue

    // 기존 wrong_explanations에서 수정 대상이 아닌 키는 유지 (정답 키 없어야 함 확인)
    const newWE = { ...q.wrong_explanations }
    let changed = false

    for (const [key, fixedText] of Object.entries(fix)) {
      if (newWE[key] !== fixedText) {
        newWE[key] = fixedText
        changed = true
      }
    }

    if (!changed) {
      console.log(`[${q.id}] 이미 수정됨, skip`)
      continue
    }

    console.log(`[${q.id}] 수정 중...`)
    for (const [key, val] of Object.entries(fix)) {
      console.log(`  [${key}]: ${val.slice(0, 80)}`)
    }

    const { error: updateError } = await supabase
      .from('quiz_questions')
      .update({ wrong_explanations: newWE })
      .eq('id', q.id)

    if (updateError) {
      console.error(`  ✗ 실패:`, updateError.message)
      failedCount++
    } else {
      console.log(`  ✓ 성공`)
      fixedCount++
    }
  }

  console.log(`\n=== 수정 결과 ===`)
  console.log(`성공: ${fixedCount}건, 실패: ${failedCount}건`)

  // 2. 재검증
  console.log('\n--- 재검증 ---')
  const { data: reData } = await supabase
    .from('quiz_questions')
    .select('id, wrong_explanations')
    .in('id', Object.keys(FIXES))

  let remaining = 0
  for (const q of reData || []) {
    for (const [key, val] of Object.entries(q.wrong_explanations || {})) {
      if (typeof val === 'string' && hasBanned(val)) {
        console.log(`  [재위반] ${q.id} key="${key}": ${val.slice(0, 60)}`)
        remaining++
      }
    }
  }
  if (remaining === 0) {
    console.log(`  재검증 통과: 금지 문구 0건`)
  } else {
    console.log(`  재검증 실패: ${remaining}건 잔존`)
  }

  // 3. 전체 대상 범위 최종 검증
  console.log('\n--- 전체 범위 최종 검증 (vi-q109~vi-q148, hi-q87~hi-q126) ---')
  const allIds = []
  for (let i = 109; i <= 148; i++) allIds.push(`vi-q${i}`)
  for (let i = 87; i <= 126; i++) allIds.push(`hi-q${i}`)

  const { data: allData } = await supabase
    .from('quiz_questions')
    .select('id, type, answer, wrong_explanations, options, explanation')
    .in('id', allIds)

  let totalViolations = 0
  for (const q of allData || []) {
    const issues = []

    // answer 형식
    if (q.type === 'multiple' && !['0','1','2','3'].includes(q.answer)) {
      issues.push(`answer_format: "${q.answer}"`)
    }
    if (q.type === 'ox' && !['O','X'].includes(q.answer)) {
      issues.push(`answer_format: "${q.answer}"`)
    }

    // wrong_explanations
    if (q.type === 'multiple') {
      if (!q.wrong_explanations || Object.keys(q.wrong_explanations).length === 0) {
        issues.push('wrong_exp_empty')
      } else {
        if (q.wrong_explanations[q.answer] !== undefined) issues.push(`wrong_exp_has_answer_key[${q.answer}]`)
        if (q.wrong_explanations['4'] !== undefined) issues.push('wrong_exp_key4')
        for (const [k, v] of Object.entries(q.wrong_explanations)) {
          for (const p of BANNED_PHRASES) {
            if (typeof v === 'string' && v.includes(p)) issues.push(`banned_phrase[${k}]: "${p}"`)
          }
        }
      }
    } else if (['ox','fill_in'].includes(q.type)) {
      if (q.wrong_explanations !== null) issues.push(`wrong_exp_not_null: ${JSON.stringify(q.wrong_explanations)}`)
    }

    // options
    if (q.type === 'multiple') {
      if (!Array.isArray(q.options) || q.options.length !== 4) issues.push(`options_length: ${JSON.stringify(q.options)}`)
    } else if (['ox','fill_in'].includes(q.type)) {
      if (q.options !== null) issues.push(`options_not_null: ${JSON.stringify(q.options)}`)
    }

    // explanation
    if (!q.explanation || q.explanation.trim().length < 30) {
      issues.push(`explanation_short: ${q.explanation?.trim().length ?? 0}자`)
    }

    if (issues.length > 0) {
      console.log(`  [위반] ${q.id}: ${issues.join(' | ')}`)
      totalViolations += issues.length
    }
  }

  if (totalViolations === 0) {
    console.log(`  전체 ${allData.length}개 문항 contract.md 규칙 모두 통과`)
  } else {
    console.log(`  잔존 위반: ${totalViolations}건`)
  }
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
