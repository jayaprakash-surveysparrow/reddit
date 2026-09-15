import { useCallback, useEffect, useId, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, Plus, Search } from 'lucide-react';
import { listCommunities } from '../api/communities';
import { useAuth } from '../auth/authContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Input } from '../components/ui/Input';
import { Pagination } from '../components/ui/Pagination';
import { TwoColumn } from '../components/layout/TwoColumn';
import { CommunityCard, CommunityCardSkeletonList } from '../features/communities/CommunityCard';
import { normalizePage } from '../features/feed/sortOptions';
import { getErrorMessage } from '../lib/errors';
import { queryKeys } from '../lib/queryKeys';

const LIMIT = 20;
const DEBOUNCE_MS = 350;

export function CommunitiesPage() {
  const searchId = useId();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlQuery = searchParams.get('q') ?? '';
  const page = normalizePage(searchParams.get('page'));
  const [term, setTerm] = useState(urlQuery);

  useEffect(() => {
    setTerm(urlQuery);
  }, [urlQuery]);

  const updateParams = useCallback(
    (changes, options) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value && value !== '1') next.set(key, String(value));
          else next.delete(key);
        }
        return next;
      }, options);
    },
    [setSearchParams]
  );

  useEffect(() => {
    if (term.trim() === urlQuery.trim()) return undefined;
    const timer = setTimeout(
      () => updateParams({ q: term.trim(), page: '' }, { replace: true }),
      DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [term, urlQuery, updateParams]);

  const params = { page, limit: LIMIT, ...(urlQuery.trim() ? { q: urlQuery.trim() } : {}) };

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: queryKeys.communities(params),
    queryFn: () => listCommunities(params),
    placeholderData: (previous) => previous,
  });

  const communities = data?.communities ?? [];

  const rail = (
    <Card className="space-y-3 p-4">
      <h2 className="text-sm font-bold text-content">Start your own</h2>
      <p className="text-xs text-muted">
        Create a community around anything and invite people to post in it.
      </p>
      <Button as={Link} to={user ? '/create-community' : '/login'} className="w-full">
        <Plus aria-hidden="true" className="size-4" />
        Create community
      </Button>
    </Card>
  );

  return (
    <TwoColumn rail={rail}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-content">Explore communities</h1>
          <p className="text-sm text-muted">Ordered by member count.</p>
        </div>

        <Card className="p-3">
          <label htmlFor={searchId} className="sr-only">
            Search communities by name
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            />
            <Input
              id={searchId}
              type="search"
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search by community name"
              className="pl-9"
            />
          </div>
        </Card>

        {isPending ? (
          <CommunityCardSkeletonList />
        ) : error ? (
          <ErrorState
            title="Couldn't load communities"
            message={getErrorMessage(error)}
            onRetry={refetch}
          />
        ) : communities.length ? (
          <>
            <div
              aria-busy={isFetching || undefined}
              className={`flex flex-col gap-3 transition-opacity ${isFetching ? 'opacity-60' : ''}`}
            >
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} />
              ))}
            </div>
            <Pagination
              page={page}
              onPageChange={(next) => updateParams({ page: next })}
              hasNext={communities.length === LIMIT}
              loading={isFetching}
              className="py-2"
            />
          </>
        ) : (
          <EmptyState
            icon={Compass}
            title={urlQuery.trim() ? `No communities match "${urlQuery.trim()}"` : 'No communities yet'}
            description={
              urlQuery.trim()
                ? 'Search matches community names only, so try a shorter or different name.'
                : 'Be the first to create one.'
            }
            action={
              urlQuery.trim() ? (
                <Button variant="outline" onClick={() => updateParams({ q: '', page: '' })}>
                  Clear search
                </Button>
              ) : (
                <Button as={Link} to={user ? '/create-community' : '/login'}>
                  Create community
                </Button>
              )
            }
          />
        )}
      </div>
    </TwoColumn>
  );
}
