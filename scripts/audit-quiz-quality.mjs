/**
 * Quiz Quality Audit Script
 *
 * Fetches ALL quiz_questions from Supabase and checks for quality issues.
 * Does NOT modify any data — report only.
 */

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  process.exit(1)
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

async function fetchAll(table) {
  const allRows = []
  let offset = 0
  const limit = 1000

  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=*&offset=${offset}&limit=${limit}`
    const res = await fetch(url, { headers })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${table}: ${res.status} ${await res.text()}`)
    }
    const rows = await res.json()
    allRows.push(...rows)
    if (rows.length < limit) break
    offset += limit
  }

  return allRows
}

function createIssue(category, description) {
  return { category, description, ids: [] }
}

async function main() {
  console.log('Fetching quiz_questions and chapters from Supabase...\n')

  const [quizzes, chapters] = await Promise.all([
    fetchAll('quiz_questions'),
    fetchAll('chapters'),
  ])

  console.log(`Total quiz questions: ${quizzes.length}`)
  console.log(`Total chapters: ${chapters.length}\n`)

  // Build a set of valid chapter slugs (subject_slug + slug)
  const validChapterKeys = new Set(
    chapters.map((c) => `${c.subject_slug}::${c.slug}`)
  )

  const issues = {
    invalidMcAnswer: createIssue(
      'A. Invalid MC answer index',
      'Multiple choice questions where answer is not a valid index (0 to options.length-1)'
    ),
    shortExplanation: createIssue(
      'B. Short explanation (<50 chars)',
      'Questions with very short explanations (under 50 characters)'
    ),
    shortQuestion: createIssue(
      'C. Short question (<20 chars)',
      'Questions with very short question text (under 20 characters)'
    ),
    fillInEmptyAnswer: createIssue(
      'D. fill_in with empty/null answer',
      'fill_in questions with empty or null answer'
    ),
    oxInvalidAnswer: createIssue(
      'E. OX with invalid answer',
      'ox questions with answer not "O" or "X"'
    ),
    duplicateQuestion: createIssue(
      'F. Duplicate question text',
      'Questions with identical question text'
    ),
    bannedLawRef: createIssue(
      'G. Banned law references',
      'Questions referencing 장애인복지법 or 장애인차별금지법'
    ),
    missingWrongExplanations: createIssue(
      'H. MC missing wrong_explanations',
      'Multiple choice questions without wrong_explanations'
    ),
    orphanChapter: createIssue(
      'I. Chapter not in chapters table',
      'Questions whose chapter does not exist in the chapters table'
    ),
    descriptiveNoCaseContext: createIssue(
      'J. descriptive without case_context',
      'descriptive questions without case_context'
    ),
    invalidDifficulty: createIssue(
      'K. Invalid difficulty',
      'Questions with difficulty not in [1, 2, 3]'
    ),
    mcFewOptions: createIssue(
      'L. MC with <4 options',
      'Multiple choice questions with fewer than 4 options'
    ),
  }

  // Track question text for duplicate detection
  const questionTextMap = new Map() // text -> [ids]

  for (const q of quizzes) {
    const id = q.id
    const type = q.type

    // A. MC invalid answer index
    if (type === 'multiple') {
      const opts = q.options || []
      const ans = Number(q.answer)
      if (isNaN(ans) || ans < 0 || ans >= opts.length || !Number.isInteger(ans)) {
        issues.invalidMcAnswer.ids.push(id)
      }
    }

    // B. Short explanation
    if (!q.explanation || q.explanation.length < 50) {
      issues.shortExplanation.ids.push(id)
    }

    // C. Short question
    if (!q.question || q.question.length < 20) {
      issues.shortQuestion.ids.push(id)
    }

    // D. fill_in empty answer
    if (type === 'fill_in') {
      if (!q.answer || String(q.answer).trim() === '') {
        issues.fillInEmptyAnswer.ids.push(id)
      }
    }

    // E. OX invalid answer
    if (type === 'ox') {
      if (q.answer !== 'O' && q.answer !== 'X') {
        issues.oxInvalidAnswer.ids.push(id)
      }
    }

    // F. Duplicate detection (collect)
    const normalized = (q.question || '').trim()
    if (normalized) {
      if (!questionTextMap.has(normalized)) {
        questionTextMap.set(normalized, [])
      }
      questionTextMap.get(normalized).push(id)
    }

    // G. Banned law references
    const fullText = `${q.question || ''} ${q.explanation || ''} ${q.case_context || ''}`
    if (fullText.includes('장애인복지법') || fullText.includes('장애인차별금지법')) {
      issues.bannedLawRef.ids.push(id)
    }

    // H. MC missing wrong_explanations
    if (type === 'multiple') {
      if (!q.wrong_explanations || Object.keys(q.wrong_explanations).length === 0) {
        issues.missingWrongExplanations.ids.push(id)
      }
    }

    // I. Chapter not in chapters table
    const chapterKey = `${q.subject}::${q.chapter}`
    if (!validChapterKeys.has(chapterKey)) {
      issues.orphanChapter.ids.push(id)
    }

    // J. descriptive without case_context
    if (type === 'descriptive') {
      if (!q.case_context || q.case_context.trim() === '') {
        issues.descriptiveNoCaseContext.ids.push(id)
      }
    }

    // K. Invalid difficulty
    if (![1, 2, 3].includes(q.difficulty)) {
      issues.invalidDifficulty.ids.push(id)
    }

    // L. MC with <4 options
    if (type === 'multiple') {
      const opts = q.options || []
      if (opts.length < 4) {
        issues.mcFewOptions.ids.push(id)
      }
    }
  }

  // F. Finalize duplicates
  for (const [text, ids] of questionTextMap) {
    if (ids.length > 1) {
      issues.duplicateQuestion.ids.push(...ids)
    }
  }

  // Print report
  console.log('=' .repeat(80))
  console.log('QUIZ QUALITY AUDIT REPORT')
  console.log('='.repeat(80))

  let totalIssues = 0

  for (const [key, issue] of Object.entries(issues)) {
    const count = issue.ids.length
    totalIssues += count

    console.log(`\n--- ${issue.category} ---`)
    console.log(`Description: ${issue.description}`)
    console.log(`Count: ${count}`)

    if (count > 0) {
      console.log(`IDs: ${issue.ids.join(', ')}`)
    } else {
      console.log('No issues found.')
    }
  }

  console.log('\n' + '='.repeat(80))
  console.log(`TOTAL ISSUES: ${totalIssues} (across ${quizzes.length} questions)`)
  console.log('='.repeat(80))

  // Type distribution summary
  const typeCounts = {}
  const difficultyCounts = {}
  for (const q of quizzes) {
    typeCounts[q.type] = (typeCounts[q.type] || 0) + 1
    difficultyCounts[q.difficulty] = (difficultyCounts[q.difficulty] || 0) + 1
  }

  console.log('\n--- Type Distribution ---')
  for (const [type, count] of Object.entries(typeCounts)) {
    console.log(`  ${type}: ${count}`)
  }

  console.log('\n--- Difficulty Distribution ---')
  for (const [diff, count] of Object.entries(difficultyCounts)) {
    console.log(`  Level ${diff}: ${count}`)
  }
}

main().catch((err) => {
  console.error('Audit failed:', err)
  process.exit(1)
})
