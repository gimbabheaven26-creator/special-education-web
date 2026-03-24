/**
 * notion-glossary-insert.mjs
 * NISE 용어사전 + KICE 키워드 → 노션 글로서리 DB 배치 삽입
 *
 * 사용법:
 *   node scripts/notion-glossary-insert.mjs --source nise --start 0 --end 500
 *   node scripts/notion-glossary-insert.mjs --source nise --start 500 --end 1129
 *   node scripts/notion-glossary-insert.mjs --source kice --freq-min 3
 *   node scripts/notion-glossary-insert.mjs --dry-run --source nise --start 0 --end 5
 *
 * 환경변수 (process.env에서 읽음):
 *   NOTION_API_KEY — Notion 통합 토큰
 *   NOTION_GLOSSARY_DB_ID — 특수교육 글로서리 DB ID
 *
 * 실행 예시:
 *   NOTION_API_KEY=ntn_... NOTION_GLOSSARY_DB_ID=32dd... node scripts/notion-glossary-insert.mjs --source nise --start 0 --end 5 --dry-run
 */

import { readFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

// ── 환경변수 로드 (.env.local 자동 파싱, process.env 우선) ──────────
function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return {}
  const env = {}
  readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
    if (m) env[m[1]] = m[2].trim()
  })
  return env
}

const envFromFile = loadEnvFile(join(projectRoot, '.env.local'))

function getEnv(key) {
  return process.env[key] || envFromFile[key] || null
}

const NOTION_TOKEN = getEnv('NOTION_API_KEY')
const GLOSSARY_DB_ID = getEnv('NOTION_GLOSSARY_DB_ID')

if (!NOTION_TOKEN) {
  console.error('❌ NOTION_API_KEY 미설정. .env.local 또는 환경변수에 추가 필요')
  process.exit(1)
}
if (!GLOSSARY_DB_ID) {
  console.error('❌ NOTION_GLOSSARY_DB_ID 미설정. .env.local에 NOTION_GLOSSARY_DB_ID=32dd1034-8f3f-819b-b6f5-e0734d89553b 추가')
  process.exit(1)
}

// ── CLI 파싱 ──────────────────────────────────────────────────────
const args = process.argv.slice(2)

function getArg(flag, defaultVal = null) {
  const idx = args.indexOf(flag)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : defaultVal
}

const SOURCE   = getArg('--source', 'nise')
const START    = parseInt(getArg('--start', '0'))
const END_RAW  = getArg('--end', null)
const END      = END_RAW ? parseInt(END_RAW) : Infinity
const FREQ_MIN = parseInt(getArg('--freq-min', '5'))
const DRY_RUN  = args.includes('--dry-run')
const DELAY_MS = 350

// ── 데이터 로드 ───────────────────────────────────────────────────
const niseData = JSON.parse(
  readFileSync(join(projectRoot, 'data/terminology/nise-dictionary.json'), 'utf8')
)

const kiceRaw = JSON.parse(
  readFileSync(join(projectRoot, 'data/terminology/kice-terms.json'), 'utf8')
)
const kiceFreqMap = kiceRaw.keywords_by_frequency  // { '자폐성장애': 23, ... }

// ── by-subject 역방향 인덱스 (term_ko → subject[]) ────────────────
const SUBJECT_FILE_MAP = {
  'introduction.json':           '특수교육학개론',
  'behavior-support.json':       '행동지원',
  'visual-impairment.json':      '시각장애',
  'hearing-impairment.json':     '청각장애',
  'physical-disability.json':    '지체장애',
  'communication-disorder.json': '의사소통장애',
  'curriculum.json':             '교육과정',
  'transition.json':             '전환교육',
  'inclusive-education.json':    '통합교육',
  'assessment.json':             '진단평가',
  'laws.json':                   '법령',
}

function buildTermSubjectIndex() {
  const index = new Map()
  const baseDir = join(projectRoot, 'data/terminology/by-subject/')
  for (const [filename, subject] of Object.entries(SUBJECT_FILE_MAP)) {
    const filePath = join(baseDir, filename)
    if (!existsSync(filePath)) continue
    try {
      const d = JSON.parse(readFileSync(filePath, 'utf8'))
      const terms = d.terms || d  // terms 배열 또는 루트 배열
      const termArr = Array.isArray(terms) ? terms : []
      for (const t of termArr) {
        const key = t.term_ko || t.ko
        if (!key) continue
        if (!index.has(key)) index.set(key, [])
        index.get(key).push(subject)
      }
    } catch (e) {
      // 파일 파싱 오류 무시
    }
  }
  return index
}

const termSubjectIndex = buildTermSubjectIndex()

// ── 유틸 ──────────────────────────────────────────────────────────
function getImportance(freq) {
  if (freq >= 10) return '고'
  if (freq >= 3)  return '중'
  return '저'
}

function truncateDef(def, maxLen = 500) {
  if (!def || typeof def !== 'string') return ''
  const cleaned = def.trim()
  return cleaned.length > maxLen ? cleaned.slice(0, maxLen) + '...' : cleaned
}

