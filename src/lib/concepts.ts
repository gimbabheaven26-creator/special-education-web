import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const CONCEPTS_DIR = path.join(process.cwd(), 'src', 'content', 'concepts');

/** gray-matter가 YAML 날짜를 Date 객체로 파싱하는 경우를 처리 */
function toDateString(val: unknown): string | undefined {
  if (val == null) return undefined;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return String(val);
}

/**
 * YAML에서 콜론(:) 포함 키워드가 key:value 객체로 파싱되는 경우를 복원
 * e.g. {'고급 테크놀로지 (음성 출력 기기': '원버튼·다버튼·음성합성)'}
 *      → '고급 테크놀로지 (음성 출력 기기: 원버튼·다버튼·음성합성)'
 */
function toKeywordString(kw: unknown): string {
  if (typeof kw === 'string') return kw;
  if (kw && typeof kw === 'object' && !Array.isArray(kw)) {
    const entries = Object.entries(kw as Record<string, unknown>);
    if (entries.length > 0) {
      const [k, v] = entries[0];
      return `${k}: ${v}`;
    }
  }
  return String(kw);
}

export interface ConceptFrontmatter {
  title: string;
  description: string;
  subject: string;
  slug: string;
  order: number;
  kiceKeywords: string[];
  lastUpdated?: string;
}

export interface ConceptFile {
  subject: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  kiceKeywords: string[];
  lastUpdated?: string;
}

export interface ConceptContent extends ConceptFile {
  content: string;
  prev: Pick<ConceptFile, 'subject' | 'slug' | 'title'> | null;
  next: Pick<ConceptFile, 'subject' | 'slug' | 'title'> | null;
}

/** 모든 과목 폴더 목록 (가나다 순) */
export function getAllSubjects(): string[] {
  if (!fs.existsSync(CONCEPTS_DIR)) return [];
  return fs
    .readdirSync(CONCEPTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, 'ko'));
}

/** 특정 과목의 MDX 파일 목록 (order 오름차순) */
export function getSubjectFiles(subject: string): ConceptFile[] {
  const subjectDir = path.join(CONCEPTS_DIR, subject);
  if (!fs.existsSync(subjectDir)) return [];

  const files = fs
    .readdirSync(subjectDir)
    .filter((f) => f.endsWith('.mdx'));

  return files
    .map((filename) => {
      const filePath = path.join(subjectDir, filename);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data } = matter(raw);
      const fm = data as Partial<ConceptFrontmatter>;
      const slugFromFilename = filename.replace(/^\d+-/, '').replace(/\.mdx$/, '');
      return {
        subject,
        slug: fm.slug ?? slugFromFilename,
        title: fm.title ?? filename,
        description: fm.description ?? '',
        order: fm.order ?? 99,
        kiceKeywords: (fm.kiceKeywords ?? []).map(toKeywordString),
        lastUpdated: toDateString(fm.lastUpdated),
      } satisfies ConceptFile;
    })
    .sort((a, b) => a.order - b.order);
}

/** 특정 파일의 MDX 콘텐츠 + frontmatter + 이전/다음 파일 */
export function getMDXContent(subject: string, slug: string): ConceptContent | null {
  const subjectDir = path.join(CONCEPTS_DIR, subject);
  if (!fs.existsSync(subjectDir)) return null;

  const files = fs.readdirSync(subjectDir).filter((f) => f.endsWith('.mdx'));

  // slug 매칭: frontmatter slug 또는 파일명에서 추출
  let targetFile: string | null = null;
  for (const filename of files) {
    const raw = fs.readFileSync(path.join(subjectDir, filename), 'utf-8');
    const { data } = matter(raw);
    const slugFromFile = filename.replace(/^\d+-/, '').replace(/\.mdx$/, '');
    if ((data.slug ?? slugFromFile) === slug) {
      targetFile = filename;
      break;
    }
  }
  if (!targetFile) return null;

  const raw = fs.readFileSync(path.join(subjectDir, targetFile), 'utf-8');
  const { data, content } = matter(raw);
  const fm = data as Partial<ConceptFrontmatter>;

  const allFiles = getSubjectFiles(subject);
  const currentIndex = allFiles.findIndex((f) => f.slug === slug);
  const prev = currentIndex > 0 ? allFiles[currentIndex - 1] : null;
  const next = currentIndex < allFiles.length - 1 ? allFiles[currentIndex + 1] : null;

  return {
    subject,
    slug,
    title: fm.title ?? targetFile,
    description: fm.description ?? '',
    order: fm.order ?? 99,
    kiceKeywords: fm.kiceKeywords ?? [],
    lastUpdated: toDateString(fm.lastUpdated),
    content,
    prev: prev ? { subject: prev.subject, slug: prev.slug, title: prev.title } : null,
    next: next ? { subject: next.subject, slug: next.slug, title: next.title } : null,
  };
}
