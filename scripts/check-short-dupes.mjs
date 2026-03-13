import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function fetchAllQuizQuestions() {
  const allRows = []
  const PAGE_SIZE = 1000
  let offset = 0

  while (true) {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('id, subject, type, question')
      .range(offset, offset + PAGE_SIZE - 1)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }
    if (!data || data.length === 0) break

    allRows.push(...data)
    if (data.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return allRows
}

function findShortQuestions(rows, threshold = 20) {
  return rows
    .filter((r) => r.question.length < threshold)
    .sort((a, b) => a.question.length - b.question.length)
}

function findDuplicateGroups(rows) {
  const groups = new Map()
  for (const row of rows) {
    const text = row.question.trim()
    if (!groups.has(text)) {
      groups.set(text, [])
    }
    groups.get(text).push(row)
  }

  const dupes = []
  for (const [text, members] of groups) {
    if (members.length > 1) {
      dupes.push({ text, members })
    }
  }
  return dupes.sort((a, b) => b.members.length - a.members.length)
}

async function main() {
  console.log('Fetching all quiz questions...\n')
  const rows = await fetchAllQuizQuestions()
  console.log(`Total quiz questions: ${rows.length}\n`)

  // --- Short questions ---
  const SHORT_THRESHOLD = 20
  const shortOnes = findShortQuestions(rows, SHORT_THRESHOLD)

  console.log('='.repeat(80))
  console.log(`SHORT QUESTIONS (text < ${SHORT_THRESHOLD} chars): ${shortOnes.length} found`)
  console.log('='.repeat(80))

  if (shortOnes.length === 0) {
    console.log('  (none)')
  } else {
    console.log(
      `${'ID'.padEnd(16)} ${'Subject'.padEnd(24)} ${'Type'.padEnd(14)} ${'Len'.padEnd(5)} Question`
    )
    console.log('-'.repeat(80))
    for (const r of shortOnes) {
      console.log(
        `${r.id.padEnd(16)} ${r.subject.padEnd(24)} ${r.type.padEnd(14)} ${String(r.question.length).padEnd(5)} ${r.question}`
      )
    }
  }

  // --- Duplicates ---
  const dupeGroups = findDuplicateGroups(rows)

  console.log('')
  console.log('='.repeat(80))
  console.log(`DUPLICATE QUESTION GROUPS (identical text): ${dupeGroups.length} groups`)
  console.log('='.repeat(80))

  if (dupeGroups.length === 0) {
    console.log('  (none)')
  } else {
    for (const group of dupeGroups) {
      const preview =
        group.text.length > 100 ? group.text.slice(0, 100) + '...' : group.text
      console.log(`\n  [${group.members.length} duplicates] "${preview}"`)
      for (const m of group.members) {
        console.log(`    - ${m.id}  (subject: ${m.subject}, type: ${m.type})`)
      }
    }
  }

  // --- Summary ---
  console.log('\n' + '='.repeat(80))
  console.log('SUMMARY')
  console.log('='.repeat(80))
  console.log(`Total questions:    ${rows.length}`)
  console.log(`Short (< ${SHORT_THRESHOLD} chars): ${shortOnes.length}`)
  console.log(`Duplicate groups:   ${dupeGroups.length}`)
  const totalDupeRows = dupeGroups.reduce((sum, g) => sum + g.members.length, 0)
  console.log(`Rows in dup groups: ${totalDupeRows}`)
}

main().catch((err) => {
  console.error('FATAL:', err)
  process.exit(1)
})
