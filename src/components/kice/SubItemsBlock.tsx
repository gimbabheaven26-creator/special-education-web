import type { SubItem } from '@/types/kice'

interface SubItemsBlockProps {
  items: SubItem[]
}

export function SubItemsBlock({ items }: SubItemsBlockProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="rounded-lg border border-border/50 p-3">
          {(item.label || item.title) && (
            <div className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {item.label}{item.title ? ` — ${item.title}` : ''}
            </div>
          )}
          <SubItemContent content={item.content} />
        </div>
      ))}
    </div>
  )
}

function SubItemContent({ content }: { content: SubItem['content'] }) {
  if (typeof content === 'string') {
    return <p className="text-sm whitespace-pre-wrap text-foreground/90">{content}</p>
  }

  if (Array.isArray(content)) {
    return (
      <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
        {content.map((item, i) => (
          <li key={i} className="whitespace-pre-wrap">{String(item)}</li>
        ))}
      </ul>
    )
  }

  if (typeof content === 'object' && content !== null) {
    const obj = content as Record<string, unknown>

    // Table format: { columns, rows }
    if ('columns' in obj && 'rows' in obj) {
      return <TableContent columns={obj.columns as string[]} rows={obj.rows as Record<string, unknown>[]} />
    }

    // Key-value pairs
    return (
      <dl className="space-y-1 text-sm">
        {Object.entries(obj).map(([key, value]) => (
          <div key={key} className="flex gap-2">
            <dt className="font-medium text-muted-foreground shrink-0">{key}:</dt>
            <dd className="text-foreground/90 whitespace-pre-wrap">
              {typeof value === 'string' ? value : JSON.stringify(value)}
            </dd>
          </div>
        ))}
      </dl>
    )
  }

  return null
}

function TableContent({ columns, rows }: { columns: string[]; rows: Record<string, unknown>[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col} className="border border-border/50 bg-muted/50 px-2 py-1 text-left font-medium text-xs">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map(col => {
                const cellKey = col.replace(/\s/g, '')
                const value = row[cellKey] ?? row[col] ?? findValue(row, col)
                return (
                  <td key={col} className="border border-border/50 px-2 py-1 text-foreground/90">
                    {typeof value === 'string' ? value : JSON.stringify(value ?? '')}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function findValue(row: Record<string, unknown>, col: string): unknown {
  for (const [key, value] of Object.entries(row)) {
    if (key.includes(col) || col.includes(key)) return value
  }
  return ''
}
