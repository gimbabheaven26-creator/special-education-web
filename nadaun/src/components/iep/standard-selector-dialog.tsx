'use client'

import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export type StandardForSelector = {
  id: string
  subject: string
  domain: string
  domain_code: string
  code: string
  content: string
}

interface StandardSelectorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  standards: StandardForSelector[]
  selectedIds: string[]
  onSelect: (standard: { id: string; code: string; content: string }) => void
}

export function StandardSelectorDialog({
  open,
  onOpenChange,
  standards,
  selectedIds,
  onSelect,
}: StandardSelectorDialogProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return standards
    const q = search.trim().toLowerCase()
    return standards.filter(
      (s) =>
        s.content.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    )
  }, [standards, search])

  const grouped = useMemo(() => {
    const map = new Map<string, StandardForSelector[]>()
    for (const s of filtered) {
      const list = map.get(s.domain) ?? []
      list.push(s)
      map.set(s.domain, list)
    }
    return map
  }, [filtered])

  const isEmpty = standards.length === 0
  const noResults = !isEmpty && filtered.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>성취기준 선택</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="성취기준 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="성취기준 검색"
        />

        <div className="flex-1 overflow-y-auto space-y-4 mt-2">
          {isEmpty && (
            <p className="text-sm text-muted-foreground text-center py-8">
              해당 과목의 성취기준이 없습니다.
            </p>
          )}

          {noResults && (
            <p className="text-sm text-muted-foreground text-center py-8">
              검색 결과가 없습니다.
            </p>
          )}

          {Array.from(grouped.entries()).map(([domain, items]) => (
            <div key={domain}>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">
                {domain}
              </h4>
              <div className="space-y-1">
                {items.map((s) => {
                  const isSelected = selectedIds.includes(s.id)
                  return (
                    <Button
                      key={s.id}
                      type="button"
                      variant="ghost"
                      disabled={isSelected}
                      onClick={() =>
                        onSelect({
                          id: s.id,
                          code: s.code,
                          content: s.content,
                        })
                      }
                      className="w-full justify-start text-left h-auto py-2 px-3"
                      aria-label={`성취기준 ${s.code} 선택`}
                    >
                      <div className="min-w-0">
                        <span className="block text-xs font-mono text-muted-foreground">
                          {s.code}
                        </span>
                        <span className="block text-sm line-clamp-2">
                          {s.content}
                        </span>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
