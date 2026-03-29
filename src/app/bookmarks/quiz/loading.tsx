export default function BookmarkQuizLoading() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-7 w-32 bg-muted rounded animate-pulse" />
        <div className="h-6 w-16 bg-muted rounded animate-pulse" />
      </div>
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-24 bg-muted rounded-full animate-pulse" />
        </div>
        <div className="h-5 w-full bg-muted rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
        <div className="space-y-2 pt-4">
          <div className="h-12 w-full bg-muted rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-muted rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-muted rounded-lg animate-pulse" />
          <div className="h-12 w-full bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </main>
  );
}
