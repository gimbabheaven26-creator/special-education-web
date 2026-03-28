import { Skeleton } from '@/components/ui/skeleton'

export default function SubjectLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-32" />
        <Skeleton className="mt-2 h-5 w-48" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
