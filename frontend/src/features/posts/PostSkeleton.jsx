import { Card } from '../../components/ui/Card';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';

export function PostSkeleton() {
  return (
    <Card className="flex overflow-hidden">
      <div className="flex w-10 shrink-0 flex-col items-center gap-2 bg-inset py-3">
        <Skeleton className="size-4" />
        <Skeleton className="h-3 w-5" />
        <Skeleton className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-2 p-3">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-4 w-3/4" />
        <SkeletonText lines={2} />
        <Skeleton className="h-3 w-32" />
      </div>
    </Card>
  );
}

export function PostSkeletonList({ count = 4 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}
