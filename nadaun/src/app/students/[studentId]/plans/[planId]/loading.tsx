import { Skeleton } from '@/components/ui/skeleton'

export default function PlanDetailLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-48 rounded-xl" />
      <div className="space-y-3">
        <Skeleton className="h-6 w-20" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
