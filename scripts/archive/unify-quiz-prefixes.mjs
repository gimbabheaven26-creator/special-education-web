import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required.\nUsage: SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/unify-quiz-prefixes.mjs')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// Old prefix → New prefix mapping
const PREFIX_MAP = {
  'behav': 'bs',
  'curr': 'cur',
  'incl': 'inc',
  'assess': 'asmnt',
  'comm': 'cd',
  'hear': 'hi',
  'phys': 'pd',
  'vis': 'vi',
}

async function main() {
  // 1. Fetch all quiz questions
  const { data: quizzes, error } = await supabase
    .from('quiz_questions')
    .select('id, subject')

  if (error) {
    throw new Error(`Failed to fetch quizzes: ${error.message}`)
  }

  console.log(`Total quizzes: ${quizzes.length}`)

  // 2. Find max q-number per new prefix
  const maxNum = {}
  for (const q of quizzes) {
    const match = q.id.match(/^([a-z]+)-q(\d+)$/)
    if (match) {
      const prefix = match[1]
      const num = parseInt(match[2], 10)
      maxNum[prefix] = Math.max(maxNum[prefix] || 0, num)
    }
  }

  // 3. Find IDs that need renaming, assigning new sequential numbers
  const renames = []
  // Group old-prefix IDs by old prefix, sorted by number
  const byOldPrefix = {}
  for (const q of quizzes) {
    const match = q.id.match(/^([a-z]+)-q(\d+)$/)
    if (match && PREFIX_MAP[match[1]]) {
      const oldPrefix = match[1]
      if (!byOldPrefix[oldPrefix]) byOldPrefix[oldPrefix] = []
      byOldPrefix[oldPrefix].push({ ...q, num: parseInt(match[2], 10) })
    }
  }

  for (const [oldPrefix, items] of Object.entries(byOldPrefix)) {
    const newPrefix = PREFIX_MAP[oldPrefix]
    let nextNum = (maxNum[newPrefix] || 0) + 1
    for (const item of items.sort((a, b) => a.num - b.num)) {
      const newId = `${newPrefix}-q${nextNum}`
      renames.push({ oldId: item.id, newId })
      nextNum++
    }
  }

  console.log(`IDs to rename: ${renames.length}`)

  if (renames.length === 0) {
    console.log('Nothing to do.')
    return
  }

  // 3. Show preview
  console.log('\n--- Preview (first 5) ---')
  for (const r of renames.slice(0, 5)) {
    console.log(`  ${r.oldId} → ${r.newId}`)
  }
  console.log('...')

  // 4. Check for conflicts
  const newIds = new Set(renames.map(r => r.newId))
  const existingIds = new Set(quizzes.map(q => q.id))
  const conflicts = [...newIds].filter(id => existingIds.has(id))
  if (conflicts.length > 0) {
    console.error(`\nCONFLICT: ${conflicts.length} new IDs already exist!`)
    for (const c of conflicts.slice(0, 10)) {
      console.error(`  ${c}`)
    }
    throw new Error('Aborting due to ID conflicts')
  }

  // 5. Execute renames (delete old + insert new for each)
  // Supabase doesn't support PK update, so we fetch full row, insert with new ID, delete old
  let success = 0
  let failed = 0

  for (const r of renames) {
    // Fetch full row
    const { data: row, error: fetchErr } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('id', r.oldId)
      .single()

    if (fetchErr || !row) {
      console.error(`  SKIP ${r.oldId}: ${fetchErr?.message}`)
      failed++
      continue
    }

    // Insert with new ID
    const newRow = { ...row, id: r.newId }
    const { error: insertErr } = await supabase
      .from('quiz_questions')
      .insert(newRow)

    if (insertErr) {
      console.error(`  INSERT FAIL ${r.newId}: ${insertErr.message}`)
      failed++
      continue
    }

    // Delete old row
    const { error: deleteErr } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', r.oldId)

    if (deleteErr) {
      console.error(`  DELETE FAIL ${r.oldId}: ${deleteErr.message}`)
      failed++
      continue
    }

    success++
  }

  console.log(`\n--- Result ---`)
  console.log(`Success: ${success}`)
  console.log(`Failed: ${failed}`)
  console.log(`Total renamed: ${success}/${renames.length}`)

  // 6. Verify final prefix distribution
  const { data: final } = await supabase
    .from('quiz_questions')
    .select('id')

  if (final) {
    const prefixCount = {}
    for (const q of final) {
      const prefix = q.id.split('-')[0]
      prefixCount[prefix] = (prefixCount[prefix] || 0) + 1
    }
    console.log('\n--- Final prefix distribution ---')
    for (const [p, c] of Object.entries(prefixCount).sort((a, b) => b[1] - a[1])) {
      const isOld = Object.keys(PREFIX_MAP).includes(p)
      console.log(`  ${p}: ${c}${isOld ? ' ⚠️ OLD PREFIX STILL EXISTS' : ''}`)
    }
  }
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
