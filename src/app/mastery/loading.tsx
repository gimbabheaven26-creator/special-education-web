import { Skeleton } from '@/components/ui/skeleton';

export default function MasteryLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <Skeleton className="h-7 w-40 rounded-lg" />
      <p className="text-xs text-muted-foreground animate-pulse">
        과목별 숙련도를 불러오고 있어요...
      </p>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="py-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
