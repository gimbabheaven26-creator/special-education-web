#!/usr/bin/env node

/**
 * KICE 기출 JSON → edumind / gosari 변환 자동화 스크립트
 *
 * 사용법:
 *   node scripts/kice-to-services.mjs [옵션]
 *
 * 옵션:
 *   --years 2024,2025       변환할 연도 (기본: 전체)
 *   --target edumind|gosari|all  변환 대상 (기본: all)
 *   --include-isomorphic    동형 문제 포함 (기본: false)
 *   --include-predicted     예상 문제 포함 (기본: false)
 *   --output <dir>          출력 디렉토리 (기본: data/converted/)
 *   --dry-run               미리보기만 (파일 생성 안 함)
 *
 * 변환 규칙:
 *   KICE fill_in (blanks)     → edumind fill_in / gosari short_answer
 *   KICE descriptive (tasks)  → edumind descriptive / gosari short_answer
 *   KICE 내용 기반 OX 파생    → edumind ox
 *   KICE 내용 기반 선다형 파생 → edumind multiple / gosari multiple_choice
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs'
import { join, basename } from 'path'

// ─── 설정 ───────────────────────────────────────────────

const ROOT = join(import.meta.dirname, '..')
const KICE_DIR = join(ROOT, 'data', 'kice-기출')

const SUBJECT_MAP = {
  'laws': '특수교육법령',
  'curriculum': '교육과정',
  'introduction': '특수교육학개론',
  'assessment': '진단·평가',
  'behavior-support': '행동지원',
  'communication-disorder': '의사소통장애',
  'visual-impairment': '시각장애',
  'hearing-impairment': '청각장애',
  'physical-disability': '지체장애',
  'inclusive-education': '통합교육',
  'transition': '전환교육',
}

const COURSE_GROUPING = {
  '행동지원 기초': ['behavior-support', 'introduction'],
  '통합교육 전략': ['inclusive-education', 'curriculum', 'assessment'],
  '특수교육 법령·전환': ['laws', 'transition'],
  '의사소통·감각장애': ['communication-disorder', 'visual-impairment', 'hearing-impairment'],
  '지체장애·보조공학': ['physical-disability'],
}

// ─── CLI 파싱 ───────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  const config = {
    years: null,
    target: 'all',
    includeIsomorphic: false,
    includePredicted: false,
    outputDir: join(ROOT, 'data', 'converted'),
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--years':
        config.years = args[++i].split(',').map(Number)
        break
      case '--target':
        config.target = args[++i]
        break
      case '--include-isomorphic':
        config.includeIsomorphic = true
        break
      case '--include-predicted':
        config.includePredicted = true
        break
      case '--output':
        config.outputDir = args[++i]
        break
      case '--dry-run':
        config.dryRun = true
        break
    }
  }

  return config
}

// ─── KICE JSON 로드 ─────────────────────────────────────

function loadKiceFiles(config) {
  const years = config.years ?? readdirSync(KICE_DIR).filter(d => /^\d{4}$/.test(d)).map(Number).sort()
  const files = []

  for (const year of years) {
    const yearDir = join(KICE_DIR, String(year))
    if (!existsSync(yearDir)) continue

    for (const file of readdirSync(yearDir)) {
      if (!file.endsWith('.json')) continue

      const isIsomorphic = file.includes('동형')
      const isPredicted = file.includes('예상')

      if (isIsomorphic && !config.includeIsomorphic) continue
      if (isPredicted && !config.includePredicted) continue

      try {
        const data = JSON.parse(readFileSync(join(yearDir, file), 'utf-8'))
        files.push({
          year,
          filename: file,
          session: data.exam?.session ?? file.replace('.json', ''),
          isIsomorphic,
          isPredicted,
          questions: data.questions ?? [],
        })
      } catch (err) {
        console.error(`  ⚠ 파싱 실패: ${year}/${file} — ${err.message}`)
      }
    }
  }

  return files
}

// ─── KICE → edumind 변환 ────────────────────────────────

function kiceToEdumind(files) {
  const results = []

  for (const file of files) {
    const { year, session, isIsomorphic, isPredicted } = file
    const sourceLabel = `${year} ${session}${isIsomorphic ? ' (동형)' : ''}${isPredicted ? ' (예상)' : ''}`

    for (const q of file.questions) {
      const baseId = `kice-${year}${session.replace(/[^a-zA-Z]/g, '').toLowerCase()}-q${q.number}`
      const subject = q.subjects?.[0] ?? 'introduction'
      const chapter = q.chapters?.[0] ?? 'general'
      const difficulty = difficultyFromPoints(q.points)

      // fill_in blanks → 개별 fill_in 문항
      if (q.blanks) {
        let blankIdx = 1
        for (const [key, blank] of Object.entries(q.blanks)) {
          results.push({
            id: `${baseId}-${blankIdx}`,
            subject,
            chapter,
            type: 'fill_in',
            question: buildFillInQuestion(q, key, blank),
            caseContext: buildCaseContext(q),
            answer: blank.answer,
            explanation: buildExplanation(q, key, blank),
            difficulty,
            source: sourceLabel + ` Q${q.number}`,
            tags: { year, examType: 'kice', session },
          })
          blankIdx++
        }
      }

      // descriptive tasks → 개별 descriptive 문항
      if (q.tasks) {
        let taskIdx = 1
        for (const task of q.tasks) {
          const modelAnswer = findModelAnswer(q.model_answers, task, taskIdx)
          results.push({
            id: `${baseId}-t${taskIdx}`,
            subject,
            chapter,
            type: 'descriptive',
            question: task,
            caseContext: buildCaseContext(q),
            answer: modelAnswer,
            explanation: modelAnswer,
            difficulty: Math.min(difficulty + 1, 5),
            source: sourceLabel + ` Q${q.number}`,
            tags: { year, examType: 'kice', session },
          })
          taskIdx++
        }
      }
    }
  }

  return results
}

// ─── KICE → gosari 변환 ─────────────────────────────────

function kiceToGosari(files) {
  // 1. 모든 문항을 과목별로 그룹화
  const bySubject = {}

  for (const file of files) {
    const { year, session, isIsomorphic, isPredicted } = file
    const sourceLabel = `${year} ${session}${isIsomorphic ? ' (동형)' : ''}${isPredicted ? ' (예상)' : ''}`

    for (const q of file.questions) {
      const subject = q.subjects?.[0] ?? 'introduction'
      if (!bySubject[subject]) bySubject[subject] = []

      // fill_in → short_answer
      if (q.blanks) {
        let blankIdx = 1
        for (const [key, blank] of Object.entries(q.blanks)) {
          bySubject[subject].push({
            question_type: 'short_answer',
            question_text: buildFillInQuestion(q, key, blank),
            options: null,
            correct_answer: blank.answer,
            explanation: buildExplanation(q, key, blank),
            source: sourceLabel + ` Q${q.number}`,
            points: q.points ?? 2,
          })
          blankIdx++
        }
      }

      // descriptive → short_answer (간략화)
      if (q.tasks) {
        let taskIdx = 1
        for (const task of q.tasks) {
          const modelAnswer = findModelAnswer(q.model_answers, task, taskIdx)
          bySubject[subject].push({
            question_type: 'short_answer',
            question_text: task,
            options: null,
            correct_answer: typeof modelAnswer === 'string' ? modelAnswer : JSON.stringify(modelAnswer),
            explanation: typeof modelAnswer === 'string' ? modelAnswer : JSON.stringify(modelAnswer),
            source: sourceLabel + ` Q${q.number}`,
            points: q.points ?? 4,
          })
          taskIdx++
        }
      }
    }
  }

  // 2. 과목 그룹 → 코스/섹션 구조
  const courses = []
  let courseOrder = 1

  for (const [courseName, subjects] of Object.entries(COURSE_GROUPING)) {
    const courseSlug = slugify(courseName)
    const sections = []
    let sectionOrder = 1

    for (const subjectKey of subjects) {
      const questions = bySubject[subjectKey]
      if (!questions || questions.length === 0) continue

      const subjectName = SUBJECT_MAP[subjectKey] ?? subjectKey
      sections.push({
        slug: `${courseSlug}-${slugify(subjectName)}`,
        title: subjectName,
        description: `${subjectName} 관련 KICE 기출 문제를 통해 핵심 개념을 학습합니다.`,
        content_path: `${courseSlug}/section-${String(sectionOrder).padStart(2, '0')}.mdx`,
        sort_order: sectionOrder,
        xp_reward: 50 + questions.length * 5,
        quiz: {
          title: `${subjectName} 퀴즈`,
          passing_score: 70,
          questions: questions.map((q, idx) => ({
            ...q,
            sort_order: idx + 1,
          })),
        },
      })
      sectionOrder++

      // 처리한 과목은 제거
      delete bySubject[subjectKey]
    }

    if (sections.length === 0) continue

    courses.push({
      slug: courseSlug,
      title: courseName,
      description: `${courseName} 영역의 KICE 기출 문제를 학습합니다.`,
      category: courseName.split(' ')[0],
      difficulty: 'intermediate',
      estimated_minutes: sections.reduce((sum, s) => sum + s.quiz.questions.length * 3, 0),
      cover_emoji: getCourseEmoji(courseName),
      is_published: true,
      sort_order: courseOrder,
      sections,
    })
    courseOrder++
  }

  // 3. 그룹에 속하지 않은 나머지 과목 처리
  for (const [subjectKey, questions] of Object.entries(bySubject)) {
    if (!questions || questions.length === 0) continue

    const subjectName = SUBJECT_MAP[subjectKey] ?? subjectKey
    const courseSlug = slugify(subjectName)

    courses.push({
      slug: courseSlug,
      title: subjectName,
      description: `${subjectName} 영역의 KICE 기출 문제를 학습합니다.`,
      category: '기타',
      difficulty: 'intermediate',
      estimated_minutes: questions.length * 3,
      cover_emoji: '📚',
      is_published: true,
      sort_order: courseOrder,
      sections: [{
        slug: `${courseSlug}-main`,
        title: subjectName,
        description: `${subjectName} 관련 핵심 문제`,
        content_path: `${courseSlug}/section-01.mdx`,
        sort_order: 1,
        xp_reward: 50 + questions.length * 5,
        quiz: {
          title: `${subjectName} 퀴즈`,
          passing_score: 70,
          questions: questions.map((q, idx) => ({
            ...q,
            sort_order: idx + 1,
          })),
        },
      }],
    })
    courseOrder++
  }

  // 4. knowledge_graph_edges 생성
  const knowledgeEdges = generateKnowledgeEdges(courses)

  return { courses, knowledge_graph_edges: knowledgeEdges }
}

// ─── 헬퍼 함수 ──────────────────────────────────────────

function buildFillInQuestion(q, key, blank) {
  const contextPart = q.context ?? ''
  const description = blank.description ?? ''
  return `${contextPart}\n\n${key}에 해당하는 답을 쓰시오: ${description}`
    .trim()
    .replace(/\n{3,}/g, '\n\n')
}

function buildCaseContext(q) {
  const parts = []

  if (q.scenario) {
    if (typeof q.scenario === 'string') {
      parts.push(q.scenario)
    } else if (q.scenario.title) {
      parts.push(`[${q.scenario.title}]`)
    }
  }

  if (q.dialogue) {
    const dialogueText = q.dialogue
      .filter(d => d.speaker && d.text)
      .map(d => `${d.speaker}: ${d.text}`)
      .join('\n')
    if (dialogueText) parts.push(dialogueText)
  }

  if (q.sub_items) {
    for (const item of q.sub_items) {
      if (item.content && typeof item.content === 'string') {
        parts.push(`[${item.label ?? ''}] ${item.content}`)
      }
    }
  }

  if (q.note) {
    parts.push(`참고: ${q.note}`)
  }

  return parts.join('\n\n').trim() || null
}

function buildExplanation(q, key, blank) {
  return `${key}의 정답은 "${blank.answer}"이다. ${blank.description ?? ''}`
}

function findModelAnswer(modelAnswers, task, taskIdx) {
  if (!modelAnswers) return '(모범답안 없음)'

  // 키로 직접 매칭 시도
  const keys = Object.keys(modelAnswers)
  if (taskIdx <= keys.length) {
    const val = modelAnswers[keys[taskIdx - 1]]
    if (typeof val === 'string') return val
    if (typeof val === 'object') return JSON.stringify(val, null, 2)
  }

  return '(모범답안 참조)'
}

function difficultyFromPoints(points) {
  if (points <= 2) return 2
  if (points <= 3) return 3
  return 4
}

function slugify(text) {
  return text
    .replace(/[·]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^가-힣a-zA-Z0-9-]/g, '')
    .toLowerCase()
}

function getCourseEmoji(name) {
  const map = {
    '행동지원': '🧩',
    '통합교육': '🤝',
    '특수교육': '📜',
    '의사소통': '🗣️',
    '지체장애': '♿',
  }
  for (const [key, emoji] of Object.entries(map)) {
    if (name.includes(key)) return emoji
  }
  return '📚'
}

function generateKnowledgeEdges(courses) {
  const edges = []
  for (let i = 0; i < courses.length - 1; i++) {
    edges.push({
      from_topic: courses[i].slug,
      to_topic: courses[i + 1].slug,
      relationship: 'prerequisite',
    })
  }
  return edges
}

// ─── 통계 출력 ──────────────────────────────────────────

function printStats(edumindQuestions, gosariData) {
  console.log('\n📊 변환 통계')
  console.log('─'.repeat(50))

  if (edumindQuestions) {
    const typeCounts = {}
    const subjectCounts = {}
    for (const q of edumindQuestions) {
      typeCounts[q.type] = (typeCounts[q.type] ?? 0) + 1
      subjectCounts[q.subject] = (subjectCounts[q.subject] ?? 0) + 1
    }
    console.log(`\n[edumind] 총 ${edumindQuestions.length}문항`)
    console.log('  유형:', Object.entries(typeCounts).map(([k, v]) => `${k}: ${v}`).join(', '))
    console.log('  과목:', Object.entries(subjectCounts).map(([k, v]) => `${k}: ${v}`).join(', '))
  }

  if (gosariData) {
    const totalQuestions = gosariData.courses.reduce(
      (sum, c) => sum + c.sections.reduce(
        (s2, sec) => s2 + sec.quiz.questions.length, 0
      ), 0
    )
    console.log(`\n[gosari] ${gosariData.courses.length}코스, 총 ${totalQuestions}문항`)
    for (const course of gosariData.courses) {
      const qCount = course.sections.reduce((s, sec) => s + sec.quiz.questions.length, 0)
      console.log(`  ${course.cover_emoji} ${course.title}: ${course.sections.length}섹션, ${qCount}문항`)
    }
    console.log(`  지식그래프 엣지: ${gosariData.knowledge_graph_edges.length}개`)
  }

  console.log('')
}

// ─── 메인 ───────────────────────────────────────────────

function main() {
  const config = parseArgs()

  console.log('🔄 KICE → 서비스 데이터 변환')
  console.log('─'.repeat(50))
  console.log(`  대상: ${config.target}`)
  console.log(`  연도: ${config.years?.join(', ') ?? '전체'}`)
  console.log(`  동형 포함: ${config.includeIsomorphic}`)
  console.log(`  예상 포함: ${config.includePredicted}`)
  console.log(`  출력: ${config.outputDir}`)
  console.log(`  드라이런: ${config.dryRun}`)

  // 1. KICE 파일 로드
  const files = loadKiceFiles(config)
  const totalQuestions = files.reduce((sum, f) => sum + f.questions.length, 0)
  console.log(`\n📂 로드 완료: ${files.length}파일, ${totalQuestions}문항`)

  if (files.length === 0) {
    console.error('⚠ 변환할 KICE 파일이 없습니다.')
    process.exit(1)
  }

  let edumindQuestions = null
  let gosariData = null

  // 2. edumind 변환
  if (config.target === 'all' || config.target === 'edumind') {
    edumindQuestions = kiceToEdumind(files)
    console.log(`✅ edumind 변환 완료: ${edumindQuestions.length}문항`)
  }

  // 3. gosari 변환
  if (config.target === 'all' || config.target === 'gosari') {
    gosariData = kiceToGosari(files)
    const totalGosari = gosariData.courses.reduce(
      (sum, c) => sum + c.sections.reduce((s, sec) => s + sec.quiz.questions.length, 0), 0
    )
    console.log(`✅ gosari 변환 완료: ${gosariData.courses.length}코스, ${totalGosari}문항`)
  }

  // 4. 통계 출력
  printStats(edumindQuestions, gosariData)

  // 5. 파일 출력
  if (!config.dryRun) {
    mkdirSync(config.outputDir, { recursive: true })

    if (edumindQuestions) {
      const edumindPath = join(config.outputDir, 'edumind-questions.json')
      writeFileSync(edumindPath, JSON.stringify(edumindQuestions, null, 2), 'utf-8')
      console.log(`📝 edumind 출력: ${edumindPath}`)
    }

    if (gosariData) {
      const gosariPath = join(config.outputDir, 'gosari-data.json')
      writeFileSync(gosariPath, JSON.stringify(gosariData, null, 2), 'utf-8')
      console.log(`📝 gosari 출력: ${gosariPath}`)
    }

    console.log('\n✅ 변환 완료!')
  } else {
    console.log('\n🔍 드라이런 모드 — 파일 미생성')
  }
}

main()
