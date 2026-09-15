import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp } from 'lucide-react';
import { listCommunities } from '../../api/communities';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { pluralize } from '../../lib/format';
import { queryKeys } from '../../lib/queryKeys';
import { JoinCommunityButton } from './JoinCommunityButton';

const PARAMS = { limit: 5 };

export function TopCommunitiesRail() {
  const { data, isPending, error } = useQuery({
    queryKey: queryKeys.communities(PARAMS),
    queryFn: () => listCommunities(PARAMS),
    staleTime: 5 * 60_000,
  });

  if (error) return null;

  const communities = data?.communities ?? [];

  return (
    <Card className="overflow-hidden">
      <h2 className="flex items-center gap-2 border-b border-line bg-inset px-4 py-2.5 text-xs font-bold tracking-wide text-muted uppercase">
        <TrendingUp aria-hidden="true" className="size-3.5" />
        Top communities
      </h2>

      {isPending ? (
        <ul className="divide-y divide-line">
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className="flex items-center gap-3 px-4 py-2.5">
              <Skeleton className="size-7 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </li>
          ))}
        </ul>
      ) : communities.length ? (
        <ol className="divide-y divide-line">
          {communities.map((community, index) => (
            <li key={community.id} className="flex items-center gap-3 px-4 py-2.5">
              <span className="w-3 shrink-0 text-xs font-bold text-muted tabular-nums">
                {index + 1}
              </span>
              <span
                aria-hidden="true"
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
              >
                r
              </span>
              <span className="min-w-0 flex-1">
                <Link
                  to={`/r/${community.name}`}
                  className="block truncate text-sm font-bold text-content hover:text-link hover:underline"
                >
                  r/{community.name}
                </Link>
                <span className="text-xs text-muted">
                  {pluralize(community.member_count ?? 0, 'member')}
                </span>
              </span>
              <JoinCommunityButton name={community.name} />
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-4 py-4 text-sm text-muted">No communities exist yet.</p>
      )}

      <div className="border-t border-line p-3">
        <Button as={Link} to="/communities" variant="outline" className="w-full">
          See all communities
        </Button>
      </div>
    </Card>
  );
}
