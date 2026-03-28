/** 개별 성취기준 */
export interface AchievementStandard {
  code: string
  content: string
  explanation: string
}

/**
 * knowledge_understanding는 과목마다 형태가 다름:
 * - 국어, 진로와직업: string[]
 * - 생활영어: { language: string[], context: string[] }
 * - 수학: Record<string, string> 또는 단일 string
 */
export type KnowledgeUnderstanding =
  | string[]
  | { language: string[]; context: string[] }
  | Record<string, string>
  | string

export interface ContentElements {
  knowledge_understanding: KnowledgeUnderstanding
  process_skills: string[]
  values_attitudes: string[]
}

/** 수학 하위영역 */
export interface SubDomain {
  name: string
  standards: AchievementStandard[]
}

/** 교과 영역 */
export interface Domain {
  domain: string
  domain_code: string
  key_ideas: string[]
  content_elements: ContentElements
  standards?: AchievementStandard[]
  sub_domains?: SubDomain[]
}

/** 교과 교육과정 JSON 최상위 */
export interface SubjectCurriculum {
  subject: string
  curriculum: string
  source: string
  grade_group: string
  grade_group_code: string
  domains: Domain[]
}

/** DB achievement_standards 테이블 행 */
export interface AchievementStandardRow {
  id: string
  subject: string
  curriculum: string
  grade_group: string
  grade_group_code: string
  domain: string
  domain_code: string
  sub_domain: string | null
  code: string
  content: string
  explanation: string
  key_ideas: string[]
  content_elements: ContentElements
  created_at: string
}
