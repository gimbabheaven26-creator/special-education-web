import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityDetailLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-5 w-20 rounded" />
      <div className="space-y-3">
        <Skeleton className="h-7 w-3/4 rounded-lg" />
        <Skeleton className="h-4 w-40 rounded" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
