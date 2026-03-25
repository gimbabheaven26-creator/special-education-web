import { Skeleton } from '@/components/ui/skeleton';

export default function KiceLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 rounded-lg" />
        <Skeleton className="h-4 w-72 rounded" />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-14 rounded-lg" />
        ))}
      </div>

      <Skeleton className="h-10 w-full rounded-lg" />

      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl ring-1 ring-foreground/10 p-4 space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-5 w-16 rounded" />
            <Skeleton className="h-5 w-10 rounded" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
