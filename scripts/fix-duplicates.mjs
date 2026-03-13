/**
 * fix-duplicates.mjs
 * Analyzes and fixes duplicate quiz questions in Supabase.
 *
 * Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node scripts/fix-duplicates.mjs
 *   or pass key as CLI arg: node scripts/fix-duplicates.mjs <key>
 */

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY =
  process.argv[2] ||
  process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('Service role key required (env or CLI arg)')
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=minimal',
}

async function fetchRows(ids) {
  const url = `${SUPABASE_URL}/rest/v1/quiz_questions?id=in.(${ids.join(',')})`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

async function deleteRow(id) {
  const url = `${SUPABASE_URL}/rest/v1/quiz_questions?id=eq.${id}`
  const res = await fetch(url, { method: 'DELETE', headers })
  if (!res.ok) {
    throw new Error(`Delete failed for ${id}: ${res.status} ${await res.text()}`)
  }
  console.log(`  DELETED: ${id}`)
}

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

async function analyzeGroup1() {
  console.log('\n=== Group 1: intro-q16 vs laws-q62 ===')
  const rows = await fetchRows(['intro-q16', 'laws-q62'])
  const intro = rows.find((r) => r.id === 'intro-q16')
  const laws = rows.find((r) => r.id === 'laws-q62')

  if (!intro || !laws) {
    console.log('  One or both rows not found. Skipping.')
    return
  }

  console.log(`  Question stem identical: ${intro.question === laws.question}`)
  console.log(`  Options identical: ${arraysEqual(intro.options, laws.options)}`)
  console.log(`  Answer identical: ${intro.answer === laws.answer}`)

  const sameOptions = arraysEqual(intro.options, laws.options)
  const sameAnswer = intro.answer === laws.answer

  if (sameOptions && sameAnswer) {
    console.log('  -> Truly identical. Deleting laws-q62 (관련서비스 fits better in introduction).')
    await deleteRow('laws-q62')
  } else {
    console.log('  -> Different options/answers. Both are distinct questions. Keeping both.')
    console.log(`  intro-q16 options: ${JSON.stringify(intro.options)}`)
    console.log(`  laws-q62  options: ${JSON.stringify(laws.options)}`)
    console.log(`  intro-q16 answer: ${intro.answer}`)
    console.log(`  laws-q62  answer: ${laws.answer}`)
  }
}

async function analyzeGroup2() {
  console.log('\n=== Group 2: cd-q62 vs cd-q63 ===')
  const rows = await fetchRows(['cd-q62', 'cd-q63'])
  const q62 = rows.find((r) => r.id === 'cd-q62')
  const q63 = rows.find((r) => r.id === 'cd-q63')

  if (!q62 || !q63) {
    console.log('  One or both rows not found. Skipping.')
    return
  }

  console.log(`  Question stem identical: ${q62.question === q63.question}`)
  console.log(`  Case context identical: ${q62.case_context === q63.case_context}`)
  console.log(`  Options identical: ${arraysEqual(q62.options, q63.options)}`)
  console.log(`  Answer identical: ${q62.answer === q63.answer}`)

  const sameContext = q62.case_context === q63.case_context
  const sameOptions = arraysEqual(q62.options, q63.options)
  const sameAnswer = q62.answer === q63.answer

  if (sameContext && sameOptions && sameAnswer) {
    console.log('  -> Truly identical. Deleting cd-q63.')
    await deleteRow('cd-q63')
  } else {
    console.log('  -> Different case/options/answers. Both are distinct questions. Keeping both.')
    console.log(`  cd-q62 answer: ${q62.answer} | cd-q63 answer: ${q63.answer}`)
    console.log(`  cd-q62 context snippet: ${q62.case_context?.slice(0, 60)}...`)
    console.log(`  cd-q63 context snippet: ${q63.case_context?.slice(0, 60)}...`)
  }
}

async function main() {
  console.log('Duplicate Quiz Question Analysis & Fix')
  console.log('======================================')

  try {
    await analyzeGroup1()
    await analyzeGroup2()
    console.log('\nDone.')
  } catch (error) {
    console.error('Error:', error.message)
    process.exit(1)
  }
}

main()
