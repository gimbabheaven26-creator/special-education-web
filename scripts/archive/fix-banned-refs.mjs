import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const BANNED_IDS = ['laws-q8', 'laws-q78', 'vi-q55', 'vi-q35', 'vi-q11']
const BANNED_LAWS = ['장애인복지법', '장애인차별금지법']

function containsBannedLaw(text) {
  if (!text) return false
  return BANNED_LAWS.some((law) => text.includes(law))
}

function isPrimarilyAboutBannedLaw(row) {
  const question = row.question || ''
  const answer = typeof row.answer === 'string' ? row.answer : ''

  // If the question is asking specifically about a banned law, it's primarily about it
  for (const law of BANNED_LAWS) {
    // Question starts with or is centered on the banned law
    if (question.includes(`${law}에`) || question.includes(`${law}의`) ||
        question.includes(`${law}에서`) || question.includes(`${law}상`) ||
        question.includes(`${law}이`) || question.includes(`${law}은`) ||
        question.includes(`${law}에 따`) || question.includes(`${law}에 의`)) {
      // Check if there's no other primary law mentioned
      const otherLaws = ['특수교육법', '장애인등에 대한 특수교육법', '교육기본법', '장애인 등에 대한 특수교육법']
      const hasOtherPrimaryLaw = otherLaws.some((ol) => question.includes(ol))
      if (!hasOtherPrimaryLaw) return true
    }

    // Answer is primarily about the banned law
    if (answer.includes(law) && !answer.includes('특수교육법')) {
      // Check if the entire answer references the banned law
      const answerBannedCount = BANNED_LAWS.reduce((c, l) => c + (answer.split(l).length - 1), 0)
      if (answerBannedCount >= 2) return true
    }
  }

  return false
}

function removeBannedReferences(text) {
  if (!text) return text
  let result = text
  // Remove bracketed references like 「장애인복지법」 and surrounding clauses
  result = result.replace(/[,.]?\s*이는\s*「장애인복지법」상\s*[^.]*\./g, '.')
  result = result.replace(/[,.]?\s*「장애인복지법」[^.]*?(,|\.)/g, '$1')
  result = result.replace(/[,.]?\s*「장애인차별금지법」[^.]*?(,|\.)/g, '$1')
  // Remove parenthetical references like (장애인복지법 제X조)
  result = result.replace(/\(장애인복지법[^)]*\)/g, '')
  result = result.replace(/\(장애인차별금지법[^)]*\)/g, '')
  // Remove sentences that mention banned laws
  result = result.replace(/[^.]*한국의?\s*장애인복지법[^.]*\./g, '')
  result = result.replace(/[^.]*한국\s*장애인복지법[^.]*\./g, '')
  // Remove inline references (with or without brackets)
  result = result.replace(/[「]?장애인복지법[」]?(에 따르면|에서는|에서|에 의하면|상|의|에|은|이|을|을 통해|과|와|시행규칙|,\s*)/g, '')
  result = result.replace(/[「]?장애인차별금지법[」]?(에 따르면|에서는|에서|에 의하면|상|의|에|은|이|을|을 통해|과|와|,\s*)/g, '')
  // Remove bullet lines referencing banned laws
  result = result.replace(/\n?\s*•\s*[「]?장애인차별금지법[」]?[^\n]*/g, '')
  result = result.replace(/\n?\s*•\s*[「]?장애인복지법[」]?[^\n]*/g, '')
  // Clean up double spaces and leading/trailing whitespace
  result = result.replace(/\s{2,}/g, ' ').trim()
  return result
}

