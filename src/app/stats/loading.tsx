import { Skeleton } from '@/components/ui/skeleton';

export default function StatsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-7 w-40 rounded-lg" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
