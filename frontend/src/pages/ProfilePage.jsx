import { useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText, MessageSquare, PenLine, UserX } from 'lucide-react';
import { getUserComments, getUserPosts, getUserProfile } from '../api/users';
import { useAuth } from '../auth/authContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { TabPanel, Tabs } from '../components/ui/Tabs';
import { PostFeed } from '../features/posts/PostFeed';
import { ProfileHeader } from '../features/users/ProfileHeader';
import { UserCommentList } from '../features/users/UserCommentList';
import { normalizePage } from '../features/feed/sortOptions';
import { getErrorMessage, getErrorStatus } from '../lib/errors';
import { queryKeys } from '../lib/queryKeys';

const LIMIT = 20;
const TABS = [
  { key: 'posts', label: 'Posts', icon: FileText },
  { key: 'comments', label: 'Comments', icon: MessageSquare },
];
const TAB_KEYS = TABS.map((tab) => tab.key);

export function ProfilePage() {
  const { username } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get('tab');
  const tab = TAB_KEYS.includes(requestedTab) ? requestedTab : 'posts';
  const page = normalizePage(searchParams.get('page'));
  const params = { page, limit: LIMIT };

  const isSelf = Boolean(user && user.username?.toLowerCase() === username?.toLowerCase());

  const profileQuery = useQuery({
    queryKey: queryKeys.user(username),
    queryFn: () => getUserProfile(username),
  });

  const postsQuery = useQuery({
    queryKey: queryKeys.userPosts(username, params),
    queryFn: () => getUserPosts(username, params),
    enabled: tab === 'posts' && !profileQuery.isError,
    placeholderData: (previous) => previous,
  });

  const commentsQuery = useQuery({
    queryKey: queryKeys.userComments(username, params),
    queryFn: () => getUserComments(username, params),
    enabled: tab === 'comments' && !profileQuery.isError,
    placeholderData: (previous) => previous,
  });

  const updateParams = useCallback(
    (changes) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value && value !== '1' && value !== 'posts') next.set(key, String(value));
          else next.delete(key);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  if (profileQuery.isError) {
    return getErrorStatus(profileQuery.error) === 404 ? (
      <EmptyState
        icon={UserX}
        title={`u/${username} not found`}
        description="Nobody here goes by that name."
        action={
          <Button as={Link} to="/">
            Back home
          </Button>
        }
      />
    ) : (
      <ErrorState
        title="Couldn't load this profile"
        message={getErrorMessage(profileQuery.error)}
        onRetry={profileQuery.refetch}
      />
    );
  }

  const posts = postsQuery.data?.posts ?? [];
  const comments = commentsQuery.data?.comments ?? [];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      {profileQuery.isPending ? (
        <Card className="overflow-hidden">
          <Skeleton className="h-12 rounded-none" />
          <div className="flex items-end gap-3 px-4 pb-4">
            <Skeleton className="-mt-8 size-16 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2 pt-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
        </Card>
      ) : (
        <ProfileHeader profile={profileQuery.data} isSelf={isSelf} />
      )}

      <Card className="flex items-center justify-between gap-2 p-2">
        <Tabs
          items={TABS}
          value={tab}
          onChange={(next) => updateParams({ tab: next, page: '' })}
          label={`Activity by u/${username}`}
          idPrefix="profile"
        />
        {isSelf && (
          <Button as={Link} to="/submit" size="sm" variant="secondary">
            <PenLine aria-hidden="true" className="size-4" />
            New post
          </Button>
        )}
      </Card>

      <TabPanel idPrefix="profile" value={tab}>
        {tab === 'posts' ? (
          <PostFeed
            posts={posts}
            isPending={postsQuery.isPending}
            isFetching={postsQuery.isFetching}
            error={postsQuery.error}
            onRetry={postsQuery.refetch}
            page={page}
            onPageChange={(next) => updateParams({ tab, page: next })}
            hasNext={posts.length === LIMIT}
            emptyIcon={FileText}
            emptyTitle={page > 1 ? 'No more posts' : 'No posts yet'}
            emptyDescription={
              page > 1
                ? 'You have reached the end.'
                : isSelf
                  ? "You haven't posted anything yet."
                  : `u/${username} hasn't posted anything.`
            }
            emptyAction={
              isSelf && page === 1 ? (
                <Button as={Link} to="/submit">
                  <PenLine aria-hidden="true" className="size-4" />
                  Create your first post
                </Button>
              ) : null
            }
          />
        ) : (
          <UserCommentList
            comments={comments}
            username={username}
            isPending={commentsQuery.isPending}
            isFetching={commentsQuery.isFetching}
            error={commentsQuery.error}
            onRetry={commentsQuery.refetch}
            page={page}
            onPageChange={(next) => updateParams({ tab, page: next })}
            hasNext={comments.length === LIMIT}
          />
        )}
      </TabPanel>
    </div>
  );
}
