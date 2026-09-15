import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';

export function CommentSkeletonList({ count = 3 }) {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="flex gap-2">
          <Skeleton className="size-5 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-40" />
            <SkeletonText lines={2} />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
