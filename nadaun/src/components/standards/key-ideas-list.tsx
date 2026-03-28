interface KeyIdeasListProps {
  ideas: string[]
}

export function KeyIdeasList({ ideas }: KeyIdeasListProps) {
  if (ideas.length === 0) return null

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">핵심 아이디어</h3>
      <ul className="space-y-2">
        {ideas.map((idea, i) => (
          <li key={i} className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed break-keep">
            {idea}
          </li>
        ))}
      </ul>
    </div>
  )
}
