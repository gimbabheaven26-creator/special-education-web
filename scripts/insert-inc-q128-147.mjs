import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const questions = JSON.parse(
  readFileSync('/Users/gihoonkim/Projects/special-education-web/scripts/quiz-data/inc-depth2-q128-147.json', 'utf-8')
)

const { error } = await supabase.from('quiz_questions').upsert(questions, { onConflict: 'id' })
if (error) {
  console.error('FAIL:', error.message)
  process.exit(1)
} else {
  console.log(`삽입 완료: ${questions.length}건`)
  const ids = questions.map(q => q.id)
  const { count } = await supabase
    .from('quiz_questions')
    .select('*', { count: 'exact', head: true })
    .in('id', ids)
  console.log(`확인: ${count}/${questions.length}건`)
}
