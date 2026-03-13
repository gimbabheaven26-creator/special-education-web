import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required.')
}

const supabase = createClient(
  'https://ssluhxvbyzqmdkbjwoke.supabase.co',
  SERVICE_ROLE_KEY
)

const data = JSON.parse(readFileSync('scripts/quiz-data/laws-quality-rework.json', 'utf8'))
console.log(`Inserting ${data.length} laws quality-rework questions...`)

const { error } = await supabase.from('quiz_questions').upsert(data, { onConflict: 'id' })
if (error) {
  console.error(`Insert failed: ${error.message}`)
  process.exit(1)
}

console.log(`Inserted ${data.length} questions successfully.`)

const { count: lawsCount } = await supabase
  .from('quiz_questions')
  .select('*', { count: 'exact', head: true })
  .eq('subject', 'laws')

const { count: totalCount } = await supabase
  .from('quiz_questions')
  .select('*', { count: 'exact', head: true })

console.log(`\nLaws quizzes: ${lawsCount}`)
console.log(`Total quizzes: ${totalCount}`)