const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Notion 페이지 생성 ────────────────────────────────────────────
async function insertEntry({ term_ko, term_hanja, term_en, definition, source, subjects, kice_freq }) {
  const freq = kice_freq || 0
  const importance = getImportance(freq)
  const defSummary = truncateDef(definition)
  const today = new Date().toISOString().slice(0, 10)

  if (DRY_RUN) {
    const subjectStr = subjects?.length ? subjects.join(', ') : '없음'
    console.log(`[DRY] Would insert: ${term_ko} | source: ${source} | freq: ${freq} | importance: ${importance} | subjects: ${subjectStr}`)
    return { ok: true, dry: true }
  }

  const properties = {
    '용어':    { title: [{ text: { content: term_ko.slice(0, 100) } }] },
    '출처':    { select: { name: source } },
    'KICE빈도': { number: freq },
    '중요도':  { select: { name: importance } },
    '날짜':    { date: { start: today } },
  }

  if (term_hanja) {
    properties['한자'] = { rich_text: [{ text: { content: String(term_hanja).slice(0, 200) } }] }
  }
  if (term_en) {
    properties['영문'] = { rich_text: [{ text: { content: String(term_en).slice(0, 200) } }] }
  }
  if (defSummary) {
    properties['정의요약'] = { rich_text: [{ text: { content: defSummary } }] }
  }
  if (subjects?.length) {
    properties['과목'] = { multi_select: subjects.map(s => ({ name: s })) }
  }

  try {
    const resp = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: GLOSSARY_DB_ID },
        properties,
      }),
    })

    const data = await resp.json()
    if (data.object === 'page') {
      return { ok: true, id: data.id }
    }
    return { ok: false, error: data.message || JSON.stringify(data).slice(0, 100) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ── NISE 배치 실행 ────────────────────────────────────────────────
async function runNISE() {
  const slice = niseData.slice(START, END === Infinity ? undefined : END)
  const total = slice.length

  console.log(`NISE 삽입 시작: ${START}~${START + total} (총 ${total}개) ${DRY_RUN ? '[DRY RUN]' : ''}`)

  let ok = 0, fail = 0
  for (let i = 0; i < slice.length; i++) {
    const item = slice[i]
    const entry = {
      term_ko:    item.term_ko || '',
      term_hanja: item.term_hanja || null,
      term_en:    item.term_en || null,
      definition: item.definition || '',
      source:     'NISE',
      subjects:   termSubjectIndex.get(item.term_ko) || [],
      kice_freq:  kiceFreqMap[item.term_ko] || 0,
    }

    if (!entry.term_ko) { fail++; continue }

    const result = await insertEntry(entry)
    if (result.ok) ok++
    else { fail++; console.error(`  FAIL [${START + i}] ${item.term_ko}: ${result.error}`) }

    if ((i + 1) % 50 === 0) {
      console.log(`  진행: ${i + 1}/${total} (OK:${ok} FAIL:${fail})`)
    }

    if (!result.dry) await sleep(DELAY_MS)
  }

  console.log(`\n✅ 완료: OK=${ok} FAIL=${fail} / 총 ${total}`)
}

// ── KICE-only 배치 실행 ───────────────────────────────────────────
async function runKICE() {
  const niseSet = new Set(niseData.map(d => d.term_ko))

  const kiceOnly = Object.entries(kiceFreqMap)
    .filter(([kw, freq]) => !niseSet.has(kw) && freq >= FREQ_MIN)
    .sort(([, a], [, b]) => b - a)
    .slice(START, END === Infinity ? undefined : END)

  const total = kiceOnly.length
  console.log(`KICE-only 삽입 시작: 빈도 >= ${FREQ_MIN}, 총 ${total}개 ${DRY_RUN ? '[DRY RUN]' : ''}`)

  let ok = 0, fail = 0
  for (let i = 0; i < kiceOnly.length; i++) {
    const [kw, freq] = kiceOnly[i]
    const entry = {
      term_ko:    kw,
      term_hanja: null,
      term_en:    null,
      definition: '',
      source:     'KICE',
      subjects:   [],
      kice_freq:  freq,
    }

    const result = await insertEntry(entry)
    if (result.ok) ok++
    else { fail++; console.error(`  FAIL [${i}] ${kw}: ${result.error}`) }

    if ((i + 1) % 50 === 0) {
      console.log(`  진행: ${i + 1}/${total} (OK:${ok} FAIL:${fail})`)
    }

    if (!result.dry) await sleep(DELAY_MS)
  }

  console.log(`\n✅ 완료: OK=${ok} FAIL=${fail} / 총 ${total}`)
}

// ── 진입점 ────────────────────────────────────────────────────────
if (SOURCE === 'nise') {
  await runNISE()
} else if (SOURCE === 'kice') {
  await runKICE()
} else {
  console.error('❌ --source nise 또는 --source kice 필요')
  process.exit(1)
}
