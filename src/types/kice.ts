export interface ExamMeta {
  year: number
  title: string
  subject: string
  session: string
  period: string
  total_questions: number
  total_points: number
  duration_minutes: number
  question_types: Record<string, { count: number; points_each: number }>
}

export interface DialogueLine {
  speaker: string
  text: string
}

export interface SubItem {
  label?: string
  title?: string
  content: string | string[] | Record<string, unknown>
}

export interface KiceQuestion {
  number: number
  points: number
  type: 'fill_in' | 'descriptive'
  subjects: string[]
  chapters: string[]
  keywords: string[]
  context: string
  dialogue?: DialogueLine[]
  scenario?: { title?: string; details?: Record<string, string>; dialogue?: DialogueLine[] } | string
  sub_items?: SubItem[]
  blanks?: Record<string, { description: string; answer: string }>
  tasks?: string[]
  model_answers?: Record<string, unknown>
  note?: string
}

export interface KiceExam {
  exam: ExamMeta
  questions: KiceQuestion[]
}

export interface ExamEntry {
  year: number
  session: string
  filename: string
  isIsomorphic: boolean
  isPredicted: boolean
}

export const SUBJECT_LABELS: Record<string, string> = {
  'laws': '법령',
  'curriculum': '교육과정',
  'introduction': '개론',
  'assessment': '진단·평가',
  'behavior-support': '행동지원',
  'communication-disorder': '의사소통',
  'visual-impairment': '시각장애',
  'hearing-impairment': '청각장애',
  'physical-disability': '지체장애',
  'inclusive-education': '통합교육',
  'transition': '전환교육',
}
