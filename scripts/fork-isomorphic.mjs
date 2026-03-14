#!/usr/bin/env node
/**
 * 동형문제 포크 파이프라인
 *
 * 원본 KICE JSON에서 동형문제 템플릿을 자동 생성합니다.
 * - 구조(문항 수, 유형, 배점, 과목, 챕터) 유지
 * - 내용(context, dialogue, sub_items, blanks, model_answer) → TODO 플레이스홀더
 * - 원본 내용을 _ref 필드에 보존 (작성자 참고용)
 *
 * 사용법:
 *   node scripts/fork-isomorphic.mjs <원본파일> [--type 동형|예상] [--output <경로>]
 *
 * 예시:
 *   node scripts/fork-isomorphic.mjs data/kice-기출/2026/전공A.json
 *   node scripts/fork-isomorphic.mjs data/kice-기출/2026/전공B.json --type 예상
 *   node scripts/fork-isomorphic.mjs data/kice-기출/2026/전공A.json --output data/kice-기출/2026/전공A-동형.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { basename, dirname, join } from 'path'

// ─── CLI 파싱 ────────────────────────────────────────────
const args = process.argv.slice(2)
const inputPath = args.find(a => !a.startsWith('--'))

if (!inputPath) {
  console.error('사용법: node scripts/fork-isomorphic.mjs <원본파일.json> [--type 동형|예상] [--output <경로>]')
  process.exit(1)
}

const typeFlag = getFlag('--type') || '동형'
if (!['동형', '예상'].includes(typeFlag)) {
  console.error('--type은 "동형" 또는 "예상"만 가능합니다.')
  process.exit(1)
}

const suffix = typeFlag === '동형' ? '-동형' : '-예상'

function getFlag(name) {
  const idx = args.indexOf(name)
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : null
}

// 출력 경로 결정
const outputPath = getFlag('--output') || (() => {
  const dir = dirname(inputPath)
  const base = basename(inputPath, '.json')
  return join(dir, `${base}${suffix}.json`)
})()

// ─── 원본 읽기 ───────────────────────────────────────────
if (!existsSync(inputPath)) {
  console.error(`파일을 찾을 수 없습니다: ${inputPath}`)
  process.exit(1)
}

const original = JSON.parse(readFileSync(inputPath, 'utf-8'))

// 이미 동형/예상인 파일은 포크 불가
if (original.exam.session.includes('-동형') || original.exam.session.includes('-예상')) {
  console.error('이미 동형/예상 파일입니다. 원본 파일을 지정해주세요.')
  process.exit(1)
}

// 출력 파일이 이미 존재하면 경고
if (existsSync(outputPath)) {
  console.error(`⚠ 이미 존재합니다: ${outputPath}`)
  console.error('  덮어쓰려면 --output 옵션으로 명시하거나 기존 파일을 삭제하세요.')
  process.exit(1)
}

// ─── 템플릿 생성 ─────────────────────────────────────────

function forkExamMeta(exam) {
  return {
    ...exam,
    session: `${exam.session}${suffix}`,
  }
}

function forkFillInQuestion(q) {
  const blanks = {}
  for (const [key, val] of Object.entries(q.blanks || {})) {
    blanks[key] = {
      description: `TODO: ${val.description || '빈칸 설명'}`,
      answer: 'TODO',
      _ref: val,
    }
  }

  return {
    number: q.number,
    points: q.points,
    type: q.type,
    subjects: [...q.subjects],
    chapters: [...q.chapters],
    keywords: ['TODO: 새 키워드 추가'],
    context: `TODO: 동일 주제(${q.subjects.join(', ')})의 새로운 지문 작성\n\n[원본 참고]\n${q.context}`,
    ...(q.dialogue ? {
      dialogue: [{ speaker: 'TODO', text: 'TODO: 원본과 같은 구조의 새 대화 작성' }],
      _ref_dialogue: q.dialogue,
    } : {}),
    ...(q.sub_items ? {
      sub_items: q.sub_items.map(si => ({
        label: si.label,
        title: `TODO: ${si.title || si.label}`,
        content: 'TODO: 새 내용 작성',
        _ref_content: si.content,
        ...(si.steps ? {
          steps: ['TODO: 새 단계 작성'],
          _ref_steps: si.steps,
        } : {}),
        ...(si.principle_note ? {
          principle_note: `TODO: ${si.principle_note}`,
        } : {}),
      })),
    } : {}),
    blanks,
  }
}

function forkDescriptiveQuestion(q) {
  return {
    number: q.number,
    points: q.points,
    type: q.type,
    subjects: [...q.subjects],
    chapters: [...q.chapters],
    keywords: ['TODO: 새 키워드 추가'],
    context: `TODO: 동일 주제(${q.subjects.join(', ')})의 새로운 지문 작성\n\n[원본 참고]\n${q.context}`,
    ...(q.dialogue ? {
      dialogue: [{ speaker: 'TODO', text: 'TODO: 원본과 같은 구조의 새 대화 작성' }],
      _ref_dialogue: q.dialogue,
    } : {}),
    ...(q.sub_items ? {
      sub_items: q.sub_items.map(si => ({
        label: si.label,
        title: `TODO: ${si.title || si.label}`,
        content: 'TODO: 새 내용 작성',
        _ref_content: si.content,
        ...(si.steps ? {
          steps: ['TODO: 새 단계 작성'],
          _ref_steps: si.steps,
        } : {}),
        ...(si.table ? {
          table: { headers: si.table.headers, rows: [['TODO']] },
          _ref_table: si.table,
        } : {}),
      })),
    } : {}),
    ...(q.tasks ? {
      tasks: q.tasks.map(t => ({
        label: t.label,
        instruction: `TODO: 새 지시문 작성`,
        _ref_instruction: t.instruction,
        ...(t.conditions ? {
          conditions: ['TODO: 새 조건 작성'],
          _ref_conditions: t.conditions,
        } : {}),
      })),
    } : {}),
    model_answer: {
      content: 'TODO: 모범답안 작성',
      _ref: q.model_answer,
    },
  }
}

function forkQuestion(q) {
  return q.type === 'fill_in'
    ? forkFillInQuestion(q)
    : forkDescriptiveQuestion(q)
}

const forked = {
  exam: forkExamMeta(original.exam),
  questions: original.questions.map(forkQuestion),
}

// ─── 출력 ────────────────────────────────────────────────
writeFileSync(outputPath, JSON.stringify(forked, null, 2), 'utf-8')

const fillCount = forked.questions.filter(q => q.type === 'fill_in').length
const descCount = forked.questions.filter(q => q.type === 'descriptive').length
const todoCount = JSON.stringify(forked).match(/TODO/g)?.length || 0

console.log(`✅ ${typeFlag} 템플릿 생성 완료`)
console.log(`   원본: ${inputPath}`)
console.log(`   출력: ${outputPath}`)
console.log(`   문항: ${forked.questions.length}개 (서술 ${fillCount} + 논술 ${descCount})`)
console.log(`   TODO: ${todoCount}개 항목 작성 필요`)
console.log('')
console.log('다음 단계:')
console.log(`  1. ${outputPath} 열기`)
console.log('  2. TODO 항목을 모두 채우기')
console.log('  3. _ref 필드 삭제 (참고용이므로 완성 후 제거)')
console.log('  4. node scripts/validate-kice.mjs 로 검증')
