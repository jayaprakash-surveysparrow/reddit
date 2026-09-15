import { useCallback } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, PenLine } from 'lucide-react';
import { getCommunity, getCommunityPosts } from '../api/communities';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton, SkeletonText } from '../components/ui/Skeleton';
import { TabPanel } from '../components/ui/Tabs';
import { TwoColumn } from '../components/layout/TwoColumn';
import { CommunityAbout } from '../features/communities/CommunityAbout';
import { CommunityHeader } from '../features/communities/CommunityHeader';
import { SortTabs } from '../features/feed/SortTabs';
import { normalizePage, normalizeSort } from '../features/feed/sortOptions';
import { PostFeed } from '../features/posts/PostFeed';
import { getErrorMessage, getErrorStatus } from '../lib/errors';
import { queryKeys } from '../lib/queryKeys';

const LIMIT = 20;

function CommunityHeaderSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="h-14 rounded-none" />
      <div className="flex items-end gap-3 px-4 pb-4">
        <Skeleton className="-mt-6 size-16 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2 pt-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </Card>
  );
}

export function CommunityPage() {
  const { communityName } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = normalizeSort(searchParams.get('sort'));
  const page = normalizePage(searchParams.get('page'));
  const params = { sort, page, limit: LIMIT };

  const communityQuery = useQuery({
    queryKey: queryKeys.community(communityName),
    queryFn: () => getCommunity(communityName),
  });

  const postsQuery = useQuery({
    queryKey: queryKeys.communityPosts(communityName, params),
    queryFn: () => getCommunityPosts(communityName, params),
    enabled: !communityQuery.isError,
    placeholderData: (previous) => previous,
  });

  const updateParams = useCallback(
    (changes) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value && value !== '1') next.set(key, String(value));
          else next.delete(key);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  if (communityQuery.isError) {
    const notFound = getErrorStatus(communityQuery.error) === 404;
    return notFound ? (
      <EmptyState
        icon={Compass}
        title={`r/${communityName} doesn't exist`}
        description="The community may have been deleted, or the name might be misspelled. Community names are letters and numbers only."
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <Button as={Link} to="/communities">
              Browse communities
            </Button>
            <Button as={Link} to="/create-community" variant="outline">
              Create r/{communityName}
            </Button>
          </div>
        }
      />
    ) : (
      <ErrorState
        title="Couldn't load this community"
        message={getErrorMessage(communityQuery.error)}
        onRetry={communityQuery.refetch}
      />
    );
  }

  const community = communityQuery.data;
  const posts = postsQuery.data?.posts ?? [];

  return (
    <div className="flex flex-col gap-4">
      {communityQuery.isPending ? (
        <CommunityHeaderSkeleton />
      ) : (
        <CommunityHeader community={community} />
      )}

      <TwoColumn
        rail={
          communityQuery.isPending ? (
            <Card className="space-y-3 p-4">
              <Skeleton className="h-3 w-24" />
              <SkeletonText lines={3} />
            </Card>
          ) : (
            <CommunityAbout community={community} />
          )
        }
      >
        <div className="flex flex-col gap-3">
          <SortTabs
            value={sort}
            onChange={(next) => updateParams({ sort: next === 'hot' ? '' : next, page: '' })}
            idPrefix="community-sort"
          />

          <TabPanel idPrefix="community-sort" value={sort}>
            <PostFeed
              posts={posts}
              isPending={postsQuery.isPending}
              isFetching={postsQuery.isFetching}
              error={postsQuery.error}
              onRetry={postsQuery.refetch}
              showCommunity={false}
              page={page}
              onPageChange={(next) => updateParams({ page: next })}
              hasNext={posts.length === LIMIT}
              emptyIcon={PenLine}
              emptyTitle={page > 1 ? 'No more posts' : 'No posts yet'}
              emptyDescription={
                page > 1
                  ? 'You have reached the end of this community.'
                  : `Be the first to post in r/${communityName}.`
              }
              emptyAction={
                page > 1 ? (
                  <Button variant="outline" onClick={() => updateParams({ page: page - 1 })}>
                    Previous page
                  </Button>
                ) : (
                  <Button as={Link} to={`/r/${communityName}/submit`}>
                    <PenLine aria-hidden="true" className="size-4" />
                    Create a post
                  </Button>
                )
              }
            />
          </TabPanel>
        </div>
      </TwoColumn>
    </div>
  );
}
