import { getAvailableExams, getExam } from './kice'
import { getConceptsForSubject } from '@/lib/content/concepts'
import { SLUG_TO_CONCEPTS_FOLDER } from '@/lib/content/concept-urls'
import type { KiceQuestion } from '@/types/kice'

// ─── Types ───

export interface ConceptLink {
  subject: string       // 한글 폴더명 (URL용)
  slug: string          // concept slug
  title: string         // concept 제목
  matchedKeywords: string[]
}

export interface KiceRef {
  year: number
  session: string
  questionNumber: number
  matchedKeywords: string[]
}

// ─── Internal index (lazy, module-level cache) ───

interface ConceptEntry {
  subject: string
  slug: string
  title: string
  subjectSlug: string
  keywords: string[]       // lowercase
  keywordsRaw: string[]    // original
}

let conceptIndex: ConceptEntry[] | null = null

function buildConceptIndex(): ConceptEntry[] {
  if (conceptIndex) return conceptIndex

  const entries: ConceptEntry[] = []

  for (const [slug, folder] of Object.entries(SLUG_TO_CONCEPTS_FOLDER)) {
    const concepts = getConceptsForSubject(slug)
    for (const c of concepts) {
      entries.push({
        subject: folder,
        slug: c.slug,
        title: c.title,
        subjectSlug: slug,
        keywords: c.kiceKeywords.map(kw => kw.toLowerCase()),
        keywordsRaw: c.kiceKeywords,
      })
    }
  }

  conceptIndex = entries
  return entries
}

// ─── Forward: 기출문제 → 관련 개념 ───

export function getConceptLinksForQuestion(question: KiceQuestion): ConceptLink[] {
  const index = buildConceptIndex()
  const qKeywords = question.keywords.map(kw => kw.toLowerCase())

  if (qKeywords.length === 0) return []

  // subject 필터: question.subjects에 해당하는 concept만 후보
  const subjectSet = new Set(question.subjects)

  const scored: Array<{ entry: ConceptEntry; matchedKeywords: string[]; score: number }> = []

  for (const entry of index) {
    if (!subjectSet.has(entry.subjectSlug)) continue

    const matched: string[] = []
    for (const qkw of qKeywords) {
      for (let i = 0; i < entry.keywords.length; i++) {
        if (entry.keywords[i].includes(qkw) || qkw.includes(entry.keywords[i])) {
          matched.push(question.keywords[qKeywords.indexOf(qkw)])
          break
        }
      }
    }

    if (matched.length > 0) {
      scored.push({ entry, matchedKeywords: Array.from(new Set(matched)), score: matched.length })
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ entry, matchedKeywords }) => ({
      subject: entry.subject,
      slug: entry.slug,
      title: entry.title,
      matchedKeywords,
    }))
}

// ─── Reverse: 개념 → 관련 기출 ───

interface ExamCache {
  year: number
  session: string
  questions: KiceQuestion[]
}

let examCache: ExamCache[] | null = null

function loadOriginalExams(): ExamCache[] {
  if (examCache) return examCache

  const entries = getAvailableExams().filter(e => !e.isIsomorphic && !e.isPredicted)
  const exams: ExamCache[] = []

  for (const entry of entries) {
    const exam = getExam(entry.year, entry.session)
    if (exam) {
      exams.push({ year: entry.year, session: entry.session, questions: exam.questions })
    }
  }

  examCache = exams
  return exams
}

export function getKiceRefsForConcept(subjectFolder: string, slug: string): KiceRef[] {
  const index = buildConceptIndex()
  const concept = index.find(e => e.subject === subjectFolder && e.slug === slug)
  if (!concept || concept.keywords.length === 0) return []

  const exams = loadOriginalExams()
  const refs: KiceRef[] = []

  for (const exam of exams) {
    for (const q of exam.questions) {
      if (!q.subjects.includes(concept.subjectSlug)) continue

      const qKeywords = q.keywords.map(kw => kw.toLowerCase())
      const matched: string[] = []

      for (const qkw of qKeywords) {
        for (const ckw of concept.keywords) {
          if (ckw.includes(qkw) || qkw.includes(ckw)) {
            matched.push(q.keywords[qKeywords.indexOf(qkw)])
            break
          }
        }
      }

      if (matched.length > 0) {
        refs.push({
          year: exam.year,
          session: exam.session,
          questionNumber: q.number,
          matchedKeywords: Array.from(new Set(matched)),
        })
      }
    }
  }

  return refs.sort((a, b) => b.year - a.year || a.questionNumber - b.questionNumber)
}

// ─── Batch: 시험 전체 문제에 대한 매핑 ───

export function buildConceptLinksMap(
  questions: KiceQuestion[],
): Record<number, ConceptLink[]> {
  const map: Record<number, ConceptLink[]> = {}
  for (const q of questions) {
    const links = getConceptLinksForQuestion(q)
    if (links.length > 0) {
      map[q.number] = links
    }
  }
  return map
}
