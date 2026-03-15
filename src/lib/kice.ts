import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import type { KiceExam, KiceQuestion, ExamEntry } from '@/types/kice'

const KICE_DIR = join(process.cwd(), 'data', 'kice-기출')

export function getAvailableExams(): ExamEntry[] {
  if (!existsSync(KICE_DIR)) return []

  const entries: ExamEntry[] = []

  const years = readdirSync(KICE_DIR)
    .filter(d => /^\d{4}$/.test(d))
    .map(Number)
    .sort((a, b) => b - a)

  for (const year of years) {
    const yearDir = join(KICE_DIR, String(year))
    const files = readdirSync(yearDir).filter(f => f.endsWith('.json'))

    for (const file of files) {
      const session = file.replace('.json', '')
      entries.push({
        year,
        session,
        filename: file,
        isIsomorphic: file.includes('동형'),
        isPredicted: file.includes('예상'),
      })
    }
  }

  return entries
}

export function getExam(year: number, session: string): KiceExam | null {
  const filePath = join(KICE_DIR, String(year), `${session}.json`)

  if (!existsSync(filePath)) return null

  try {
    const raw = readFileSync(filePath, 'utf-8')
    return JSON.parse(raw) as KiceExam
  } catch {
    return null
  }
}

/** Deterministically pick one KICE question based on date string (YYYY-MM-DD) */
export function getQuestionOfTheDay(dateStr: string): {
  question: KiceQuestion;
  year: number;
  session: string;
} | null {
  const entries = getAvailableExams().filter((e) => !e.isIsomorphic && !e.isPredicted)
  if (entries.length === 0) return null

  const allQuestions: Array<{ question: KiceQuestion; year: number; session: string }> = []
  for (const entry of entries) {
    const exam = getExam(entry.year, entry.session)
    if (!exam) continue
    for (const q of exam.questions) {
      allQuestions.push({ question: q, year: entry.year, session: entry.session })
    }
  }

  if (allQuestions.length === 0) return null

  // Simple deterministic hash from date string
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % allQuestions.length
  return allQuestions[index]
}

export function getAllKeywords(): string[] {
  const keywords = new Set<string>()
  const entries = getAvailableExams()

  for (const entry of entries) {
    const exam = getExam(entry.year, entry.session)
    if (!exam) continue

    for (const q of exam.questions) {
      for (const kw of q.keywords ?? []) {
        keywords.add(kw)
      }
    }
  }

  return Array.from(keywords).sort()
}

