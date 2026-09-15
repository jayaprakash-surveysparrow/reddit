import { Card } from '../../components/ui/Card';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';

function PostSkeletonRow() {
  return (
    <>
      <Skeleton className="h-3 w-48" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <SkeletonText lines={2} className="mt-2" />
      <div className="mt-3 flex gap-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </>
  );
}

function CommentSkeletonRow() {
  return (
    <>
      <Skeleton className="h-3 w-40" />
      <SkeletonText lines={2} className="mt-2" />
      <Skeleton className="mt-3 h-3 w-16" />
    </>
  );
}

function AvatarSkeletonRow({ lines }) {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-2 h-3 w-32" />
        {lines > 0 && <SkeletonText lines={lines} className="mt-2" />}
      </div>
    </div>
  );
}

const SHAPES = {
  posts: () => <PostSkeletonRow />,
  comments: () => <CommentSkeletonRow />,
  communities: () => <AvatarSkeletonRow lines={2} />,
  profiles: () => <AvatarSkeletonRow lines={0} />,
};

export function SearchResultSkeleton({ kind = 'posts', rows = 4 }) {
  const renderShape = SHAPES[kind] ?? SHAPES.posts;
  return (
    <Card className="overflow-hidden" aria-busy="true" aria-label="Loading results">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="border-b border-line px-3 py-3 last:border-b-0 sm:px-4">
          {renderShape()}
        </div>
      ))}
    </Card>
  );
}

const PREVIEW_KINDS = ['posts', 'communities'];

export function SearchSkeletonPanel({ kind = 'all' }) {
  if (kind !== 'all') return <SearchResultSkeleton kind={kind} rows={4} />;

  return (
    <div className="flex flex-col gap-6">
      {PREVIEW_KINDS.map((previewKind) => (
        <div key={previewKind}>
          <Skeleton className="mb-2 h-4 w-28" />
          <SearchResultSkeleton kind={previewKind} rows={3} />
        </div>
      ))}
    </div>
  );
}
