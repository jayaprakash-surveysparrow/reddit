import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';
import { getErrorMessage } from '../../lib/errors';
import { absoluteTime, compactNumber, relativeTime } from '../../lib/format';

export function UserCommentList({
  comments,
  username,
  isPending,
  isFetching = false,
  error,
  onRetry,
  page,
  onPageChange,
  hasNext = false,
}) {
  if (isPending) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="space-y-2 p-3">
            <Skeleton className="h-3 w-40" />
            <SkeletonText lines={2} />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Couldn't load comments"
        message={getErrorMessage(error)}
        onRetry={onRetry}
      />
    );
  }

  if (!comments?.length) {
    return (
      <EmptyState
        icon={MessageSquare}
        title="No comments yet"
        description={`u/${username} hasn't commented on anything.`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        aria-busy={isFetching || undefined}
        className={`flex flex-col gap-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
      >
        {comments.map((comment) => (
          <Card key={comment.id} className="p-3 transition-colors hover:border-line-strong">
            <div className="flex flex-wrap items-center gap-x-1.5 text-xs text-muted">
              <span className="font-bold text-content">u/{username}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={comment.created_at} title={absoluteTime(comment.created_at)}>
                {relativeTime(comment.created_at)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{compactNumber(comment.score ?? 0)} points</span>
            </div>
            <p
              className={`mt-1 text-sm whitespace-pre-line ${
                comment.deleted_at ? 'text-faint italic' : 'text-content'
              }`}
            >
              {comment.deleted_at ? '[deleted]' : comment.body}
            </p>
            <Link
              to={`/posts/${comment.post_id}`}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-link hover:underline"
            >
              <MessageSquare aria-hidden="true" className="size-3.5" />
              View in context
            </Link>
          </Card>
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
