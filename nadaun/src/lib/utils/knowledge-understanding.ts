import type { KnowledgeUnderstanding } from '@/types/achievement-standards'

/** Type guards for knowledge_understanding polymorphism */

export function isStringArray(v: KnowledgeUnderstanding): v is string[] {
  return Array.isArray(v)
}

export function isLanguageContext(
  v: KnowledgeUnderstanding
): v is { language: string[]; context: string[] } {
  return (
    typeof v === 'object' &&
    !Array.isArray(v) &&
    'language' in v &&
    'context' in v
  )
}

export function isRecordStringString(
  v: KnowledgeUnderstanding
): v is Record<string, string> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false
  if ('language' in v && 'context' in v) return false
  return Object.values(v).every((val) => typeof val === 'string')
}

export function isSingleString(v: KnowledgeUnderstanding): v is string {
  return typeof v === 'string'
}
