import { getAvailableExams, getExam } from './kice'
import type { KiceExam } from '@/types/kice'

// ─── Types ───

export interface SubjectFrequency {
  subject: string
  yearCounts: Record<number, number>
  total: number
}

export interface KeywordFrequency {
  keyword: string
  count: number
  years: number[]
  subjects: string[]
  recentStreak: number      // 최근 연속 출제 횟수
  lastYear: number
}

export interface YearSummary {
  year: number
  session: string
  questionCount: number
  subjectDistribution: Record<string, number>
  typeDistribution: Record<string, number>
  avgPoints: number
}

export interface AnalyticsData {
  subjectFrequencies: SubjectFrequency[]
  topKeywords: KeywordFrequency[]
  neverTestedKeywords: string[]
  recentStreakKeywords: KeywordFrequency[]
  yearSummaries: YearSummary[]
  allYears: number[]
}

// ─── Analytics Engine ───

function loadOriginalExams(): Array<{ year: number; session: string; exam: KiceExam }> {
  const entries = getAvailableExams().filter((e) => !e.isIsomorphic && !e.isPredicted)
  const exams: Array<{ year: number; session: string; exam: KiceExam }> = []

  for (const entry of entries) {
    const exam = getExam(entry.year, entry.session)
    if (exam) exams.push({ year: entry.year, session: entry.session, exam })
  }

  return exams.sort((a, b) => a.year - b.year)
}

export function computeAnalytics(): AnalyticsData {
  const exams = loadOriginalExams()
  const allYears = Array.from(new Set(exams.map((e) => e.year))).sort()

  // 1. Subject frequency by year
  const subjectMap = new Map<string, Record<number, number>>()

  for (const { year, exam } of exams) {
    for (const q of exam.questions) {
      for (const subj of q.subjects) {
        const yearCounts = subjectMap.get(subj) ?? {}
        yearCounts[year] = (yearCounts[year] ?? 0) + 1
        subjectMap.set(subj, yearCounts)
      }
    }
  }

  const subjectFrequencies: SubjectFrequency[] = Array.from(subjectMap.entries())
    .map(([subject, yearCounts]) => ({
      subject,
      yearCounts,
      total: Object.values(yearCounts).reduce((a, b) => a + b, 0),
    }))
    .sort((a, b) => b.total - a.total)

  // 2. Keyword frequency
  const kwMap = new Map<string, { count: number; years: Set<number>; subjects: Set<string> }>()

  for (const { year, exam } of exams) {
    for (const q of exam.questions) {
      for (const kw of q.keywords ?? []) {
        const entry = kwMap.get(kw) ?? { count: 0, years: new Set(), subjects: new Set() }
        entry.count += 1
        entry.years.add(year)
        for (const s of q.subjects) entry.subjects.add(s)
        kwMap.set(kw, entry)
      }
    }
  }

  const allKeywordFreqs: KeywordFrequency[] = Array.from(kwMap.entries()).map(([keyword, data]) => {
    const sortedYears = Array.from(data.years).sort((a, b) => b - a)
    const lastYear = sortedYears[0] ?? 0

    // Calculate recent streak (consecutive years from latest)
    let recentStreak = 0
    for (let i = 0; i < sortedYears.length; i++) {
      if (i === 0 || sortedYears[i] === sortedYears[i - 1] - 1) {
        recentStreak++
      } else {
        break
      }
    }

    return {
      keyword,
      count: data.count,
      years: sortedYears,
      subjects: Array.from(data.subjects),
      recentStreak,
      lastYear,
    }
  })

  const topKeywords = [...allKeywordFreqs]
    .sort((a, b) => b.count - a.count)
    .slice(0, 30)

  // 3. Recent streak keywords (3+ consecutive years)
  const recentStreakKeywords = allKeywordFreqs
    .filter((kw) => kw.recentStreak >= 3)
    .sort((a, b) => b.recentStreak - a.recentStreak || b.count - a.count)

  // 4. Never-tested keywords (appeared only once, 5+ years ago)
  const latestYear = allYears[allYears.length - 1] ?? 2026
  const neverTestedKeywords = allKeywordFreqs
    .filter((kw) => kw.count === 1 && kw.lastYear <= latestYear - 5)
    .sort((a, b) => a.lastYear - b.lastYear)
    .slice(0, 20)
    .map((kw) => `${kw.keyword} (${kw.lastYear})`)

  // 5. Year summaries
  const yearSummaries: YearSummary[] = exams.map(({ year, session, exam }) => {
    const subjectDist: Record<string, number> = {}
    const typeDist: Record<string, number> = {}
    let totalPoints = 0

    for (const q of exam.questions) {
      for (const s of q.subjects) {
        subjectDist[s] = (subjectDist[s] ?? 0) + 1
      }
      typeDist[q.type] = (typeDist[q.type] ?? 0) + 1
      totalPoints += q.points
    }

    return {
      year,
      session,
      questionCount: exam.questions.length,
      subjectDistribution: subjectDist,
      typeDistribution: typeDist,
      avgPoints: totalPoints / exam.questions.length,
    }
  })

  return {
    subjectFrequencies,
    topKeywords,
    neverTestedKeywords,
    recentStreakKeywords,
    yearSummaries,
    allYears,
  }
}
