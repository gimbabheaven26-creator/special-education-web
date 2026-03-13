import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const supabase = createClient(
  'https://ssluhxvbyzqmdkbjwoke.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const data = JSON.parse(readFileSync('scripts/quiz-data/laws-restore.json', 'utf8'))
console.log(`Restoring ${data.length} laws questions...`)

const { error } = await supabase.from('quiz_questions').upsert(data, { onConflict: 'id' })
if (error) { console.error(error.message); process.exit(1) }

const { count } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true }).eq('subject', 'laws')
console.log(`Laws: ${count}`)

const { count: total } = await supabase.from('quiz_questions').select('*', { count: 'exact', head: true })
console.log(`Total: ${total}`)
