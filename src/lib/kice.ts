import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'
import type { KiceExam, ExamEntry } from '@/types/kice'

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

