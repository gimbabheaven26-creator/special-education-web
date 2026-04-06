import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const files = [
  'scripts/quiz-data/quality-rework-batch1.json',
  'scripts/quiz-data/quality-rework-batch2.json',
]

async function main() {
  let totalInserted = 0
  let totalFailed = 0

  for (const file of files) {
    const data = JSON.parse(readFileSync(file, 'utf8'))
    console.log(`\nInserting ${data.length} from ${file}...`)

    const { data: result, error } = await supabase
      .from('quiz_questions')
      .upsert(data, { onConflict: 'id' })

    if (error) {
      console.error(`  ERROR: ${error.message}`)
      totalFailed += data.length
    } else {
      totalInserted += data.length
      console.log(`  OK: ${data.length} inserted`)
    }
  }

  console.log(`\n=== Result ===`)
  console.log(`Inserted: ${totalInserted}`)
  console.log(`Failed: ${totalFailed}`)

  // Verify total
  const { count } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
  console.log(`Total quizzes in DB: ${count}`)
}

main().catch(err => { console.error(err.message); process.exit(1) })
