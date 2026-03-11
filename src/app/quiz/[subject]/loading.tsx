import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      {/* Progress dots */}
      <div className="flex gap-1.5 mb-6">
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="w-3 h-3 rounded-full" />
        ))}
      </div>

      {/* Question card */}
      <div className="rounded-xl border border-border p-6">
        <Skeleton className="h-5 w-24 mb-4" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-6 w-3/4 mb-6" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
