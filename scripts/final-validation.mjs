/**
 * Final comprehensive data validation for Supabase quiz database.
 * Checks totals, referential integrity, field validity, and distributions.
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY not set')
  process.exit(1)
}

const headers = {
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
}

async function fetchAll(table, select = '*') {
  const rows = []
  const limit = 1000
  let offset = 0
  while (true) {
    const url = `${SUPABASE_URL}/rest/v1/${table}?select=${encodeURIComponent(select)}&limit=${limit}&offset=${offset}`
    const res = await fetch(url, { headers })
    if (!res.ok) {
      throw new Error(`Failed to fetch ${table}: ${res.status} ${await res.text()}`)
    }
    const data = await res.json()
    rows.push(...data)
    if (data.length < limit) break
    offset += limit
  }
  return rows
}

function printCheck(num, name, passed, detail) {
  const status = passed ? 'PASS' : 'FAIL'
  const icon = passed ? '\u2705' : '\u274C'
  console.log(`  ${icon} Check ${num}: ${name} — ${status}`)
  if (detail) console.log(`     ${detail}`)
}

async function main() {
  console.log('=== Final Comprehensive Data Validation ===\n')
  console.log('Fetching data from Supabase...')

  const [subjects, chapters, quizzes] = await Promise.all([
    fetchAll('subjects', 'slug,title'),
    fetchAll('chapters', 'id,slug,subject_slug'),
    fetchAll('quiz_questions', '*'),
  ])

  console.log('Data fetched.\n')

  const results = []

  // 1. Totals
  console.log('--- CHECK 1: Totals ---')
  const detail1 = `subjects=${subjects.length}, chapters=${chapters.length}, quiz_questions=${quizzes.length}`
  printCheck(1, 'Totals', true, detail1)
  results.push(true)

  // 2. Answer validity for MC questions
  console.log('--- CHECK 2: MC Answer Validity (0-based index into options) ---')
  const mcQuizzes = quizzes.filter(q => q.type === 'multiple')
  const badMcAnswers = mcQuizzes.filter(q => {
    if (!Array.isArray(q.options)) return true
    const idx = parseInt(q.answer, 10)
    return isNaN(idx) || idx < 0 || idx >= q.options.length
  })
  const pass2 = badMcAnswers.length === 0
  printCheck(2, 'MC answer validity', pass2, `${badMcAnswers.length} invalid out of ${mcQuizzes.length} MC questions`)
  if (!pass2) {
    badMcAnswers.slice(0, 5).forEach(q => console.log(`     id=${q.id} answer="${q.answer}" options_len=${q.options?.length}`))
  }
  results.push(pass2)

  // 3. Orphan chapters (quiz_questions.chapter not in chapters.slug)
  console.log('--- CHECK 3: Orphan Chapters ---')
  const chapterSlugs = new Set(chapters.map(c => c.slug))
  const orphanChapters = quizzes.filter(q => q.chapter && !chapterSlugs.has(q.chapter))
  const pass3 = orphanChapters.length === 0
  printCheck(3, 'Orphan chapters', pass3, `${orphanChapters.length} quizzes reference non-existent chapters`)
  if (!pass3) {
    const orphanValues = [...new Set(orphanChapters.map(q => q.chapter))]
    console.log(`     Missing chapter slugs: ${orphanValues.join(', ')}`)
  }
  results.push(pass3)

  // 4. Orphan subjects (quiz_questions.subject not in subjects.slug)
  console.log('--- CHECK 4: Orphan Subjects ---')
  const subjectSlugs = new Set(subjects.map(s => s.slug))
  const orphanSubjects = quizzes.filter(q => q.subject && !subjectSlugs.has(q.subject))
  const pass4 = orphanSubjects.length === 0
  printCheck(4, 'Orphan subjects', pass4, `${orphanSubjects.length} quizzes reference non-existent subjects`)
  if (!pass4) {
    const orphanValues = [...new Set(orphanSubjects.map(q => q.subject))]
    console.log(`     Missing subject slugs: ${orphanValues.join(', ')}`)
  }
  results.push(pass4)

  // 5. MC wrong_explanations non-null
  console.log('--- CHECK 5: MC wrong_explanations ---')
  const mcMissingWrongExp = mcQuizzes.filter(q => q.wrong_explanations == null)
  const pass5 = mcMissingWrongExp.length === 0
  printCheck(5, 'MC wrong_explanations', pass5, `${mcMissingWrongExp.length} MC questions missing wrong_explanations out of ${mcQuizzes.length}`)
  if (!pass5) {
    mcMissingWrongExp.slice(0, 5).forEach(q => console.log(`     id=${q.id} subject=${q.subject} chapter=${q.chapter}`))
  }
  results.push(pass5)

  // 6. Banned law references
  console.log('--- CHECK 6: Banned Law References ---')
  const bannedTerms = ['장애인복지법', '장애인차별금지법']
  const bannedQuizzes = quizzes.filter(q => {
    const textsToCheck = [q.question || '']
    if (Array.isArray(q.options)) {
      textsToCheck.push(...q.options)
    }
    const combined = textsToCheck.join(' ')
    return bannedTerms.some(term => combined.includes(term))
  })
  const pass6 = bannedQuizzes.length === 0
  printCheck(6, 'Banned law references', pass6, `${bannedQuizzes.length} questions contain banned terms`)
  if (!pass6) {
    bannedQuizzes.slice(0, 5).forEach(q => {
      const matched = bannedTerms.filter(t => {
        const combined = [q.question, ...(q.options || [])].join(' ')
        return combined.includes(t)
      })
      console.log(`     id=${q.id} terms=[${matched.join(', ')}]`)
    })
  }
  results.push(pass6)

  // 7. Required fields non-null
  console.log('--- CHECK 7: Required Fields ---')
  const requiredFields = ['question', 'answer', 'explanation', 'subject', 'chapter', 'type', 'difficulty']
  const nullFieldQuizzes = quizzes.filter(q =>
    requiredFields.some(f => q[f] == null || q[f] === '')
  )
  const pass7 = nullFieldQuizzes.length === 0
  printCheck(7, 'Required fields', pass7, `${nullFieldQuizzes.length} questions have null/empty required fields`)
  if (!pass7) {
    nullFieldQuizzes.slice(0, 5).forEach(q => {
      const missing = requiredFields.filter(f => q[f] == null || q[f] === '')
      console.log(`     id=${q.id} missing=[${missing.join(', ')}]`)
    })
  }
  results.push(pass7)

  // 8. Type validity
  console.log('--- CHECK 8: Type Validity ---')
  const validTypes = new Set(['multiple', 'ox', 'fill_in', 'descriptive'])
  const badTypeQuizzes = quizzes.filter(q => !validTypes.has(q.type))
  const pass8 = badTypeQuizzes.length === 0
  printCheck(8, 'Type validity', pass8, `${badTypeQuizzes.length} questions have invalid type`)
  if (!pass8) {
    const badTypes = [...new Set(badTypeQuizzes.map(q => q.type))]
    console.log(`     Invalid types: ${badTypes.join(', ')}`)
  }
  results.push(pass8)

  // 9. Difficulty validity
  console.log('--- CHECK 9: Difficulty Validity ---')
  const validDiffs = new Set([1, 2, 3])
  const badDiffQuizzes = quizzes.filter(q => !validDiffs.has(q.difficulty))
  const pass9 = badDiffQuizzes.length === 0
  printCheck(9, 'Difficulty validity', pass9, `${badDiffQuizzes.length} questions have invalid difficulty`)
  if (!pass9) {
    const badDiffs = [...new Set(badDiffQuizzes.map(q => q.difficulty))]
    console.log(`     Invalid difficulties: ${badDiffs.join(', ')}`)
  }
  results.push(pass9)

  // 10. MC options count (exactly 4)
  console.log('--- CHECK 10: MC Options Count ---')
  const badOptionCount = mcQuizzes.filter(q => !Array.isArray(q.options) || q.options.length !== 4)
  const pass10 = badOptionCount.length === 0
  printCheck(10, 'MC options count (must be 4)', pass10, `${badOptionCount.length} MC questions don't have exactly 4 options`)
  if (!pass10) {
    badOptionCount.slice(0, 5).forEach(q => console.log(`     id=${q.id} options_len=${q.options?.length}`))
  }
  results.push(pass10)

  // 11. OX answer validity
  console.log('--- CHECK 11: OX Answer Validity ---')
  const oxQuizzes = quizzes.filter(q => q.type === 'ox')
  const badOxAnswers = oxQuizzes.filter(q => q.answer !== 'O' && q.answer !== 'X')
  const pass11 = badOxAnswers.length === 0
  printCheck(11, 'OX answer validity', pass11, `${badOxAnswers.length} OX questions have invalid answer out of ${oxQuizzes.length}`)
  if (!pass11) {
    badOxAnswers.slice(0, 5).forEach(q => console.log(`     id=${q.id} answer="${q.answer}"`))
  }
  results.push(pass11)

  // 12. Distribution summary
  console.log('--- CHECK 12: Distribution Summary ---')
  console.log('  By subject:')
  const bySubject = {}
  for (const q of quizzes) {
    bySubject[q.subject] = (bySubject[q.subject] || 0) + 1
  }
  for (const [subj, cnt] of Object.entries(bySubject).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${subj}: ${cnt}`)
  }

  console.log('  By type:')
  const byType = {}
  for (const q of quizzes) {
    byType[q.type] = (byType[q.type] || 0) + 1
  }
  for (const [type, cnt] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`     ${type}: ${cnt}`)
  }

  console.log('  By difficulty:')
  const byDiff = {}
  for (const q of quizzes) {
    byDiff[q.difficulty] = (byDiff[q.difficulty] || 0) + 1
  }
  for (const [diff, cnt] of Object.entries(byDiff).sort((a, b) => a[0] - b[0])) {
    console.log(`     difficulty ${diff}: ${cnt}`)
  }
  results.push(true) // distribution is informational

  // Overall
  console.log('\n========================================')
  const allPassed = results.every(Boolean)
  const passCount = results.filter(Boolean).length
  const totalChecks = results.length
  if (allPassed) {
    console.log(`\u2705 OVERALL: ALL ${totalChecks} CHECKS PASSED`)
  } else {
    console.log(`\u274C OVERALL: ${passCount}/${totalChecks} checks passed, ${totalChecks - passCount} FAILED`)
  }
  console.log('========================================')

  process.exit(allPassed ? 0 : 1)
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
