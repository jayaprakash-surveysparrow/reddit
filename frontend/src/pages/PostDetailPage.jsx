import { useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink, FileQuestion } from 'lucide-react';
import { getCommunity } from '../api/communities';
import { getPost } from '../api/posts';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { TwoColumn } from '../components/layout/TwoColumn';
import { CommentSkeletonList } from '../features/comments/CommentSkeleton';
import { CommentThread } from '../features/comments/CommentThread';
import { CommunityAbout } from '../features/communities/CommunityAbout';
import { PostActions } from '../features/posts/PostActions';
import { PostAuthorMenu } from '../features/posts/PostAuthorMenu';
import { PostForm } from '../features/posts/PostForm';
import { PostMeta } from '../features/posts/PostMeta';
import { PostVote } from '../features/posts/PostVote';
import { linkHost } from '../features/posts/paths';
import { getErrorMessage, getErrorStatus } from '../lib/errors';
import { queryKeys } from '../lib/queryKeys';

function PostDetailSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Card className="flex overflow-hidden">
        <div className="flex w-10 shrink-0 flex-col items-center gap-2 bg-inset py-4">
          <Skeleton className="size-5" />
          <Skeleton className="h-3 w-5" />
          <Skeleton className="size-5" />
        </div>
        <div className="min-w-0 flex-1 space-y-3 p-4">
          <Skeleton className="h-3 w-56" />
          <Skeleton className="h-6 w-4/5" />
          <SkeletonText lines={4} />
        </div>
      </Card>
      <Card className="p-4">
        <Skeleton className="h-3 w-28" />
        <div className="mt-4">
          <CommentSkeletonList />
        </div>
      </Card>
    </div>
  );
}

export function PostDetailPage() {
  const { postId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const editing = searchParams.get('edit') === '1';

  const { data: post, error, isPending, refetch } = useQuery({
    queryKey: queryKeys.post(postId),
    queryFn: () => getPost(postId),
  });

  const communityName = post?.community_name;

  const communityQuery = useQuery({
    queryKey: queryKeys.community(communityName),
    queryFn: () => getCommunity(communityName),
    enabled: Boolean(communityName),
  });

  const setEditing = useCallback(
    (next) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current);
          if (next) params.set('edit', '1');
          else params.delete('edit');
          return params;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  if (isPending) return <PostDetailSkeleton />;

  if (error) {
    return getErrorStatus(error) === 404 ? (
      <EmptyState
        icon={FileQuestion}
        title="This post is gone"
        description="It was deleted, or the link is wrong."
        action={
          <Button as={Link} to="/">
            Back home
          </Button>
        }
      />
    ) : (
      <ErrorState
        title="Couldn't load this post"
        message={getErrorMessage(error)}
        onRetry={refetch}
      />
    );
  }

  return (
    <TwoColumn rail={communityQuery.data ? <CommunityAbout community={communityQuery.data} /> : null}>
      <div className="flex flex-col gap-3">
        {communityName && (
          <Link
            to={`/r/${communityName}`}
            className="inline-flex w-fit items-center gap-1 text-xs font-bold text-muted hover:text-link hover:underline"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            Back to r/{communityName}
          </Link>
        )}

        {editing ? (
          <PostForm
            mode="edit"
            post={post}
            onCancel={() => setEditing(false)}
            onDone={() => setEditing(false)}
          />
        ) : (
          <Card className="flex overflow-hidden">
            <div className="flex shrink-0 flex-col items-center bg-inset px-1 py-3">
              <PostVote post={post} />
            </div>
            <div className="min-w-0 flex-1 p-4">
              <PostMeta post={post} />
              <h1 className="mt-1 text-xl leading-snug font-bold text-content">{post.title}</h1>

              {post.post_type === 'link' && post.url ? (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="mt-2 inline-flex max-w-full items-center gap-1 text-sm text-link hover:underline"
                >
                  <span className="truncate">{linkHost(post.url)}</span>
                  <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
                </a>
              ) : post.body ? (
                <p className="mt-2 text-sm whitespace-pre-line text-content">{post.body}</p>
              ) : null}

              <div className="mt-3">
                <PostActions post={post}>
                  <PostAuthorMenu post={post} onEdit={() => setEditing(true)} redirectAfterDelete />
                </PostActions>
              </div>
            </div>
          </Card>
        )}

        <CommentThread
          postId={postId}
          comments={post.comments ?? []}
          commentCount={post.comment_count}
        />
      </div>
    </TwoColumn>
  );
}
