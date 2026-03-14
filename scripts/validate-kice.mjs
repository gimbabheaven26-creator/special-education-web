#!/usr/bin/env node
/**
 * KICE JSON 검증 스크립트
 *
 * 검증 항목:
 * 1. 필수 필드 존재 확인
 * 2. TODO 플레이스홀더 잔존 여부
 * 3. _ref 필드 잔존 여부 (제거 권장)
 * 4. 문항 수/배점 일관성
 * 5. 빈 문자열/배열 확인
 *
 * 사용법: node scripts/validate-kice.mjs <파일경로> [--strict]
 */

import { readFileSync, existsSync } from 'fs'

const args = process.argv.slice(2)
const filePath = args.find(a => !a.startsWith('--'))
const strict = args.includes('--strict')

if (!filePath) {
  console.error('사용법: node scripts/validate-kice.mjs <파일.json> [--strict]')
  process.exit(1)
}

if (!existsSync(filePath)) {
  console.error(`파일을 찾을 수 없습니다: ${filePath}`)
  process.exit(1)
}

const data = JSON.parse(readFileSync(filePath, 'utf-8'))
const errors = []
const warnings = []

function err(msg) { errors.push(msg) }
function warn(msg) { warnings.push(msg) }

// ─── 1. exam 메타 검증 ──────────────────────────────────
const exam = data.exam
if (!exam) {
  err('exam 필드가 없습니다')
} else {
  for (const field of ['year', 'title', 'subject', 'session', 'total_questions', 'total_points', 'duration_minutes']) {
    if (exam[field] === undefined) err(`exam.${field} 누락`)
  }
  if (!exam.question_types) {
    err('exam.question_types 누락')
  }
}

// ─── 2. questions 배열 검증 ─────────────────────────────
const questions = data.questions
if (!Array.isArray(questions)) {
  err('questions 배열이 없습니다')
} else {
  // 문항 수 일치
  if (exam && questions.length !== exam.total_questions) {
    err(`문항 수 불일치: exam.total_questions=${exam.total_questions}, 실제=${questions.length}`)
  }

  // 총 배점 일치
  const totalPts = questions.reduce((sum, q) => sum + (q.points || 0), 0)
  if (exam && totalPts !== exam.total_points) {
    err(`배점 불일치: exam.total_points=${exam.total_points}, 실제 합계=${totalPts}`)
  }

  // 유형별 문항 수
  if (exam?.question_types) {
    const fillCount = questions.filter(q => q.type === 'fill_in').length
    const descCount = questions.filter(q => q.type === 'descriptive').length
    const expected = exam.question_types

    if (expected.fill_in && fillCount !== expected.fill_in.count) {
      err(`서술형 문항 수 불일치: 예상=${expected.fill_in.count}, 실제=${fillCount}`)
    }
    if (expected.descriptive && descCount !== expected.descriptive.count) {
      err(`논술형 문항 수 불일치: 예상=${expected.descriptive.count}, 실제=${descCount}`)
    }
  }

  // 개별 문항 검증
  for (const q of questions) {
    const prefix = `Q${q.number}`

    // 필수 필드
    for (const field of ['number', 'points', 'type', 'subjects', 'chapters', 'keywords', 'context']) {
      if (q[field] === undefined) err(`${prefix}: ${field} 누락`)
    }

    // 빈 배열 확인
    if (Array.isArray(q.subjects) && q.subjects.length === 0) err(`${prefix}: subjects가 비어있음`)
    if (Array.isArray(q.chapters) && q.chapters.length === 0) err(`${prefix}: chapters가 비어있음`)
    if (Array.isArray(q.keywords) && q.keywords.length === 0) err(`${prefix}: keywords가 비어있음`)

    // fill_in → blanks 필수
    if (q.type === 'fill_in' && !q.blanks) {
      err(`${prefix}: fill_in 문항에 blanks 필드가 없습니다`)
    }

    // descriptive → model_answer (strict 모드에서만 필수)
    if (q.type === 'descriptive' && !q.model_answer) {
      if (strict) {
        err(`${prefix}: descriptive 문항에 model_answer 필드가 없습니다`)
      } else {
        warn(`${prefix}: descriptive 문항에 model_answer가 없습니다`)
      }
    }

    // TODO 잔존 확인
    const qStr = JSON.stringify(q)
    const todoMatches = qStr.match(/TODO/g)
    if (todoMatches) {
      err(`${prefix}: TODO가 ${todoMatches.length}개 남아있습니다`)
    }

    // _ref 필드 잔존 (warning)
    const refMatches = qStr.match(/"_ref[^"]*"/g)
    if (refMatches) {
      warn(`${prefix}: _ref 필드가 ${refMatches.length}개 남아있습니다 (완성 후 제거 권장)`)
    }

    // context 최소 길이
    if (typeof q.context === 'string' && q.context.length < 20) {
      warn(`${prefix}: context가 너무 짧습니다 (${q.context.length}자)`)
    }

    // fill_in blanks 답안 확인
    if (q.blanks) {
      for (const [key, val] of Object.entries(q.blanks)) {
        if (!val.answer) err(`${prefix}: blanks["${key}"].answer 누락`)
        if (val.answer === 'TODO') err(`${prefix}: blanks["${key}"].answer가 TODO`)
      }
    }

    // descriptive model_answer 내용 확인
    if (q.model_answer) {
      if (typeof q.model_answer === 'object' && q.model_answer.content === 'TODO: 모범답안 작성') {
        err(`${prefix}: model_answer가 TODO 상태`)
      }
    }

    // strict: keywords에 TODO 포함 불가
    if (strict && Array.isArray(q.keywords)) {
      const hasTodo = q.keywords.some(k => k.includes('TODO'))
      if (hasTodo) err(`${prefix}: keywords에 TODO가 포함되어 있습니다`)
    }
  }
}

// ─── 결과 출력 ───────────────────────────────────────────
console.log(`\n검증: ${filePath}\n`)

if (errors.length === 0 && warnings.length === 0) {
  console.log('✅ 모든 검증 통과!')
} else {
  if (errors.length > 0) {
    console.log(`❌ 오류 ${errors.length}건:`)
    for (const e of errors) console.log(`  - ${e}`)
  }
  if (warnings.length > 0) {
    console.log(`\n⚠ 경고 ${warnings.length}건:`)
    for (const w of warnings) console.log(`  - ${w}`)
  }
}

console.log('')
process.exit(errors.length > 0 ? 1 : 0)
