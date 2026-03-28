'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ALL_SUBJECT_SLUGS, getSubjectMeta } from '@/lib/utils/subject-map'
import type { SubjectSlug } from '@/lib/utils/subject-map'

export function SearchForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [subject, setSubject] = useState(searchParams.get('subject') ?? '')

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const params = new URLSearchParams()
      if (query.trim()) params.set('q', query.trim())
      if (subject) params.set('subject', subject)
      router.push(`/standards/search?${params.toString()}`)
    },
    [query, subject, router]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4" role="search" aria-label="성취기준 검색">
      <div className="flex gap-2">
        <Input
          type="search"
          placeholder="성취기준 내용 또는 해설 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="검색어 입력"
          className="flex-1"
        />
        <Button type="submit" aria-label="검색">
          검색
        </Button>
      </div>

      <Select value={subject} onValueChange={(v) => setSubject(v ?? '')}>
        <SelectTrigger aria-label="과목 필터">
          <SelectValue placeholder="전체 과목" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 과목</SelectItem>
          {ALL_SUBJECT_SLUGS.map((slug) => {
            const meta = getSubjectMeta(slug as SubjectSlug)
            if (!meta) return null
            return (
              <SelectItem key={slug} value={meta.dbName}>
                {meta.emoji} {meta.label}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </form>
  )
}
