import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ssluhxvbyzqmdkbjwoke.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY env var required')
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const BANNED_LAWS = ['장애인복지법', '장애인차별금지법']

function containsBannedLaw(text) {
  if (!text) return false
  return BANNED_LAWS.some((law) => text.includes(law))
}

// Manual, precise fixes for each question
const manualFixes = [
  {
    id: 'vi-q11',
    updates: {
      question: '스넬렌(Snellen) 시력표에서 6/60의 시력은 정상인이 (   )m에서 볼 수 있는 시표를 6m에서 겨우 볼 수 있음을 의미한다.',
      explanation: '스넬렌 시력 표기법에서 분자는 검사 거리, 분모는 정상 시력자가 해당 시표를 볼 수 있는 거리를 나타낸다. 6/60은 정상인이 60m에서 볼 수 있는 크기의 시표를 6m에서 겨우 식별한다는 의미이다. 소수 시력으로 환산하면 0.1에 해당한다. 좋은 눈의 교정시력이 0.1 이하이면 시각장애로 판정할 수 있다. 미국식 표기인 20/200(20피트 기준)과 동일한 개념이다.',
    },
  },
  {
    id: 'vi-q35',
    updates: {
      explanation: '스넬렌 시력은 분수로 표기하며 소수로 환산할 수 있다. 20/200 = 20÷200 = 0.1이다. 미국에서는 좋은 눈의 최대 교정시력이 20/200(0.1) 이하이거나 시야가 20도 이하인 경우 법적 맹(legal blindness)으로 정의한다. 미터법으로는 6/60에 해당한다(6÷60=0.1). 한국에서도 좋은 눈의 교정시력 0.1 이하를 시각장애의 주요 기준으로 사용한다.',
    },
  },
  {
    id: 'vi-q55',
    updates: {
      explanation: '법적 맹(legal blindness)은 좋은 눈의 최대 교정시력이 0.04 이하이거나 시야각이 20도 이내인 경우에 해당한다. 미국 기준으로는 20/200 이하 또는 시야각 20도 이내이다. 시야각이 좁은 경우(터널 시야) 중심시력이 양호하더라도 법적 맹에 해당할 수 있다.',
    },
  },
  {
    id: 'laws-q8',
    updates: {
      explanation: '「장애인 등에 대한 특수교육법」 제28조에 따른 특수교육 관련 서비스는 가족 지원, 치료지원, 보조인력 지원, 보조공학기기 지원, 학습보조기기 지원, 통학 지원, 정보접근 지원 등입니다. "직업능력평가 및 취업 알선"은 장애인고용촉진법의 영역에 해당합니다.',
    },
  },
  {
    id: 'laws-q78',
    updates: {
      explanation: `【배점 배분】
• ㉠ 제21조 명시 0.5점 + 통합교육 정의 서술 0.5점 = 1점
• ㉡ 정당한 편의 2가지 각 0.5점 + 법적 근거(제21조 제2항) 0.5점 = 1.5점
• ㉢ 구성원 4명 각 0.375점 = 1.5점

【이론적 근거】
• 장애인 등에 대한 특수교육법 제2조(정의) 제6호: 통합교육 정의
• 장애인 등에 대한 특수교육법 제21조(통합교육): 정당한 편의 제공 의무
• 장애인 등에 대한 특수교육법 제22조(개별화교육): 개별화교육지원팀 구성`,
    },
  },
]

async function main() {
  console.log('=== Applying manual corrections ===\n')

  for (const fix of manualFixes) {
    console.log(`Updating ${fix.id}...`)
    for (const [field, value] of Object.entries(fix.updates)) {
      const preview = value.substring(0, 80)
      console.log(`  ${field}: ${preview}...`)
    }
    const { error } = await supabase
      .from('quiz_questions')
      .update(fix.updates)
      .eq('id', fix.id)
    if (error) {
      console.error(`  ERROR: ${JSON.stringify(error)}`)
    } else {
      console.log(`  Done.`)
    }
  }

  // Final verification
  console.log('\n=== Final verification ===\n')
  const ids = manualFixes.map((f) => f.id)
  const { data: rows, error } = await supabase
    .from('quiz_questions')
    .select('id, question, explanation, options, answer')
    .in('id', ids)

  if (error) {
    console.error('Fetch error:', error)
    return
  }

  for (const row of rows) {
    const fields = [row.question, row.explanation, row.answer, JSON.stringify(row.options)]
    const allText = fields.filter(Boolean).join(' ')
    const hasBanned = containsBannedLaw(allText)
    console.log(`${row.id}: ${hasBanned ? 'STILL HAS BANNED REF' : 'CLEAN'}`)
    if (hasBanned) {
      for (const law of BANNED_LAWS) {
        if (allText.includes(law)) {
          console.log(`  Found: ${law}`)
        }
      }
    }
    console.log(`  Q: ${row.question.substring(0, 100)}...`)
    console.log(`  E: ${row.explanation.substring(0, 100)}...`)
    console.log()
  }

  console.log('Done.')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
