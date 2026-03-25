import { Skeleton } from '@/components/ui/skeleton';

export default function TermsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 헤더 */}
      <Skeleton className="h-8 w-40 rounded-lg mb-2" />
      <Skeleton className="h-4 w-56 rounded mb-6" />

      {/* 검색바 */}
      <Skeleton className="h-10 w-full rounded-full mb-6" />

      {/* 용어 카드 목록 */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border p-4 space-y-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-28 rounded" />
              <Skeleton className="h-4 w-16 rounded" />
            </div>
            <Skeleton className="h-4 w-full rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
