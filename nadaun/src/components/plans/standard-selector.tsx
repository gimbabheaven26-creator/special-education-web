'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/browser'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type {
  CurriculumLevel,
  AchievementPool,
} from '@/types/achievement-standards'

export interface SelectedStandard {
  id: string
  code: string
  content: string
  curriculum_levels?: CurriculumLevel[]
  achievement_pool?: AchievementPool
  considerations?: string[]
}

interface StandardSelectorProps {
  subject: string
  onSelect: (standard: SelectedStandard) => void
  excludeIds?: string[]
}

interface DomainItem {
  domain: string
  domain_code: string
  count: number
}

interface StandardRow {
  id: string
  code: string
  content: string
  curriculum_levels: CurriculumLevel[] | null
  achievement_pool: AchievementPool | null
  considerations: string[] | null
}

const ENRICHED_SELECT =
  'id, code, content, curriculum_levels, achievement_pool, considerations'

export function StandardSelector({
  subject,
  onSelect,
  excludeIds = [],
}: StandardSelectorProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'domains' | 'standards' | 'search' | 'detail'>(
    'domains'
  )
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [standards, setStandards] = useState<StandardRow[]>([])
  const [selectedDomainLabel, setSelectedDomainLabel] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StandardRow[]>([])
  const [loading, setLoading] = useState(false)
  const [detailStandard, setDetailStandard] = useState<StandardRow | null>(null)

  useEffect(() => {
    if (!open || !subject) return
    setView('domains')
    setSelectedDomainLabel('')
    setSearchQuery('')
    setSearchResults([])
    setDetailStandard(null)

    async function fetchDomains() {
      setLoading(true)
      const supabase = createClient()
      const { data } = await supabase
        .from('achievement_standards')
        .select('domain, domain_code')
        .eq('subject', subject)
        .order('domain_code')
        .limit(10000)

      if (data) {
        const map = new Map<string, DomainItem>()
        for (const row of data as { domain: string; domain_code: string }[]) {
          const existing = map.get(row.domain_code)
          if (existing) {
            existing.count++
          } else {
            map.set(row.domain_code, {
              domain: row.domain,
              domain_code: row.domain_code,
              count: 1,
            })
          }
        }
        setDomains(Array.from(map.values()))
      }
      setLoading(false)
    }
    fetchDomains()
  }, [open, subject])

  const fetchStandards = useCallback(
    async (domainCode: string, domainLabel: string) => {
      setLoading(true)
      setSelectedDomainLabel(domainLabel)
      setView('standards')

      const supabase = createClient()
      const { data } = await supabase
        .from('achievement_standards')
        .select(ENRICHED_SELECT)
        .eq('subject', subject)
        .eq('domain_code', domainCode)
        .order('code')
        .limit(10000)

      if (data) {
        setStandards(data as StandardRow[])
      }
      setLoading(false)
    },
    [subject],
  )

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setView('search')

    const supabase = createClient()
    const pattern = `%${searchQuery.trim()}%`
    const { data } = await supabase
      .from('achievement_standards')
      .select(ENRICHED_SELECT)
      .eq('subject', subject)
      .or(`content.ilike.${pattern},code.ilike.${pattern}`)
      .order('code')
      .limit(50)

    if (data) {
      setSearchResults(data as StandardRow[])
    }
    setLoading(false)
  }, [subject, searchQuery])

  function handleSelect(standard: StandardRow) {
    onSelect({
      id: standard.id,
      code: standard.code,
      content: standard.content,
      curriculum_levels: standard.curriculum_levels || undefined,
      achievement_pool: standard.achievement_pool || undefined,
      considerations: standard.considerations || undefined,
    })
    setOpen(false)
  }

  function showDetail(standard: StandardRow) {
    setDetailStandard(standard)
    setView('detail')
  }

  const visibleStandards = (
    view === 'search' ? searchResults : standards
  ).filter((s) => !excludeIds.includes(s.id))

  const hasEnriched = (s: StandardRow) =>
    s.achievement_pool &&
    Array.isArray(s.achievement_pool.columns) &&
    s.achievement_pool.columns.length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type="button" variant="outline" size="sm" />}
        aria-label="성취기준 선택"
      >
        + 성취기준 추가
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>성취기준 선택</DialogTitle>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            placeholder="성취기준 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSearch()
              }
            }}
            aria-label="성취기준 검색"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSearch}
          >
            검색
          </Button>
        </div>

        {view !== 'domains' && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <button
              type="button"
              className="hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded px-1"
              onClick={() => {
                setDetailStandard(null)
                setView('domains')
              }}
            >
              영역
            </button>
            {selectedDomainLabel && view !== 'search' && (
              <>
                <span>/</span>
                <button
                  type="button"
                  className="hover:text-foreground rounded px-1"
                  onClick={() => {
                    setDetailStandard(null)
                    setView('standards')
                  }}
                >
                  {selectedDomainLabel}
                </button>
              </>
            )}
            {view === 'search' && <span>/ 검색 결과</span>}
            {view === 'detail' && detailStandard && (
              <>
                <span>/</span>
                <span>{detailStandard.code}</span>
              </>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
          ) : view === 'detail' && detailStandard ? (
            <StandardDetailPanel
              standard={detailStandard}
              onSelect={() => handleSelect(detailStandard)}
            />
          ) : view === 'domains' ? (
            domains.map((d) => (
              <button
                key={d.domain_code}
                type="button"
                className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => fetchStandards(d.domain_code, d.domain)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{d.domain}</span>
                  <Badge variant="secondary">{d.count}개</Badge>
                </div>
              </button>
            ))
          ) : visibleStandards.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {view === 'search'
                ? '검색 결과가 없습니다.'
                : '선택 가능한 성취기준이 없습니다.'}
            </div>
          ) : (
            visibleStandards.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {s.code}
                  </Badge>
                  <span className="text-sm flex-1">{s.content}</span>
                </div>
                <div className="mt-2 flex gap-2">
                  {hasEnriched(s) && (
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline"
                      onClick={() => showDetail(s)}
                    >
                      상세보기
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-xs text-primary font-medium hover:underline"
                    onClick={() => handleSelect(s)}
                  >
                    선택
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** 성취기준 상세 패널 — enriched 데이터 표시 */
function StandardDetailPanel({
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
