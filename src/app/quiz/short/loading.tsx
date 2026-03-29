import { Skeleton } from '@/components/ui/skeleton';

export default function ShortQuizLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      {/* 제목 */}
      <Skeleton className="h-8 w-48 rounded-lg mb-2" />
      <Skeleton className="h-4 w-32 rounded mb-6" />

      {/* 진행 바 */}
      <Skeleton className="h-2 w-full rounded-full mb-8" />

      {/* 퀴즈 카드 */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border p-6 space-y-4">
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-10 w-full rounded-xl mt-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
