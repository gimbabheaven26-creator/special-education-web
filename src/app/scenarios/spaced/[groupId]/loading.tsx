import { Skeleton } from '@/components/ui/skeleton';

export default function ScenarioSpacedLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44 rounded-lg" />
        <Skeleton className="h-4 w-56 rounded" />
      </div>
      <Skeleton className="h-3 w-full rounded-full" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="flex justify-center gap-3">
        <Skeleton className="h-10 w-28 rounded-lg" />
        <Skeleton className="h-10 w-28 rounded-lg" />
      </div>
    </div>
  );
}
