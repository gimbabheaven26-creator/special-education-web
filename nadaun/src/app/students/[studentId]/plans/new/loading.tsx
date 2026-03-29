import { Skeleton } from '@/components/ui/skeleton'

export default function NewPlanLoading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-5 w-24" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-32 rounded-lg border border-dashed" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}
