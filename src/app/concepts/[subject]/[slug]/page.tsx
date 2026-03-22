import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import { ChevronLeft, ChevronRight, BookOpen, Tag, Calendar } from 'lucide-react';
import { getMDXContent, getAllSubjects, getSubjectFiles } from '@/lib/concepts';

interface Props {
  params: Promise<{ subject: string; slug: string }>;
}

export async function generateStaticParams() {
  const subjects = getAllSubjects();
  return subjects.flatMap((subject) =>
    getSubjectFiles(subject).map((f) => ({
      subject: subject,
      slug: f.slug,
    })),
  );
}

export default async function ConceptSlugPage({ params }: Props) {
  const { subject, slug } = await params;
  const decodedSubject = decodeURIComponent(subject);
  const decodedSlug = decodeURIComponent(slug);

  const conceptData = getMDXContent(decodedSubject, decodedSlug);
  if (!conceptData) notFound();

  const { title, description, kiceKeywords, lastUpdated, content, prev, next } = conceptData;

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      {/* 상단 브레드크럼 */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link href="/concepts" className="hover:text-foreground transition-colors">
          개념학습
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link
          href={`/concepts/${encodeURIComponent(decodedSubject)}`}
          className="hover:text-foreground transition-colors"
        >
          {decodedSubject}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{title}</span>
      </nav>

      {/* 헤더 */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
            <BookOpen className="h-3 w-3" />
            {decodedSubject}
          </span>
          {lastUpdated && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {lastUpdated}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-foreground leading-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}

        {/* 기출 키워드 뱃지 */}
        {kiceKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-medium">
              <Tag className="h-3 w-3" />
              기출키워드
            </span>
            {kiceKeywords.map((kw) => (
              <span
                key={kw}
                className="inline-block text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-t border-border mb-6" />

      {/* MDX 본문 */}
      <div className="prose prose-sm dark:prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-foreground
        prose-h2:text-lg prose-h3:text-base
        prose-p:text-foreground/80 prose-p:leading-relaxed
        prose-strong:text-foreground prose-strong:font-semibold
        prose-table:text-sm prose-th:bg-muted/50 prose-th:font-semibold
        prose-td:align-middle
        prose-a:text-primary prose-a:no-underline hover:prose-a:underline
        prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:rounded
        prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground">
        <MDXRemote
          source={content}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm, remarkFrontmatter],
            },
          }}
        />
      </div>

      {/* 이전/다음 네비게이션 */}
      <div className="mt-12 pt-6 border-t border-border grid grid-cols-2 gap-4">
        {prev ? (
          <Link
            href={`/concepts/${encodeURIComponent(prev.subject)}/${encodeURIComponent(prev.slug)}`}
            className="flex items-start gap-2 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground">이전</p>
              <p className="text-sm font-medium text-foreground truncate">{prev.title}</p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {next ? (
          <Link
            href={`/concepts/${encodeURIComponent(next.subject)}/${encodeURIComponent(next.slug)}`}
            className="flex items-start gap-2 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors group text-right ml-auto w-full"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground">다음</p>
              <p className="text-sm font-medium text-foreground truncate">{next.title}</p>
            </div>
            <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-foreground shrink-0" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </article>
  );
}
