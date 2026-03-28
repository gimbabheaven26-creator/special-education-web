export interface AchievementStandard {
  code: string
  content: string
  explanation: string
}

export interface ContentElements {
  knowledge_understanding:
    | string[]
    | {
        language: string[]
        context: string[]
      }
  process_skills: string[]
  values_attitudes: string[]
}

export interface Domain {
  domain: string
  domain_code: string
  key_ideas: string[]
  content_elements: ContentElements
  standards: AchievementStandard[]
}

export interface SubjectCurriculum {
  subject: string
  curriculum: string
  source: string
  grade_group: string
  grade_group_code: string
  domains: Domain[]
}
