import { useCallback, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, PenLine, Rss } from 'lucide-react';
import { getFeed } from '../api/feed';
import { useAuth } from '../auth/authContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { TabPanel } from '../components/ui/Tabs';
import { TwoColumn } from '../components/layout/TwoColumn';
import { TopCommunitiesRail } from '../features/communities/TopCommunitiesRail';
import { SortTabs } from '../features/feed/SortTabs';
import { normalizePage, normalizeSort } from '../features/feed/sortOptions';
import { PostFeed } from '../features/posts/PostFeed';
import { queryKeys } from '../lib/queryKeys';
import { useUserState } from '../state/userStateContext';

const LIMIT = 20;

export function HomePage() {
  const { user, isLoading } = useAuth();
  const { noteMemberships } = useUserState();
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = normalizeSort(searchParams.get('sort'));
  const page = normalizePage(searchParams.get('page'));
  const params = { sort, page, limit: LIMIT };

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: queryKeys.feed(params),
    queryFn: () => getFeed(params),
    enabled: Boolean(user),
    placeholderData: (previous) => previous,
  });

  const posts = data?.posts ?? [];

  const feedCommunities = useMemo(
    () =>
      [...new Set((data?.posts ?? []).map((post) => post.community_name).filter(Boolean))].join(','),
    [data]
  );

  useEffect(() => {
    if (user && feedCommunities) noteMemberships(feedCommunities.split(','));
  }, [user, feedCommunities, noteMemberships]);

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

  const rail = (
    <>
      {user && (
        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-bold text-content">Got something to share?</h2>
          <p className="text-xs text-muted">
            Post in any community you have joined, or start a new one.
          </p>
          <div className="flex flex-col gap-2">
            <Button as={Link} to="/submit">
              <PenLine aria-hidden="true" className="size-4" />
              Create post
            </Button>
            <Button as={Link} to="/create-community" variant="outline">
              Create community
            </Button>
          </div>
        </Card>
      )}
      <TopCommunitiesRail />
    </>
  );

  if (!user && !isLoading) {
    return (
      <TwoColumn rail={rail}>
        <EmptyState
          icon={Rss}
          title="Your home feed is personalized"
          description="Log in to see posts from the communities you joined, or browse the communities first."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button as={Link} to="/login">
                Log in
              </Button>
              <Button as={Link} to="/communities" variant="outline">
                <Compass aria-hidden="true" className="size-4" />
                Browse communities
              </Button>
            </div>
          }
        />
      </TwoColumn>
    );
  }

  return (
    <TwoColumn rail={rail}>
      <div className="flex flex-col gap-3">
        <SortTabs
          value={sort}
          onChange={(next) => updateParams({ sort: next === 'hot' ? '' : next, page: '' })}
          idPrefix="home-sort"
        />

        <TabPanel idPrefix="home-sort" value={sort}>
          <PostFeed
            posts={posts}
            isPending={isPending || isLoading}
            isFetching={isFetching}
            error={error}
            onRetry={refetch}
            page={page}
            onPageChange={(next) => updateParams({ page: next })}
            hasNext={posts.length === LIMIT}
            emptyIcon={Compass}
            emptyTitle={page > 1 ? 'No more posts' : 'Your feed is empty'}
            emptyDescription={
              page > 1
                ? 'You have reached the end. Go back a page to keep reading.'
                : 'The feed only shows posts from communities you joined. Find a few communities to follow.'
            }
            emptyAction={
              page > 1 ? (
                <Button variant="outline" onClick={() => updateParams({ page: page - 1 })}>
                  Previous page
                </Button>
              ) : (
                <Button as={Link} to="/communities">
                  <Compass aria-hidden="true" className="size-4" />
                  Explore communities
                </Button>
              )
            }
          />
        </TabPanel>
      </div>
    </TwoColumn>
  );
}