async function main() {
  console.log('=== Fetching 5 flagged quiz questions ===\n')

  const { data: rows, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('id', BANNED_IDS)

  if (error) {
    console.error('Fetch error:', error)
    process.exit(1)
  }

  if (!rows || rows.length === 0) {
    console.log('No questions found with those IDs.')
    return
  }

  console.log(`Found ${rows.length} of ${BANNED_IDS.length} questions.\n`)

  // Print all questions first
  for (const row of rows) {
    console.log(`─── ${row.id} ───`)
    console.log(`Subject: ${row.subject} | Chapter: ${row.chapter}`)
    console.log(`Type: ${row.type} | Difficulty: ${row.difficulty}`)
    console.log(`Q: ${row.question}`)
    if (row.options) console.log(`Options: ${JSON.stringify(row.options)}`)
    console.log(`Answer: ${row.answer}`)
    console.log(`Explanation: ${row.explanation}`)
    console.log()
  }

  // Decide action for each
  console.log('=== Deciding actions ===\n')

  const toDelete = []
  const toUpdate = []

  for (const row of rows) {
    const primary = isPrimarilyAboutBannedLaw(row)
    if (primary) {
      console.log(`[DELETE] ${row.id} — primarily about banned law`)
      toDelete.push(row.id)
    } else {
      console.log(`[EDIT] ${row.id} — incidental reference, will clean text`)
      const updates = {}
      if (containsBannedLaw(row.question)) {
        updates.question = removeBannedReferences(row.question)
      }
      if (containsBannedLaw(row.explanation)) {
        updates.explanation = removeBannedReferences(row.explanation)
      }
      if (row.options && row.options.some(containsBannedLaw)) {
        updates.options = row.options.map((o) =>
          containsBannedLaw(o) ? removeBannedReferences(o) : o
        )
      }
      if (containsBannedLaw(row.answer)) {
        updates.answer = removeBannedReferences(row.answer)
      }
      if (row.case_context && containsBannedLaw(row.case_context)) {
        updates.case_context = removeBannedReferences(row.case_context)
      }
      if (row.wrong_explanations) {
        const we = row.wrong_explanations
        const weKeys = Object.keys(we)
        const hasRef = weKeys.some((k) => containsBannedLaw(we[k]))
        if (hasRef) {
          const cleaned = {}
          for (const k of weKeys) {
            cleaned[k] = containsBannedLaw(we[k]) ? removeBannedReferences(we[k]) : we[k]
          }
          updates.wrong_explanations = cleaned
        }
      }
      if (Object.keys(updates).length > 0) {
        toUpdate.push({ id: row.id, updates })
      } else {
        console.log(`  (no banned text found in fields — skipping)`)
      }
    }
  }

  // Execute deletes
  if (toDelete.length > 0) {
    console.log(`\n=== Deleting ${toDelete.length} questions ===`)
    const { error: delErr } = await supabase
      .from('quiz_questions')
      .delete()
      .in('id', toDelete)
    if (delErr) {
      console.error('Delete error:', delErr)
    } else {
      console.log(`Deleted: ${toDelete.join(', ')}`)
    }
  }

  // Execute updates
  if (toUpdate.length > 0) {
    console.log(`\n=== Updating ${toUpdate.length} questions ===`)
    for (const item of toUpdate) {
      console.log(`\nUpdating ${item.id}:`)
      for (const [field, value] of Object.entries(item.updates)) {
        const display = typeof value === 'string' ? value : JSON.stringify(value)
        console.log(`  ${field}: ${display.substring(0, 120)}${display.length > 120 ? '...' : ''}`)
      }
      const { error: updErr } = await supabase
        .from('quiz_questions')
        .update(item.updates)
        .eq('id', item.id)
      if (updErr) {
        console.error(`  Update error for ${item.id}:`, updErr)
      } else {
        console.log(`  ✓ Updated successfully`)
      }
    }
  }

  // Verify
  console.log('\n=== Verification ===')
  const { data: remaining } = await supabase
    .from('quiz_questions')
    .select('id, question')
    .in('id', BANNED_IDS)
  console.log(`Remaining questions from flagged list: ${remaining ? remaining.length : 0}`)
  if (remaining) {
    for (const r of remaining) {
      const stillHasBanned = containsBannedLaw(r.question)
      console.log(`  ${r.id}: ${stillHasBanned ? 'STILL HAS BANNED REF' : 'clean'}`)
    }
  }

  console.log('\nDone.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
