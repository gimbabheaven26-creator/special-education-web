#!/usr/bin/env node
/**
 * 기출 키워드 → 플래시카드 데이터 자동 생성
 *
 * 343개 키워드 사전에서 플래시카드(앞: 키워드, 뒤: 정의+기출 연도) 자동 생성.
 * 3개 서비스(special-education-web, edumind, gosari) 공통 활용 가능.
 *
 * 사용법: node scripts/generate-flashcards.mjs [--min-freq 2] [--output <경로>]
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'

const args = process.argv.slice(2)
function getFlag(name, def) {
  const idx = args.indexOf(name)
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : def
}

const MIN_FREQ = Number(getFlag('--min-freq', '2'))
const OUTPUT = getFlag('--output', 'data/flashcards/kice-keywords.json')

// ─── 키워드 사전 로드 ───────────────────────────────────
const kwData = JSON.parse(readFileSync('docs/kice-keyword-data.json', 'utf-8'))
const weightData = (() => {
  try {
    return JSON.parse(readFileSync('docs/kice-keyword-weight-data.json', 'utf-8'))
  } catch { return null }
})()

// ─── 기출 JSON에서 키워드별 과목/맥락 수집 ──────────────
const BASE = 'data/kice-기출'
const years = readdirSync(BASE).filter(f => !f.startsWith('.'))

const kwMeta = {} // keyword → { years: Set, subjects: Set, contexts: string[] }

for (const year of years) {
  const dir = join(BASE, year)
  for (const file of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const data = JSON.parse(readFileSync(join(dir, file), 'utf-8'))
    for (const q of data.questions) {
      for (const kw of (q.keywords || [])) {
        if (!kwMeta[kw]) kwMeta[kw] = { years: new Set(), subjects: new Set(), contexts: [] }
        kwMeta[kw].years.add(data.exam.year)
        for (const s of (q.subjects || [])) kwMeta[kw].subjects.add(s)
        if (q.context && kwMeta[kw].contexts.length < 3) {
          kwMeta[kw].contexts.push(q.context.substring(0, 100))
        }
      }
    }
  }
}

// ─── 키워드 정의 사전 ────────────────────────────────────
// 주요 키워드에 대한 간결한 정의 (플래시카드 뒷면용)
const DEFINITIONS = {
  // 장애 유형
  '자폐성장애': '사회적 의사소통과 상호작용의 결함, 제한적·반복적 행동·관심·활동을 핵심 특성으로 하는 신경발달장애 (DSM-5)',
  '지적장애': '지적 기능과 적응행동 모두에서 유의미한 제한을 보이며, 발달기(18세 이전)에 발현되는 장애 (AAIDD)',
  '학습장애': '읽기, 쓰기, 수학 등 특정 학업 기술의 습득과 사용에 어려움을 보이는 장애. 지적장애, 감각장애 등에 의한 것은 제외',
  '뇌성마비': '발달 중인 뇌의 비진행성 손상으로 인한 운동 및 자세의 장애. 경직형, 불수의운동형, 실조형 등으로 분류',
  '청각장애': '청력 손실로 인해 음성언어를 통한 의사소통이 어려운 상태. 전음성, 감각신경성, 혼합성으로 분류',
  '시각장애': '시각 기능의 현저한 저하 또는 상실. 맹(시력 0.04 이하)과 저시력(0.04~0.3)으로 구분',
  '건강장애': '만성질환으로 3개월 이상의 장기입원 또는 통원치료가 필요하여 학교생활이 어려운 상태',
  '중복장애': '두 가지 이상의 장애가 중복되어 나타나는 상태. 교육적 요구가 복합적',

  // 교육과정/교수법
  '교육과정': '교육 목표 달성을 위해 조직된 학습 경험의 총체. 공통교육과정, 선택중심교육과정, 기본교육과정으로 구분',
  '교수적 수정': '일반교육과정을 특수교육대상자의 요구에 맞게 수정하는 것. 교수환경, 교수내용, 교수방법, 평가방법 수정',
  '보편적학습설계': 'UDL. 다양한 학습자를 위해 처음부터 유연한 교육과정을 설계하는 접근. 표상, 행동/표현, 참여의 3원칙',
  '통합교육': '장애학생과 비장애학생이 함께 일반학교에서 교육받는 것. 물리적·사회적·교수적 통합',
  '통합학급': '특수교육대상자와 일반학생이 함께 편성된 학급',
  '협력교수': '일반교사와 특수교사가 함께 수업을 계획하고 실행하는 교수 방법. 6가지 유형 (교수-관찰, 스테이션, 평행, 대안적, 팀교수 등)',
  '삽입교수': '일과 활동 중에 IEP 목표를 자연스럽게 삽입하여 지도하는 방법',

  // 행동지원
  '강화': '행동의 빈도를 증가시키는 자극의 제시(정적 강화) 또는 제거(부적 강화)',
  '긍정적행동지원': 'PBS. 문제행동의 기능을 이해하고, 환경 수정과 대체행동 교수를 통해 삶의 질을 향상시키는 체계적 접근',
  'FBA': '기능행동분석. 문제행동의 선행사건-행동-후속결과를 분석하여 행동의 기능(목적)을 파악하는 절차',
  'DRL': '차별강화. 저빈도 행동의 차별강화. 전체회기, 간격, 간격반응의 3유형',

  // 진단/평가
  'RTI': '중재반응모델. 3단계(보편적 교수 → 소그룹 중재 → 개별 집중 중재)로 학습장애를 조기 선별·중재',
  'CBM': '교육과정중심측정. 교육과정에서 추출한 자료로 학생의 진전도를 반복 측정하는 방법',
  '적응행동': '일상생활에서 기능하는 데 필요한 행동. 개념적, 사회적, 실제적 적응행동으로 구분',

  // 의사소통
  'AAC': '보완대체의사소통. 구어 사용이 어려운 사람이 의사소통하기 위해 사용하는 비구어적 방법과 도구',
  '의사소통': '생각, 감정, 정보를 전달하고 수용하는 과정. 구어, 비구어, 보완대체 의사소통 포함',
  'EMT': '강화된 환경중심 언어중재. 자연스러운 환경에서 아동의 관심사를 활용하여 언어를 촉진하는 방법',

  // 시각장애
  '점자': '촉각을 이용하여 읽고 쓰는 문자 체계. 6점 점자(브라이유)가 표준',
  '보행훈련': '시각장애인이 독립적으로 이동할 수 있도록 지도하는 것. 안내보행, 흰지팡이 기법, 방향정위 포함',

  // 청각장애
  '보청기': '잔존청력을 증폭하여 소리를 듣도록 도와주는 전자 기기. BTE, RIC, ITE 등 유형',
  '인공와우': '고도 이상 난청인에게 소리를 전기 신호로 변환하여 청신경을 자극하는 장치',
  '수어': '시각-공간적 체계를 사용하는 자연어. 한국수어는 한국어와 다른 독립된 문법 체계',

  // 전환교육
  '자기결정': '자신의 삶에 대한 주도적 행위자로서의 능력. 자율성, 자기조절, 심리적 역능, 자기실현의 4가지 본질적 특성 (Wehmeyer)',
  '전환교육': '학교에서 학교 밖 성인 생활로의 전환을 준비하는 교육. 직업교육, 지역사회 기술, 자기결정 포함',
  '지원고용': '경쟁고용이 어려운 장애인에게 직무코치 등의 지원을 제공하여 일반 작업장에서 일할 수 있게 하는 제도',

  // 법령
  '특수교육법': '장애인 등에 대한 특수교육법. 특수교육대상자의 교육을 위한 국가 및 지방자치단체의 의무 규정',
  '개별화교육계획': 'IEP. 특수교육대상자 개인의 능력과 요구에 적합한 교육목표, 내용, 방법, 평가를 담은 계획',
  '순회교육': '특수교육교원이 학교, 의료기관, 가정 등을 직접 방문하여 실시하는 교육',
  '특수교육지원센터': '특수교육대상자의 진단·평가, 교육지원, 관련서비스 등을 담당하는 기관',

  // 기타
  'DSM-5': '정신장애의 진단 및 통계 편람 제5판. 자폐스펙트럼장애, 지적장애 등의 진단 기준 제시',
  'GMFCS': '대운동기능분류체계. 뇌성마비 아동의 이동 능력을 I~V 수준으로 분류',
  'AAIDD': '미국 지적장애 및 발달장애 협회. 지적장애의 정의와 분류 체계를 제시',
}

// ─── 플래시카드 생성 ─────────────────────────────────────
const flashcards = []

for (const [kw, meta] of Object.entries(kwMeta)) {
  const yearList = Array.from(meta.years).sort()
  const freq = yearList.length

  // 최소 빈도 필터
  if (freq < MIN_FREQ) continue

  const subjects = Array.from(meta.subjects)
  const definition = DEFINITIONS[kw] || `${kw}에 대한 정의 (TODO: 추가 필요)`

  // 가중치 정보 (있으면)
  let weight = null
  if (weightData) {
    const wEntry = weightData.compositeScores?.find(k => k.keyword === kw)
    if (wEntry) weight = wEntry.composite
  }

  flashcards.push({
    id: `fc-kice-${kw.replace(/[^a-zA-Z0-9가-힣]/g, '-').toLowerCase()}`,
    front: kw,
    back: definition,
    tags: subjects,
    metadata: {
      source: 'kice',
      frequency: freq,
      years: yearList,
      firstAppeared: yearList[0],
      lastAppeared: yearList[yearList.length - 1],
      consecutiveYears: countConsecutive(yearList),
      weight: weight ? Math.round(weight * 100) / 100 : null,
    },
  })
}

function countConsecutive(years) {
  let maxStreak = 1, current = 1
  for (let i = 1; i < years.length; i++) {
    if (years[i] === years[i - 1] + 1) {
      current++
      maxStreak = Math.max(maxStreak, current)
    } else {
      current = 1
    }
  }
  return maxStreak
}

// 가중치 순 정렬
flashcards.sort((a, b) => (b.metadata.weight || 0) - (a.metadata.weight || 0))

// ─── 출력 ────────────────────────────────────────────────
const outputDir = OUTPUT.substring(0, OUTPUT.lastIndexOf('/'))
import { mkdirSync, existsSync } from 'fs'
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true })

const result = {
  _meta: {
    description: 'KICE 기출 키워드 기반 플래시카드 데이터',
    generated: new Date().toISOString(),
    minFrequency: MIN_FREQ,
    totalCards: flashcards.length,
    withDefinition: flashcards.filter(fc => !fc.back.includes('TODO')).length,
    needsDefinition: flashcards.filter(fc => fc.back.includes('TODO')).length,
  },
  cards: flashcards,
}

writeFileSync(OUTPUT, JSON.stringify(result, null, 2), 'utf-8')

// Stats
const withDef = flashcards.filter(fc => !fc.back.includes('TODO')).length
const needsDef = flashcards.filter(fc => fc.back.includes('TODO')).length

console.log(`✅ 플래시카드 생성 완료`)
console.log(`   출력: ${OUTPUT}`)
console.log(`   총 카드: ${flashcards.length}장`)
console.log(`   정의 완성: ${withDef}장`)
console.log(`   정의 필요: ${needsDef}장 (TODO 표시)`)
console.log(`   최소 빈도: ${MIN_FREQ}년 이상 출현`)
console.log('')
console.log('TOP 10 (가중치 순):')
for (const fc of flashcards.slice(0, 10)) {
  console.log(`  ${fc.front} (가중치: ${fc.metadata.weight || '-'}, ${fc.metadata.frequency}년 출현)`)
}
