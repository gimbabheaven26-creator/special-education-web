/**
 * Fix laws-q58: Update incorrect answer key
 *
 * Question: 특수교육대상자의 의무교육 범위
 * Per 장애인 등에 대한 특수교육법 제3조,
 * correct answer is "유치원부터 고등학교까지" (index 0)
 * Current answer is incorrectly set to "1" (초등학교부터 중학교까지)
 */

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

async function fetchQuestion(id) {
  const url = `${SUPABASE_URL}/rest/v1/quiz_questions?id=eq.${id}&select=*`
  const res = await fetch(url, { headers })
  if (!res.ok) {
    throw new Error(`Fetch failed: ${res.status} ${await res.text()}`)
  }
  const rows = await res.json()
  if (rows.length === 0) {
    throw new Error(`Question ${id} not found`)
  }
  return rows[0]
}

async function updateAnswer(id, newAnswer) {
  const url = `${SUPABASE_URL}/rest/v1/quiz_questions?id=eq.${id}`
  const res = await fetch(url, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ answer: String(newAnswer) }),
  })
  if (!res.ok) {
    throw new Error(`Update failed: ${res.status} ${await res.text()}`)
  }
  return res.json()
}

async function main() {
  const questionId = 'laws-q58'

  // Step 1: Fetch and print current state
  console.log('=== Step 1: Fetch current state ===')
  const before = await fetchQuestion(questionId)
  console.log(JSON.stringify(before, null, 2))
  console.log(`\nCurrent answer: "${before.answer}"`)

  if (before.answer === '0') {
    console.log('\nAnswer is already correct (0). No update needed.')
    return
  }

  if (before.answer !== '1') {
    console.log(`\nWARNING: Expected current answer "1", got "${before.answer}". Proceeding anyway.`)
  }

  // Step 2: Update answer to 0
  console.log('\n=== Step 2: Update answer to "0" ===')
  const updated = await updateAnswer(questionId, 0)
  console.log('Update response:', JSON.stringify(updated, null, 2))

  // Step 3: Verify
  console.log('\n=== Step 3: Verify ===')
  const after = await fetchQuestion(questionId)
  console.log(`Answer after update: "${after.answer}"`)

  if (after.answer === '0') {
    console.log('Verification PASSED: answer is now "0"')
  } else {
    throw new Error(`Verification FAILED: answer is "${after.answer}", expected "0"`)
  }
}

main().catch((err) => {
  console.error('ERROR:', err.message)
  process.exit(1)
})
