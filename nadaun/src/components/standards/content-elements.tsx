import type { ContentElements as CE, KnowledgeUnderstanding } from '@/types/achievement-standards'
import {
  isStringArray,
  isLanguageContext,
  isRecordStringString,
  isSingleString,
} from '@/lib/utils/knowledge-understanding'

function KnowledgeUnderstandingSection({ ku }: { ku: KnowledgeUnderstanding }) {
  if (isStringArray(ku)) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {ku.map((item, i) => (
          <li key={i} className="text-sm">{item}</li>
        ))}
      </ul>
    )
  }

  if (isLanguageContext(ku)) {
    return (
      <div className="space-y-3">
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">언어</h5>
          <ul className="list-disc pl-5 space-y-1">
            {ku.language.map((item, i) => (
              <li key={i} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-medium text-muted-foreground mb-1">맥락</h5>
          <ul className="list-disc pl-5 space-y-1">
            {ku.context.map((item, i) => (
              <li key={i} className="text-sm">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (isRecordStringString(ku)) {
    return (
      <div className="space-y-2">
        {Object.entries(ku).map(([key, value]) => (
          <div key={key} className="flex gap-2 text-sm">
            <span className="shrink-0 font-medium text-muted-foreground">
              {key.replace(/_/g, ' ')}:
            </span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    )
  }

  if (isSingleString(ku)) {
    return <p className="text-sm">{ku}</p>
  }

  return <p className="text-sm text-muted-foreground">내용 없음</p>
}

function StringList({ items, label }: { items: string[]; label: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-2">{label}</h4>
      <ul className="list-disc pl-5 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-sm">{item}</li>
        ))}
      </ul>
    </div>
  )
}

interface ContentElementsProps {
  elements: CE
}

export function ContentElements({ elements }: ContentElementsProps) {
  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold mb-2">지식·이해</h4>
        <KnowledgeUnderstandingSection ku={elements.knowledge_understanding} />
      </div>

      {elements.process_skills.length > 0 && (
        <StringList items={elements.process_skills} label="과정·기능" />
      )}

      {elements.values_attitudes.length > 0 && (
        <StringList items={elements.values_attitudes} label="가치·태도" />
      )}
    </div>
  )
}
