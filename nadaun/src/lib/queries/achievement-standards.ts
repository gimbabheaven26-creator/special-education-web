import { createClient } from '@/lib/supabase/server'
import { subjectToSlug } from '@/lib/utils/subject-map'
import type { AchievementStandardRow } from '@/types/achievement-standards'

export interface SubjectSummary {
  subject: string
  slug: string
  count: number
}

export interface DomainSummary {
  domain: string
  domain_code: string
  count: number
  subDomains: string[]
}

/** Pure: aggregate rows into subject summaries with counts */
export function aggregateSubjectSummaries(
  rows: AchievementStandardRow[]
): SubjectSummary[] {
  const map = new Map<string, number>()
  for (const row of rows) {
    map.set(row.subject, (map.get(row.subject) ?? 0) + 1)
  }
  return Array.from(map.entries()).map(([subject, count]) => ({
    subject,
    slug: subjectToSlug(subject) ?? subject,
    count,
  }))
}

/** Pure: aggregate rows into domain summaries with counts and sub-domains */
export function aggregateDomainSummaries(
  rows: AchievementStandardRow[]
): DomainSummary[] {
  const domainMap = new Map<string, { domain: string; count: number; subDomains: Set<string> }>()

  for (const row of rows) {
    const existing = domainMap.get(row.domain_code)
    if (existing) {
      existing.count++
      if (row.sub_domain) existing.subDomains.add(row.sub_domain)
    } else {
      const subDomains = new Set<string>()
      if (row.sub_domain) subDomains.add(row.sub_domain)
      domainMap.set(row.domain_code, { domain: row.domain, count: 1, subDomains })
    }
  }

  return Array.from(domainMap.entries()).map(([domain_code, v]) => ({
    domain: v.domain,
    domain_code,
    count: v.count,
    subDomains: Array.from(v.subDomains),
  }))
}

/** Fetch all subjects with standard counts */
export async function getSubjectSummaries(): Promise<SubjectSummary[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('achievement_standards')
    .select('subject')
    .limit(10000)

  if (error) throw new Error(error.message)
  return aggregateSubjectSummaries(data as AchievementStandardRow[])
}

/** Fetch domains for a subject with counts */
export async function getDomainsBySubject(subject: string): Promise<DomainSummary[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('achievement_standards')
    .select('domain, domain_code, sub_domain')
    .eq('subject', subject)
    .order('domain_code')
    .limit(10000)

  if (error) throw new Error(error.message)
  return aggregateDomainSummaries(data as AchievementStandardRow[])
}

/** Fetch standards for a specific domain, optionally filtered by sub-domain */
export async function getStandardsByDomain(
  subject: string,
  domainCode: string,
  subDomain?: string
): Promise<AchievementStandardRow[]> {
  const supabase = await createClient()
  let query = supabase
    .from('achievement_standards')
    .select('*')
    .eq('subject', subject)
    .eq('domain_code', domainCode)

  if (subDomain) {
    query = query.eq('sub_domain', subDomain)
  }

  const { data, error } = await query.order('code').limit(10000)
  if (error) throw new Error(error.message)
  return (data ?? []) as AchievementStandardRow[]
}

/** Fetch a single standard by its unique code */
export async function getStandardByCode(
  code: string
): Promise<AchievementStandardRow | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('achievement_standards')
    .select('*')
    .eq('code', code)
    .single()

  if (error && error.code !== 'PGRST116') throw new Error(error.message)
  return (data as AchievementStandardRow) ?? null
}

/** Search standards by text query with optional subject/domain filters */
export async function searchStandards(
  query: string,
  filters?: { subject?: string; domainCode?: string }
): Promise<AchievementStandardRow[]> {
  if (!query.trim()) return []

  const supabase = await createClient()
  const pattern = `%${query.trim()}%`

  let q = supabase
    .from('achievement_standards')
    .select('*')
    .or(`content.ilike.${pattern},explanation.ilike.${pattern}`)

  if (filters?.subject) {
    q = q.eq('subject', filters.subject)
  }
  if (filters?.domainCode) {
    q = q.eq('domain_code', filters.domainCode)
  }

  const { data, error } = await q.order('code').limit(10000)
  if (error) throw new Error(error.message)
  return (data ?? []) as AchievementStandardRow[]
}
