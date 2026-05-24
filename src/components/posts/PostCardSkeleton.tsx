import { Skeleton } from '@/components/ui/skeleton'

export default function PostCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border p-5">
      <Skeleton className="h-5 w-3/4" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-1/3" />
      <div className="mt-auto flex gap-2 pt-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}
