import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      {/* Back link */}
      <Skeleton className="h-4 w-24 mb-4" />

      {/* Header */}
      <div className="mb-8 border-b border-border pb-4">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-7 w-32" />
        </div>
        <Skeleton className="h-4 w-40 mb-1" />
        <div className="flex gap-2 items-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>

      {/* Answer cards */}
      <div className="space-y-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1">
                <Skeleton className="h-5 w-24 mb-2 rounded-full" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
