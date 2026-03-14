'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Eye } from 'lucide-react'
import type { KiceQuestion } from '@/types/kice'

interface ModelAnswersProps {
  question: KiceQuestion
}

export function ModelAnswers({ question }: ModelAnswersProps) {
  const [open, setOpen] = useState(false)

  const hasBlanks = question.blanks && Object.keys(question.blanks).length > 0
  const hasModelAnswers = question.model_answers && Object.keys(question.model_answers).length > 0

  if (!hasBlanks && !hasModelAnswers) return null

  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        <span>모범답안 {open ? '숨기기' : '보기'}</span>
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 p-3 space-y-2">
          {hasBlanks && (
            <div className="space-y-1.5">
              {Object.entries(question.blanks!).map(([key, blank]) => (
                <div key={key} className="text-sm">
                  <span className="font-semibold text-green-700 dark:text-green-400">{key}</span>
                  <span className="text-muted-foreground mx-1">:</span>
                  <span className="text-foreground">{blank.answer}</span>
                  {blank.description && (
                    <span className="text-muted-foreground text-xs ml-2">({blank.description})</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {hasModelAnswers && (
            <div className="space-y-1.5">
              {Object.entries(question.model_answers!).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-semibold text-green-700 dark:text-green-400">{key}</span>
                  <span className="text-muted-foreground mx-1">:</span>
                  <span className="text-foreground whitespace-pre-wrap">
                    {typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
