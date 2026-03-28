import { Skeleton } from '@/components/ui/skeleton'

export default function DomainLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-24" />
        <Skeleton className="mt-3 h-8 w-40" />
        <Skeleton className="mt-2 h-5 w-32" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
