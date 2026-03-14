export default function KiceLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-4 w-72 bg-muted/60 animate-pulse rounded" />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-8 w-14 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>

      <div className="h-10 w-full bg-muted/60 animate-pulse rounded-lg" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl ring-1 ring-foreground/10 p-4 space-y-3">
          <div className="flex gap-2">
            <div className="h-7 w-7 bg-muted animate-pulse rounded-full" />
            <div className="h-5 w-16 bg-muted animate-pulse rounded" />
            <div className="h-5 w-10 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted/40 animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-muted/40 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}
