import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssluhxvbyzqmdkbjwoke.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const TARGET_IDS = ['vi-q115', 'hi-q105', 'hi-q94', 'hi-q92', 'vi-q122', 'vi-q125']

const { data, error } = await supabase
  .from('quiz_questions')
  .select('*')
  .in('id', TARGET_IDS)

if (error) { console.error(error); process.exit(1) }
if (!data) { console.error('no data'); process.exit(1) }

for (const q of data) {
  console.log(`\n${'='.repeat(70)}`)
  console.log(`ID: ${q.id}  type=${q.type}  answer=${q.answer}`)
  console.log(`Q: ${q.question_text}`)
  if (q.case_context) console.log(`CTX: ${q.case_context.slice(0, 200)}`)
  console.log(`wrong_explanations:`)
  for (const [k, v] of Object.entries(q.wrong_explanations || {})) {
    console.log(`  [${k}]: ${v}`)
  }
}
