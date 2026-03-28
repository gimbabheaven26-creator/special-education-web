'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'

type CopyState = 'idle' | 'copied' | 'failed'

interface CopyButtonProps {
  text: string
  label: string
  ariaLabel: string
}

const FEEDBACK_DURATION_MS = 2000

const labelMap: Record<CopyState, (label: string) => string> = {
  idle: (label) => label,
  copied: () => '복사됨',
  failed: () => '복사 실패',
}

export function CopyButton({ text, label, ariaLabel }: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setState('copied')
    } catch {
      setState('failed')
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setState('idle')
      timerRef.current = null
    }, FEEDBACK_DURATION_MS)
  }, [text])

  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={ariaLabel}
      onClick={handleCopy}
    >
      {labelMap[state](label)}
    </Button>
  )
}
