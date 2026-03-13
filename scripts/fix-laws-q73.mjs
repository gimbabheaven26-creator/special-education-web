import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

async function main() {
  // 1. Fetch laws-q73
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('id', 'laws-q73')
    .single()

  if (error || !data) {
    throw new Error(`Failed to fetch laws-q73: ${error?.message ?? 'not found'}`)
  }

  console.log('=== Current laws-q73 ===')
  console.log('Question:', data.question)
  console.log('Options:', JSON.stringify(data.options, null, 2))
  console.log('Current answer index:', data.answer)
  console.log('Explanation:', data.explanation)
  console.log()

  // 2. Determine correct answer from explanation
  //
  // The explanation says: "60일이 아닌 30일 이내이므로 4번이 올바르지 않은 설명이다"
  // "4번" in Korean 1-based numbering = index 3 (0-based).
  // The question asks "올바르지 않은 것은?" (which is incorrect?),
  // so the answer is option [3]: "진단·평가 결과는 60일 이내에 보호자에게 통보한다"
  // The original answer was 4 (invalid 0-based index for 4 options: 0-3).
  // It was clearly stored as a 1-based index by mistake.
  const options = data.options
  const correctIndex = 3

  // 3. Validate the answer is a valid 0-based index
  if (correctIndex < 0 || correctIndex > 3) {
    throw new Error(`Determined index ${correctIndex} is out of range`)
  }

  if (correctIndex === data.answer) {
    console.log(`Answer index is already correct (${correctIndex}). No fix needed.`)
    return
  }

  console.log(`=== Fix ===`)
  console.log(`Changing answer from ${data.answer} to ${correctIndex}`)
  console.log(`Correct option: [${correctIndex}] ${options[correctIndex]}`)
  console.log()

  // 4. Update the answer
  const { error: updateError } = await supabase
    .from('quiz_questions')
    .update({ answer: correctIndex })
    .eq('id', 'laws-q73')

  if (updateError) {
    throw new Error(`Failed to update: ${updateError.message}`)
  }

  // 5. Verify the update
  const { data: updated, error: verifyError } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('id', 'laws-q73')
    .single()

  if (verifyError || !updated) {
    throw new Error(`Failed to verify: ${verifyError?.message ?? 'not found'}`)
  }

  console.log('=== Verified ===')
  console.log('Updated answer index:', updated.answer)
  console.log(`Option: [${updated.answer}] ${updated.options[updated.answer]}`)
  console.log('Fix applied successfully.')
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
