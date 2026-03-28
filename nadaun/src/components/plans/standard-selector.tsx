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

export interface SelectedStandard {
  id: string
  code: string
  content: string
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
}

export function StandardSelector({
  subject,
  onSelect,
  excludeIds = [],
}: StandardSelectorProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'domains' | 'standards' | 'search'>('domains')
  const [domains, setDomains] = useState<DomainItem[]>([])
  const [standards, setStandards] = useState<StandardRow[]>([])
  const [selectedDomainLabel, setSelectedDomainLabel] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<StandardRow[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !subject) return
    setView('domains')
    setSelectedDomainLabel('')
    setSearchQuery('')
    setSearchResults([])

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
        .select('id, code, content')
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
      .select('id, code, content')
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
    })
    setOpen(false)
  }

  const visibleStandards = (
    view === 'search' ? searchResults : standards
  ).filter((s) => !excludeIds.includes(s.id))

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
              onClick={() => setView('domains')}
            >
              영역
            </button>
            {selectedDomainLabel && (
              <>
                <span>/</span>
                <span>{selectedDomainLabel}</span>
              </>
            )}
            {view === 'search' && <span>/ 검색 결과</span>}
          </div>
        )}

        <div className="flex-1 overflow-y-auto min-h-0 space-y-1">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              불러오는 중...
            </div>
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
              <button
                key={s.id}
                type="button"
                className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => handleSelect(s)}
              >
                <div className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5 shrink-0">
                    {s.code}
                  </Badge>
                  <span className="text-sm">{s.content}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
