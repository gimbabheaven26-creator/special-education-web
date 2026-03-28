import { Skeleton } from '@/components/ui/skeleton';

export default function CommunityLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <Skeleton className="h-7 w-40 rounded-lg" />
      <Skeleton className="h-4 w-64 rounded" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-4 w-72 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
