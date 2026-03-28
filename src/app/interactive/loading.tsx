import { Skeleton } from '@/components/ui/skeleton';

export default function InteractiveLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-7 w-40 rounded-lg" />
      <Skeleton className="h-4 w-64 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-5 w-32 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
