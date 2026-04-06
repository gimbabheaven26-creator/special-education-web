import { getClient, fetchAll } from './lib/supabase-client.mjs';
import { readFileSync } from 'fs'
import { resolve } from 'path'

const supabase = getClient();

function escapeMarkdown(str) {
  if (!str) return ''
  return str.replace(/\|/g, '｜').replace(/\n/g, ' ')
}

async function main() {
  console.log('=== 방향B 품질 감사 (Wave 2) 시작 ===\n')

  // 전체 문항 페이지네이션으로 가져오기
  console.log('데이터 로딩 중...')
  const allQ = await fetchAll(supabase, 'quiz_questions', 'id, subject, type, question, explanation, wrong_explanations, tags')
  console.log(`전체 문항: ${allQ.length}건\n`)

  // --- 검사 1: explanation < 30자 ---
  const shortExpl = allQ.filter(q => !q.explanation || q.explanation.length < 30)
  console.log(`[1] explanation < 30자: ${shortExpl.length}건`)

  // --- 검사 2: multiple인데 wrong_explanations IS NULL ---
  const missingWE = allQ.filter(q =>
    q.type === 'multiple' &&
    (!q.wrong_explanations || Object.keys(q.wrong_explanations).length === 0)
  )
  console.log(`[2] multiple + wrong_explanations 없음: ${missingWE.length}건`)

  // --- 검사 3: tags 비어있음 ---
  const emptyTags = allQ.filter(q => !q.tags || Object.keys(q.tags).length === 0)
  console.log(`[3] tags 비어있음: ${emptyTags.length}건`)

  // --- 검사 4: 중복 문항 ---
  const questionMap = {}
  allQ.forEach(q => {
    if (!questionMap[q.question]) questionMap[q.question] = []
    questionMap[q.question].push({ id: q.id, subject: q.subject })
  })
  const duplicates = Object.entries(questionMap).filter(([_, entries]) => entries.length > 1)
  console.log(`[4] 중복 문항: ${duplicates.length}쌍`)

  // --- 검사 5: 구형 용어 사용 ---
  // nise-dictionary.json에서 용어 추출 + 추가 구형 용어
  const projectRoot = resolve(new URL(import.meta.url).pathname, '../../')
  const niseDict = JSON.parse(readFileSync(resolve(projectRoot, 'data/terminology/nise-dictionary.json'), 'utf-8'))

  // 기본 구형 용어 목록
  const oldTerms = [
    "정신지체", "정신박약", "농아", "맹아", "불구자",
    "정신박약아", "정신지체아", "농아자", "맹아자",
    "저능", "정신결함", "정신결함아", "저능아",
    "기형아", "불능자", "심신장애", "심신장애아",
    "사지마비자", "반신불수", "간질", "간질환자",
    "자폐아", "문제아", "장애자"
  ]

  const oldTermQ = allQ.filter(q => {
    const foundTerms = oldTerms.filter(term =>
      q.question.includes(term) ||
      (q.explanation && q.explanation.includes(term))
    )
    if (foundTerms.length > 0) {
      q._foundTerms = foundTerms
      return true
    }
    return false
  })
  console.log(`[5] 구형 용어 사용: ${oldTermQ.length}건`)

  // --- Markdown 출력 생성 ---
  const today = new Date().toISOString().split('T')[0]
  const lines = []

  lines.push(`# 방향B 품질 감사 결과 (Wave 2)`)
  lines.push(`감사 일시: ${today}`)
  lines.push(`전체 문항: ${allQ.length}건`)
  lines.push(``)

  // 검사 1
  lines.push(`## 검사 1: explanation < 30자`)
  lines.push(``)
  if (shortExpl.length === 0) {
    lines.push(`발견 없음.`)
  } else {
    lines.push(`| ID | subject | type | explanation |`)
    lines.push(`|----|---------|------|-------------|`)
    shortExpl.slice(0, 50).forEach(q => {
      const expl = escapeMarkdown(q.explanation || '(없음)')
      lines.push(`| ${q.id} | ${q.subject} | ${q.type} | ${expl} |`)
    })
    if (shortExpl.length > 50) {
      lines.push(``)
      lines.push(`_... 외 ${shortExpl.length - 50}건 (50건만 표시)_`)
    }
  }
  lines.push(``)
  lines.push(`총 **${shortExpl.length}건**`)
  lines.push(``)

  // 검사 2
  lines.push(`## 검사 2: multiple wrong_explanations 누락`)
  lines.push(``)
  if (missingWE.length === 0) {
    lines.push(`발견 없음.`)
  } else {
    lines.push(`| ID | subject |`)
    lines.push(`|----|---------|`)
    missingWE.forEach(q => {
      lines.push(`| ${q.id} | ${q.subject} |`)
    })
  }
  lines.push(``)
  lines.push(`총 **${missingWE.length}건**`)
  lines.push(``)

  // 검사 3
  lines.push(`## 검사 3: tags 빈값`)
  lines.push(``)
  if (emptyTags.length === 0) {
    lines.push(`발견 없음.`)
  } else {
    lines.push(`<details>`)
    lines.push(`<summary>ID 목록 (${Math.min(emptyTags.length, 50)}건 표시)</summary>`)
    lines.push(``)
    lines.push(`| ID | subject |`)
    lines.push(`|----|---------|`)
    emptyTags.slice(0, 50).forEach(q => {
      lines.push(`| ${q.id} | ${q.subject} |`)
    })
    lines.push(`</details>`)
  }
  lines.push(``)
  lines.push(`총 **${emptyTags.length}건**`)
  lines.push(``)

  // 검사 4
  lines.push(`## 검사 4: 중복 문항`)
  lines.push(``)
  if (duplicates.length === 0) {
    lines.push(`발견 없음.`)
  } else {
    lines.push(`| 중복 텍스트(50자) | ID 목록 |`)
    lines.push(`|-----------------|---------|`)
    duplicates.slice(0, 50).forEach(([text, entries]) => {
      const shortText = escapeMarkdown(text.slice(0, 50))
      const idList = entries.map(e => e.id).join(', ')
      lines.push(`| ${shortText}... | ${idList} |`)
    })
    if (duplicates.length > 50) {
      lines.push(``)
      lines.push(`_... 외 ${duplicates.length - 50}쌍 (50쌍만 표시)_`)
    }
  }
  lines.push(``)
  lines.push(`총 **${duplicates.length}쌍**`)
  lines.push(``)

  // 검사 5
  lines.push(`## 검사 5: 구형 용어 사용`)
  lines.push(``)
  lines.push(`검사 대상 구형 용어: ${oldTerms.join(', ')}`)
  lines.push(``)
  if (oldTermQ.length === 0) {
    lines.push(`발견 없음.`)
  } else {
    lines.push(`| ID | subject | 발견 용어 |`)
    lines.push(`|----|---------|----------|`)
    oldTermQ.forEach(q => {
      lines.push(`| ${q.id} | ${q.subject} | ${q._foundTerms.join(', ')} |`)
    })
  }
  lines.push(``)
  lines.push(`총 **${oldTermQ.length}건**`)
  lines.push(``)

  // 요약
  const totalDefects = shortExpl.length + missingWE.length + emptyTags.length + duplicates.length + oldTermQ.length
  lines.push(`---`)
  lines.push(``)
  lines.push(`## 종합 요약`)
  lines.push(``)
  lines.push(`| 검사 항목 | 발견 건수 |`)
  lines.push(`|----------|---------|`)
  lines.push(`| 검사 1: explanation < 30자 | ${shortExpl.length}건 |`)
  lines.push(`| 검사 2: multiple + wrong_explanations 누락 | ${missingWE.length}건 |`)
  lines.push(`| 검사 3: tags 빈값 | ${emptyTags.length}건 |`)
  lines.push(`| 검사 4: 중복 문항 | ${duplicates.length}쌍 |`)
  lines.push(`| 검사 5: 구형 용어 사용 | ${oldTermQ.length}건 |`)
  lines.push(`| **총 결함** | **${totalDefects}건** |`)
  lines.push(``)

  const output = lines.join('\n')

  // docs/data-audit-w2.md에 저장
  const outPath = resolve(projectRoot, 'docs/data-audit-w2.md')
  const { writeFileSync } = await import('fs')
  writeFileSync(outPath, output, 'utf-8')
  console.log(`\n결과 저장: ${outPath}`)
  console.log('\n=== 감사 완료 ===')
  console.log(`총 결함: ${totalDefects}건`)
}

main().catch(console.error)
