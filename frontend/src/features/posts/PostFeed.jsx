import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { getErrorMessage } from '../../lib/errors';
import { PostCard } from './PostCard';
import { PostSkeletonList } from './PostSkeleton';

export function PostFeed({
  posts,
  isPending,
  isFetching = false,
  error,
  onRetry,
  showCommunity = true,
  skeletonCount = 4,
  emptyIcon,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  page,
  onPageChange,
  hasNext = false,
}) {
  if (isPending) return <PostSkeletonList count={skeletonCount} />;

  if (error) {
    return (
      <ErrorState
        title="Couldn't load posts"
        message={getErrorMessage(error)}
        onRetry={onRetry}
      />
    );
  }

  if (!posts?.length) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        aria-busy={isFetching || undefined}
        className={`flex flex-col gap-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
      >
        {posts.map((post) => (
          <PostCard key={post.id} post={post} showCommunity={showCommunity} />
        ))}
      </div>
      {onPageChange && (
        <Pagination
          page={page}
          onPageChange={onPageChange}
          hasNext={hasNext}
          loading={isFetching}
          className="py-2"
        />
      )}
    </div>
  );
}
