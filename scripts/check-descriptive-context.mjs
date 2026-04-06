import { getClient } from './lib/supabase-client.mjs';

const supabase = getClient();

// Keywords that indicate the question references a scenario/case
const SCENARIO_KEYWORDS = ['사례', '상담 기록', '다음은']

function needsCaseContext(questionText) {
  return SCENARIO_KEYWORDS.some((kw) => questionText.includes(kw))
}

function truncate(text, maxLen = 80) {
  if (!text) return '(empty)'
  const clean = text.replace(/\n/g, ' ').trim()
  return clean.length > maxLen ? clean.slice(0, maxLen) + '...' : clean
}

async function main() {
  // Fetch all descriptive questions with NULL case_context
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('id, subject, difficulty, question')
    .eq('type', 'descriptive')
    .is('case_context', null)
    .order('subject')
    .order('id')

  if (error) {
    console.error('Query failed:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('No descriptive questions with NULL case_context found.')
    return
  }

  console.log(`\n=== Descriptive Questions with NULL case_context ===`)
  console.log(`Total: ${data.length}\n`)

  // Categorize
  const shouldHave = []
  const standaloneOk = []

  for (const q of data) {
    if (needsCaseContext(q.question)) {
      shouldHave.push(q)
    } else {
      standaloneOk.push(q)
    }
  }

  // Group by subject
  const groupBySubject = (items) => {
    const groups = {}
    for (const q of items) {
      const key = q.subject
      if (!groups[key]) groups[key] = []
      groups[key].push(q)
    }
    return groups
  }

  // --- ISSUES: Should have case_context ---
  console.log(`\n${'='.repeat(70)}`)
  console.log(`ISSUE: Questions that SHOULD have case_context (${shouldHave.length})`)
  console.log(`Matched keywords: ${SCENARIO_KEYWORDS.join(', ')}`)
  console.log(`${'='.repeat(70)}`)

  const issueGroups = groupBySubject(shouldHave)
  for (const [subject, questions] of Object.entries(issueGroups)) {
    console.log(`\n--- ${subject} (${questions.length}) ---`)
    for (const q of questions) {
      console.log(`  [${q.id}] (${q.difficulty}) ${truncate(q.question)}`)
    }
  }

  // --- OK: Standalone essay prompts ---
  console.log(`\n${'='.repeat(70)}`)
  console.log(`OK: Standalone essay prompts - no case_context needed (${standaloneOk.length})`)
  console.log(`${'='.repeat(70)}`)

  const okGroups = groupBySubject(standaloneOk)
  for (const [subject, questions] of Object.entries(okGroups)) {
    console.log(`\n--- ${subject} (${questions.length}) ---`)
    for (const q of questions) {
      console.log(`  [${q.id}] (${q.difficulty}) ${truncate(q.question)}`)
    }
  }

  // --- Summary ---
  console.log(`\n${'='.repeat(70)}`)
  console.log(`SUMMARY`)
  console.log(`${'='.repeat(70)}`)
  console.log(`Total descriptive with NULL case_context: ${data.length}`)
  console.log(`  ISSUE (should have case_context):       ${shouldHave.length}`)
  console.log(`  OK (standalone essay):                   ${standaloneOk.length}`)

  console.log(`\nBy subject:`)
  const allGroups = groupBySubject(data)
  for (const [subject, questions] of Object.entries(allGroups)) {
    const issueCount = questions.filter((q) => needsCaseContext(q.question)).length
    const okCount = questions.length - issueCount
    console.log(`  ${subject.padEnd(30)} total: ${questions.length}  issue: ${issueCount}  ok: ${okCount}`)
  }
}

main().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
