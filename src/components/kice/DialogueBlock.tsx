import type { DialogueLine } from '@/types/kice'

interface DialogueBlockProps {
  lines: DialogueLine[]
}

export function DialogueBlock({ lines }: DialogueBlockProps) {
  const filtered = lines.filter(l => l.speaker && l.text)

  if (filtered.length === 0) return null

  return (
    <div className="space-y-2">
      {filtered.map((line, i) => (
        <div
          key={i}
          className={`rounded-lg px-3 py-2 text-sm ${
            i % 2 === 0
              ? 'bg-muted/50'
              : 'bg-muted/30'
          }`}
        >
          <span className="font-semibold text-foreground">{line.speaker}</span>
          <span className="text-muted-foreground mx-1">:</span>
          <span className="text-foreground/90 whitespace-pre-wrap">{line.text}</span>
        </div>
      ))}
    </div>
  )
}
