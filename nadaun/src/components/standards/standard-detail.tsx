import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ContentElements } from './content-elements'
import { KeyIdeasList } from './key-ideas-list'
import type { AchievementStandardRow } from '@/types/achievement-standards'

interface StandardDetailProps {
  standard: AchievementStandardRow
}

export function StandardDetail({ standard }: StandardDetailProps) {
  return (
    <article className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="font-mono">{standard.code}</Badge>
          <Badge variant="secondary">{standard.subject}</Badge>
          <Badge variant="secondary">{standard.domain}</Badge>
          {standard.sub_domain && (
            <Badge variant="secondary">{standard.sub_domain}</Badge>
          )}
        </div>
        <h1 className="text-xl font-bold leading-relaxed break-keep">
          {standard.content}
        </h1>
      </header>

      <Separator />

      <section aria-label="해설">
        <h2 className="text-sm font-semibold mb-2">해설</h2>
        <p className="text-sm leading-relaxed break-keep text-muted-foreground">
          {standard.explanation}
        </p>
      </section>

      <Separator />

      <section aria-label="내용 체계">
        <h2 className="text-sm font-semibold mb-3">내용 체계</h2>
        <ContentElements elements={standard.content_elements} />
      </section>

      {standard.key_ideas.length > 0 && (
        <>
          <Separator />
          <section aria-label="핵심 아이디어">
            <KeyIdeasList ideas={standard.key_ideas} />
          </section>
        </>
      )}
    </article>
  )
}
