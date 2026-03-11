import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Back link */}
      <Skeleton className="h-4 w-24 mb-4" />

      {/* Worksheet header */}
      <div className="flex items-start justify-between mb-6 border-b border-border pb-4">
        <div>
          <Skeleton className="h-4 w-32 mb-1" />
          <Skeleton className="h-7 w-28 mb-2" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
        <Skeleton className="w-20 h-20 shrink-0 hidden sm:block" />
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1">
              <Skeleton className="h-5 w-24 mb-2 rounded-full" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-5/6 mb-3" />
              <Skeleton className="h-8 w-64" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
