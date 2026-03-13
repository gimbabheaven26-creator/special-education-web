/**
 * KICE 특수교육 임용고시 키워드 가중치 분석 스크립트
 *
 * 4차원 가중치 모델:
 * 1. 빈도 점수 (Frequency)     - 연도별 출현 횟수 정규화
 * 2. 배점 가중치 (Point Weight) - 문항 배점 반영 (2점 vs 4점)
 * 3. 연속성 점수 (Continuity)   - 연속 출현 연수
 * 4. 최근성 감쇠 (Recency)      - 최근 연도일수록 높은 가중치
 *
 * 종합 점수 = 0.25F + 0.30P + 0.25C + 0.20R
 *
 * Usage: node scripts/kice-keyword-weight.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = path.join(__dirname, '..', 'docs')

// ─── 데이터 로드 ───
const keywordData = JSON.parse(
  fs.readFileSync(path.join(DOCS_DIR, 'kice-keyword-data.json'), 'utf-8')
)
const questionKeywordData = JSON.parse(
  fs.readFileSync(path.join(DOCS_DIR, 'kice-question-keyword-data.json'), 'utf-8')
)

const YEARS = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026]
const LATEST_YEAR = 2026
const DECAY_RATE = 0.85 // 최근성 감쇠율

// ─── 가중치 비율 ───
const WEIGHTS = {
  frequency: 0.25,
  pointWeight: 0.30,
  continuity: 0.25,
  recency: 0.20,
}

// ─── 1. 빈도 점수 계산 ───
function calcFrequencyScores(yearlyData) {
  const totalFreq = {} // keyword → total count across all years

  for (const year of YEARS) {
    const data = yearlyData[String(year)]
    if (!data) continue
    for (const [kw, count] of Object.entries(data.keywordCounts)) {
      totalFreq[kw] = (totalFreq[kw] || 0) + count
    }
  }

  const maxFreq = Math.max(...Object.values(totalFreq))

  return Object.fromEntries(
    Object.entries(totalFreq).map(([kw, freq]) => [kw, freq / maxFreq])
  )
}

// ─── 2. 배점 가중치 계산 ───
function calcPointWeightScores(questions) {
  const pointScores = {} // keyword → weighted point sum

  for (const q of questions) {
    for (const { keyword, count } of q.keywords) {
      pointScores[keyword] = (pointScores[keyword] || 0) + count * q.points
    }
  }

  const maxPoints = Math.max(...Object.values(pointScores))

  return Object.fromEntries(
    Object.entries(pointScores).map(([kw, pts]) => [kw, pts / maxPoints])
  )
}

// ─── 3. 연속성 점수 계산 ───
function calcContinuityScores(yearlyData) {
  const yearPresence = {} // keyword → Set of years

  for (const year of YEARS) {
    const data = yearlyData[String(year)]
    if (!data) continue
    for (const kw of Object.keys(data.keywordCounts)) {
      if (!yearPresence[kw]) yearPresence[kw] = new Set()
      yearPresence[kw].add(year)
    }
  }

  const continuityScores = {}

  for (const [kw, years] of Object.entries(yearPresence)) {
    // 최근 연도에서부터 역순으로 연속 출현 연수 계산
    let streak = 0
    for (let y = LATEST_YEAR; y >= 2016; y--) {
      if (years.has(y)) {
        streak++
      } else {
        break
      }
    }

    // 전체 출현 연도 수도 고려 (가중 평균)
    const totalYears = years.size
    // 연속성 = 0.6 × (최근 연속 스트릭) + 0.4 × (전체 출현 연도 수)
    const rawScore = 0.6 * (streak / YEARS.length) + 0.4 * (totalYears / YEARS.length)
    continuityScores[kw] = rawScore
  }

  // 정규화
  const maxCont = Math.max(...Object.values(continuityScores))
  return Object.fromEntries(
    Object.entries(continuityScores).map(([kw, s]) => [kw, s / maxCont])
  )
}

// ─── 4. 최근성 감쇠 점수 계산 ───
function calcRecencyScores(yearlyData) {
  const recencyScores = {} // keyword → weighted recency sum

  for (const year of YEARS) {
    const data = yearlyData[String(year)]
    if (!data) continue
    const decay = Math.pow(DECAY_RATE, LATEST_YEAR - year)

    for (const [kw, count] of Object.entries(data.keywordCounts)) {
      recencyScores[kw] = (recencyScores[kw] || 0) + count * decay
    }
  }

  const maxRecency = Math.max(...Object.values(recencyScores))

  return Object.fromEntries(
    Object.entries(recencyScores).map(([kw, s]) => [kw, s / maxRecency])
  )
}

// ─── 5. 종합 점수 계산 ───
function calcCompositeScores(freqScores, pointScores, contScores, recencyScores) {
  const allKeywords = new Set([
    ...Object.keys(freqScores),
    ...Object.keys(pointScores),
    ...Object.keys(contScores),
    ...Object.keys(recencyScores),
  ])

  const results = []

  for (const kw of allKeywords) {
    const f = freqScores[kw] || 0
    const p = pointScores[kw] || 0
    const c = contScores[kw] || 0
    const r = recencyScores[kw] || 0

    const composite =
      WEIGHTS.frequency * f +
      WEIGHTS.pointWeight * p +
      WEIGHTS.continuity * c +
      WEIGHTS.recency * r

    results.push({
      keyword: kw,
      composite: Math.round(composite * 10000) / 10000,
      frequency: Math.round(f * 10000) / 10000,
      pointWeight: Math.round(p * 10000) / 10000,
      continuity: Math.round(c * 10000) / 10000,
      recency: Math.round(r * 10000) / 10000,
    })
  }

  return results.sort((a, b) => b.composite - a.composite)
}

// ─── 6. 연도별 추세 분석 ───
function calcYearlyTrend(yearlyData) {
  const trends = {} // keyword → { slope, direction }

  const allKeywords = new Set()
  for (const year of YEARS) {
    const data = yearlyData[String(year)]
    if (!data) continue
    for (const kw of Object.keys(data.keywordCounts)) {
      allKeywords.add(kw)
    }
  }

  for (const kw of allKeywords) {
    const points = YEARS.map((y, i) => {
      const data = yearlyData[String(y)]
      const count = data?.keywordCounts?.[kw] || 0
      return { x: i, y: count }
    })

    // 단순 선형 회귀
    const n = points.length
    const sumX = points.reduce((s, p) => s + p.x, 0)
    const sumY = points.reduce((s, p) => s + p.y, 0)
    const sumXY = points.reduce((s, p) => s + p.x * p.y, 0)
    const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0)

    const denominator = n * sumX2 - sumX * sumX
    const slope = denominator !== 0
      ? (n * sumXY - sumX * sumY) / denominator
      : 0

    let direction = '→ 안정'
    if (slope > 0.3) direction = '↑ 상승'
    else if (slope > 0.1) direction = '↗ 소폭 상승'
    else if (slope < -0.3) direction = '↓ 하락'
    else if (slope < -0.1) direction = '↘ 소폭 하락'

    trends[kw] = {
      slope: Math.round(slope * 1000) / 1000,
      direction,
    }
  }

  return trends
}

// ─── 7. 2027 출현 확률 예측 ───
function predict2027(yearlyData, compositeScores) {
  const yearPresence = {}
  for (const year of YEARS) {
    const data = yearlyData[String(year)]
    if (!data) continue
    for (const kw of Object.keys(data.keywordCounts)) {
      if (!yearPresence[kw]) yearPresence[kw] = new Set()
      yearPresence[kw].add(year)
    }
  }

  return compositeScores.map((entry) => {
    const years = yearPresence[entry.keyword] || new Set()
    const in2025 = years.has(2025)
    const in2026 = years.has(2026)

    // 기본 확률: 종합 점수 기반
    let probability = entry.composite * 0.6

    // 2년 연속 출현 보너스 (75.8% 실증 데이터)
    if (in2025 && in2026) {
      probability = Math.max(probability, 0.758)
      probability = Math.min(probability + 0.15, 1.0)
    }
    // 2026년만 출현 (복귀 가능성)
    else if (in2026 && !in2025) {
      probability += 0.10
    }
    // 둘 다 없으면 감소
    else if (!in2025 && !in2026) {
      probability *= 0.3
    }

    // 개근 키워드 보너스
    if (years.size >= 10) {
      probability = Math.max(probability, 0.90)
    }

    return {
      ...entry,
      in2025,
      in2026,
      consecutiveYears: (() => {
        let streak = 0
        for (let y = LATEST_YEAR; y >= 2016; y--) {
          if (years.has(y)) streak++
          else break
        }
        return streak
      })(),
      totalYears: years.size,
      probability2027: Math.min(Math.round(probability * 1000) / 1000, 1.0),
    }
  }).sort((a, b) => b.probability2027 - a.probability2027)
}

// ─── 8. 배점별 키워드 클러스터 ───
function calcPointCluster(questions) {
  const clusters = {
    fillIn2pt: {},   // 기입형 2점
    essay4pt: {},    // 서술형 4점
  }

  for (const q of questions) {
    const bucket = q.points <= 2 ? 'fillIn2pt' : 'essay4pt'
    for (const { keyword, count } of q.keywords) {
      clusters[bucket][keyword] = (clusters[bucket][keyword] || 0) + count
    }
  }

  return clusters
}

// ─── 보고서 생성 ───
function generateReport(compositeScores, trends, predictions, clusters) {
  const lines = []

  lines.push('# KICE 키워드 가중치 분석 보고서')
  lines.push('')
  lines.push(`> 분석 일자: ${new Date().toISOString().slice(0, 10)}`)
  lines.push('> 모델: 4차원 가중치 (빈도 0.25 + 배점 0.30 + 연속성 0.25 + 최근성 0.20)')
  lines.push(`> 최근성 감쇠율: ${DECAY_RATE}^(2026-year)`)
  lines.push('')

  // ─── TOP 50 종합 점수 ───
  lines.push('## 1. 종합 가중치 점수 TOP 50')
  lines.push('')
  lines.push('| 순위 | 키워드 | 종합 | 빈도 | 배점 | 연속성 | 최근성 | 추세 |')
  lines.push('|:----:|--------|:----:|:----:|:----:|:-----:|:-----:|------|')

  const top50 = compositeScores.slice(0, 50)
  top50.forEach((entry, i) => {
    const trend = trends[entry.keyword] || { direction: '-' }
    lines.push(
      `| ${i + 1} | ${entry.keyword} | **${entry.composite}** | ${entry.frequency} | ${entry.pointWeight} | ${entry.continuity} | ${entry.recency} | ${trend.direction} |`
    )
  })

  // ─── 차원별 TOP 20 ───
  lines.push('')
  lines.push('## 2. 차원별 TOP 20')
  lines.push('')

  const dimensions = [
    { key: 'frequency', label: '빈도 점수 (총 출현 횟수 정규화)' },
    { key: 'pointWeight', label: '배점 가중치 (문항 배점 × 출현 반영)' },
    { key: 'continuity', label: '연속성 점수 (최근 연속 스트릭 + 전체 출현 연도)' },
    { key: 'recency', label: '최근성 점수 (0.85^(2026-year) 감쇠)' },
  ]

  for (const dim of dimensions) {
    lines.push(`### 2.${dimensions.indexOf(dim) + 1} ${dim.label}`)
    lines.push('')
    lines.push('| 순위 | 키워드 | 점수 |')
    lines.push('|:----:|--------|:----:|')

    const sorted = [...compositeScores].sort((a, b) => b[dim.key] - a[dim.key])
    sorted.slice(0, 20).forEach((entry, i) => {
      lines.push(`| ${i + 1} | ${entry.keyword} | ${entry[dim.key]} |`)
    })
    lines.push('')
  }

  // ─── 추세 분석 ───
  lines.push('## 3. 추세 분석 (선형 회귀)')
  lines.push('')

  lines.push('### 3.1 급상승 키워드 (slope > 0.3)')
  lines.push('')
  lines.push('| 키워드 | 기울기 | 추세 | 종합 점수 |')
  lines.push('|--------|:-----:|------|:--------:|')

  const rising = Object.entries(trends)
    .filter(([, t]) => t.slope > 0.3)
    .sort((a, b) => b[1].slope - a[1].slope)

  for (const [kw, t] of rising) {
    const score = compositeScores.find((e) => e.keyword === kw)
    lines.push(`| ${kw} | ${t.slope} | ${t.direction} | ${score?.composite || '-'} |`)
  }

  lines.push('')
  lines.push('### 3.2 하락 키워드 (slope < -0.1)')
  lines.push('')
  lines.push('| 키워드 | 기울기 | 추세 | 종합 점수 |')
  lines.push('|--------|:-----:|------|:--------:|')

  const falling = Object.entries(trends)
    .filter(([, t]) => t.slope < -0.1)
    .sort((a, b) => a[1].slope - b[1].slope)

  for (const [kw, t] of falling) {
    const score = compositeScores.find((e) => e.keyword === kw)
    lines.push(`| ${kw} | ${t.slope} | ${t.direction} | ${score?.composite || '-'} |`)
  }

  // ─── 2027 예측 ───
  lines.push('')
  lines.push('## 4. 2027 출현 확률 예측 TOP 50')
  lines.push('')
  lines.push('> 기반: 종합 점수 + 2년 연속 출현 보너스(75.8%) + 개근 보너스')
  lines.push('')
  lines.push('| 순위 | 키워드 | 확률 | 2025 | 2026 | 연속 | 총 연도 | 종합 |')
  lines.push('|:----:|--------|:----:|:----:|:----:|:----:|:------:|:----:|')

  predictions.slice(0, 50).forEach((p, i) => {
    const y25 = p.in2025 ? '✅' : '❌'
    const y26 = p.in2026 ? '✅' : '❌'
    lines.push(
      `| ${i + 1} | ${p.keyword} | **${(p.probability2027 * 100).toFixed(1)}%** | ${y25} | ${y26} | ${p.consecutiveYears}년 | ${p.totalYears}/11 | ${p.composite} |`
    )
  })

  // ─── 배점별 클러스터 ───
  lines.push('')
  lines.push('## 5. 배점별 키워드 클러스터')
  lines.push('')

  lines.push('### 5.1 기입형 (2점) 다빈출 키워드 TOP 30')
  lines.push('')
  lines.push('| 순위 | 키워드 | 누적 출현 |')
  lines.push('|:----:|--------|:--------:|')

  const fillInSorted = Object.entries(clusters.fillIn2pt)
    .sort((a, b) => b[1] - a[1])

  fillInSorted.slice(0, 30).forEach(([kw, count], i) => {
    lines.push(`| ${i + 1} | ${kw} | ${count} |`)
  })

  lines.push('')
  lines.push('### 5.2 서술형 (4점) 다빈출 키워드 TOP 30')
  lines.push('')
  lines.push('| 순위 | 키워드 | 누적 출현 |')
  lines.push('|:----:|--------|:--------:|')

  const essaySorted = Object.entries(clusters.essay4pt)
    .sort((a, b) => b[1] - a[1])

  essaySorted.slice(0, 30).forEach(([kw, count], i) => {
    lines.push(`| ${i + 1} | ${kw} | ${count} |`)
  })

  // ─── 서술형 → 기입형 전이 패턴 ───
  lines.push('')
  lines.push('## 6. 서술형 ↔ 기입형 교차 분석')
  lines.push('')
  lines.push('> 서술형에만 등장하는 키워드 = 기입형 출제 잠재 후보')
  lines.push('')

  const fillInSet = new Set(Object.keys(clusters.fillIn2pt))
  const essaySet = new Set(Object.keys(clusters.essay4pt))

  const essayOnly = [...essaySet]
    .filter((kw) => !fillInSet.has(kw))
    .map((kw) => ({ keyword: kw, count: clusters.essay4pt[kw] }))
    .sort((a, b) => b.count - a.count)

  lines.push('### 6.1 서술형에만 등장 (기입형 전환 후보)')
  lines.push('')
  lines.push('| 키워드 | 서술형 출현 |')
  lines.push('|--------|:--------:|')

  essayOnly.slice(0, 20).forEach(({ keyword, count }) => {
    lines.push(`| ${keyword} | ${count} |`)
  })

  const fillInOnly = [...fillInSet]
    .filter((kw) => !essaySet.has(kw))
    .map((kw) => ({ keyword: kw, count: clusters.fillIn2pt[kw] }))
    .sort((a, b) => b.count - a.count)

  lines.push('')
  lines.push('### 6.2 기입형에만 등장 (서술형 전환 후보)')
  lines.push('')
  lines.push('| 키워드 | 기입형 출현 |')
  lines.push('|--------|:--------:|')

  fillInOnly.slice(0, 20).forEach(({ keyword, count }) => {
    lines.push(`| ${keyword} | ${count} |`)
  })

  // ─── 핵심 인사이트 ───
  lines.push('')
  lines.push('## 7. 핵심 인사이트')
  lines.push('')

  // 개근 키워드
  const allTimers = predictions.filter((p) => p.totalYears >= 10)
  lines.push(`### 7.1 개근/준개근 키워드 (10~11년 출현): ${allTimers.length}개`)
  lines.push('')
  allTimers.forEach((p) => {
    lines.push(`- **${p.keyword}** — ${p.totalYears}/11년, 종합 ${p.composite}, 2027 확률 ${(p.probability2027 * 100).toFixed(1)}%`)
  })

  // 급부상 키워드
  lines.push('')
  lines.push('### 7.2 급부상 키워드 (상승 추세 + 2026 출현)')
  lines.push('')
  const emergingKws = rising
    .filter(([kw]) => {
      const pred = predictions.find((p) => p.keyword === kw)
      return pred?.in2026
    })
    .slice(0, 15)

  emergingKws.forEach(([kw, t]) => {
    const pred = predictions.find((p) => p.keyword === kw)
    lines.push(`- **${kw}** — 기울기 ${t.slope}, 종합 ${pred?.composite}, 2027 확률 ${((pred?.probability2027 || 0) * 100).toFixed(1)}%`)
  })

  // 고위험 사각지대
  lines.push('')
  lines.push('### 7.3 고위험 사각지대 (높은 점수 but 최근 미출현)')
  lines.push('')
  const blindSpots = compositeScores
    .filter((e) => {
      const pred = predictions.find((p) => p.keyword === e.keyword)
      return e.composite > 0.15 && !pred?.in2026
    })
    .slice(0, 15)

  blindSpots.forEach((e) => {
    const pred = predictions.find((p) => p.keyword === e.keyword)
    const trend = trends[e.keyword]
    lines.push(`- **${e.keyword}** — 종합 ${e.composite}, ${pred?.totalYears}/11년, 추세 ${trend?.direction}, 2027 확률 ${((pred?.probability2027 || 0) * 100).toFixed(1)}%`)
  })

  return lines.join('\n')
}

// ─── MAIN ───
function main() {
  console.log('🔬 KICE 키워드 가중치 분석 시작...')

  const { yearlyData } = keywordData

  console.log('  [1/6] 빈도 점수 계산...')
  const freqScores = calcFrequencyScores(yearlyData)

  console.log('  [2/6] 배점 가중치 계산...')
  const pointScores = calcPointWeightScores(questionKeywordData)

  console.log('  [3/6] 연속성 점수 계산...')
  const contScores = calcContinuityScores(yearlyData)

  console.log('  [4/6] 최근성 감쇠 점수 계산...')
  const recencyScores = calcRecencyScores(yearlyData)

  console.log('  [5/6] 종합 점수 + 2027 예측...')
  const compositeScores = calcCompositeScores(freqScores, pointScores, contScores, recencyScores)
  const trends = calcYearlyTrend(yearlyData)
  const predictions = predict2027(yearlyData, compositeScores)
  const clusters = calcPointCluster(questionKeywordData)

  console.log('  [6/6] 보고서 생성...')
  const report = generateReport(compositeScores, trends, predictions, clusters)

  // 보고서 저장
  fs.writeFileSync(
    path.join(DOCS_DIR, 'kice-keyword-weight-analysis.md'),
    report,
    'utf-8'
  )
  console.log('  → docs/kice-keyword-weight-analysis.md 저장 완료')

  // JSON 데이터 저장
  const jsonOutput = {
    generatedAt: new Date().toISOString(),
    model: {
      weights: WEIGHTS,
      decayRate: DECAY_RATE,
      description: '4차원 가중치: 빈도(0.25) + 배점(0.30) + 연속성(0.25) + 최근성(0.20)',
    },
    compositeScores,
    predictions: predictions.slice(0, 100),
    clusters,
    trends,
  }

  fs.writeFileSync(
    path.join(DOCS_DIR, 'kice-keyword-weight-data.json'),
    JSON.stringify(jsonOutput, null, 2),
    'utf-8'
  )
  console.log('  → docs/kice-keyword-weight-data.json 저장 완료')

  // 요약 출력
  console.log('')
  console.log('═══ 분석 요약 ═══')
  console.log(`총 키워드: ${compositeScores.length}개`)
  console.log('')
  console.log('TOP 10 종합 점수:')
  compositeScores.slice(0, 10).forEach((e, i) => {
    const pred = predictions.find((p) => p.keyword === e.keyword)
    console.log(`  ${i + 1}. ${e.keyword} — 종합 ${e.composite} (2027 확률: ${((pred?.probability2027 || 0) * 100).toFixed(1)}%)`)
  })
  console.log('')
  console.log('TOP 10 2027 출현 확률:')
  predictions.slice(0, 10).forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.keyword} — ${(p.probability2027 * 100).toFixed(1)}% (연속 ${p.consecutiveYears}년, 총 ${p.totalYears}/11)`)
  })

  console.log('')
  console.log('✅ 가중치 분석 완료!')
}

main()
