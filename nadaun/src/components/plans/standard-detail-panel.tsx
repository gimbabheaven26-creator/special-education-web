import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  CurriculumLevel,
  AchievementPool,
} from '@/types/achievement-standards'

interface StandardRow {
  id: string
  code: string
  content: string
  curriculum_levels: CurriculumLevel[] | null
  achievement_pool: AchievementPool | null
  considerations: string[] | null
}

/** 성취기준 상세 패널 — enriched 데이터 표시 */
export function StandardDetailPanel({
  standard,
  onSelect,
}: {
  standard: StandardRow
  onSelect: () => void
}) {
  const pool = standard.achievement_pool
  const levels = standard.curriculum_levels
  const considerations = standard.considerations

  return (
    <div className="space-y-4">
      <div>
        <Badge variant="outline">{standard.code}</Badge>
        <p className="mt-1 text-sm font-medium">{standard.content}</p>
      </div>

      {considerations && considerations.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">
            적용 시 고려사항
          </h5>
          <ul className="space-y-1">
            {considerations.map((c, i) => (
              <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                • {c}
              </li>
            ))}
          </ul>
        </div>
      )}

      {levels && levels.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">
            교육과정 성취수준 (3축)
          </h5>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-1 pr-2 text-left font-medium">지식·이해</th>
                  <th className="py-1 pr-2 text-left font-medium">과정·기능</th>
                  <th className="py-1 text-left font-medium">가치·태도</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((lv, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-1 pr-2 text-muted-foreground">
                      {lv.knowledge_understanding}
                    </td>
                    <td className="py-1 pr-2 text-muted-foreground">
                      {lv.process_skills}
                    </td>
                    <td className="py-1 text-muted-foreground">
                      {lv.values_attitudes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pool && pool.columns && pool.columns.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-muted-foreground mb-1">
            성취수준 풀
          </h5>
          <div className="grid gap-2 md:grid-cols-2">
            {pool.columns.map((header, colIdx) => (
              <div key={colIdx}>
                <span className="text-xs font-medium">{header}</span>
                <ul className="mt-1 space-y-0.5">
                  {(pool.items[colIdx] || []).slice(0, 4).map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground">
                      • {item}
                    </li>
                  ))}
                  {(pool.items[colIdx] || []).length > 4 && (
                    <li className="text-xs text-muted-foreground italic">
                      외 {(pool.items[colIdx] || []).length - 4}개
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button type="button" size="sm" className="w-full" onClick={onSelect}>
        이 성취기준 선택
      </Button>
    </div>
  )
}
