export type SubjectSlug = 'korean' | 'math' | 'english' | 'career'

export interface SubjectMeta {
  slug: SubjectSlug
  dbName: string
  label: string
  emoji: string
  description: string
}

const SUBJECT_MAP: Record<SubjectSlug, SubjectMeta> = {
  korean: {
    slug: 'korean',
    dbName: '국어',
    label: '국어',
    emoji: '📖',
    description: '듣기·말하기, 읽기, 쓰기',
  },
  math: {
    slug: 'math',
    dbName: '수학',
    label: '수학',
    emoji: '🔢',
    description: '수와 연산, 도형, 측정, 규칙성, 자료와 가능성',
  },
  english: {
    slug: 'english',
    dbName: '생활영어',
    label: '생활영어',
    emoji: '🌍',
    description: '듣기·말하기, 읽기, 쓰기',
  },
  career: {
    slug: 'career',
    dbName: '진로와 직업',
    label: '진로와 직업',
    emoji: '💼',
    description: '자기 인식, 직업의 세계, 작업 기초 능력, 직업 태도',
  },
}

const REVERSE_MAP = new Map<string, SubjectSlug>(
  Object.entries(SUBJECT_MAP).map(([slug, meta]) => [meta.dbName, slug as SubjectSlug])
)

export const ALL_SUBJECT_SLUGS: SubjectSlug[] = ['korean', 'math', 'english', 'career']

export function slugToSubject(slug: SubjectSlug): string | null {
  return SUBJECT_MAP[slug]?.dbName ?? null
}

export function subjectToSlug(subject: string): SubjectSlug | null {
  return REVERSE_MAP.get(subject) ?? null
}

export function getSubjectMeta(slug: SubjectSlug): SubjectMeta | null {
  return SUBJECT_MAP[slug] ?? null
}
