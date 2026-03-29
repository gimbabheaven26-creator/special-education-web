'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'

export interface KiceSearchItem {
  year: number
  session: string
  number: number
  points: number
  context: string
  keywords: string[]
  subjects: string[]
}

interface KiceSearchProps {
  items: KiceSearchItem[]
}

export default function KiceSearch({ items }: KiceSearchProps) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    return items.filter(q =>
      q.keywords.some(kw => kw.toLowerCase().includes(lower)) ||
      q.subjects.some(s => s.toLowerCase().includes(lower)) ||
      q.context.toLowerCase().includes(lower)
    ).slice(0, 30)
  }, [query, items])

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground">기출문제</h1>
        <p className="text-sm text-muted-foreground mt-1">키워드, 과목, 지문으로 기출문제를 찾아보세요</p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border" role="tablist" aria-label="기출문제 보기 방식">
        <Link href="/kice?tab=by-year" role="tab" aria-selected="false" className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-b-2 border-transparent transition-colors min-h-[44px] flex items-center">
          연도별 기출
        </Link>
        <Link href="/kice?tab=by-area" role="tab" aria-selected="false" className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-b-2 border-transparent transition-colors min-h-[44px] flex items-center">
          영역별 기출
        </Link>
        <Link href="/kice?tab=analytics" role="tab" aria-selected="false" className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 border-b-2 border-transparent transition-colors min-h-[44px] flex items-center">
          빈도분석
        </Link>
        <span role="tab" aria-selected="true" className="px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary min-h-[44px] flex items-center">
          키워드 검색
        </span>
      </div>

      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          autoFocus
          placeholder="예: ABA, PECS, 중다기초선..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* 안내 문구 */}
      {!query && (
        <p className="text-center text-sm text-muted-foreground py-4">
          키워드를 입력하면 전체 기출 문항에서 검색합니다.
        </p>
      )}

      {/* 결과 없음 */}
      {query && results.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">검색 결과가 없습니다.</p>
      )}

      {/* 결과 목록 */}
      <div className="space-y-3">
        {results.map((q, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground">{q.year} {q.session}</span>
              <span className="text-xs font-medium text-muted-foreground">Q{q.number}</span>
              <span className="text-xs text-muted-foreground">{q.points}점</span>
            </div>
            <p className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap">{q.context}</p>
            <div className="flex gap-1 flex-wrap">
              {q.keywords.map(kw => (
                <span key={kw} className="text-xs bg-muted/50 rounded px-1.5 py-0.5 text-muted-foreground">
                  #{kw}
                </span>
              ))}
            </div>
            <Link
              href={`/kice?year=${q.year}&session=${encodeURIComponent(q.session)}`}
              className="text-xs text-primary hover:underline"
            >
              이 시험지 보기 →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
