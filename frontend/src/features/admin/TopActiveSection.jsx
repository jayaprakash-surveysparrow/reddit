import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Hash, Inbox, Trophy, Users } from 'lucide-react';
import { getTopActive } from '../../api/admin';
import { queryKeys } from '../../lib/queryKeys';
import { compactNumber } from '../../lib/format';
import { getErrorMessage } from '../../lib/errors';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { BreakdownChips } from './BreakdownChips';
import { TOP_ACTIVE_LIMIT } from './constants';

function RankedRow({ rank, name, to, avatar, total, breakdown }) {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <span className="w-4 shrink-0 pt-0.5 text-sm font-bold text-faint tabular-nums">{rank}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {avatar}
          {to ? (
            <Link to={to} className="truncate text-sm font-bold text-content hover:underline">
              {name}
            </Link>
          ) : (
            <span className="truncate text-sm font-bold text-muted italic">{name}</span>
          )}
        </div>
        <div className="mt-1.5">
          <BreakdownChips breakdown={breakdown} />
        </div>
      </div>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-bold text-content tabular-nums">
          {compactNumber(total)}
        </span>
        <span className="block text-xs text-muted">events</span>
      </span>
    </li>
  );
}

function RankedRowSkeleton() {
  return (
    <li className="flex items-start gap-3 px-4 py-3">
      <Skeleton className="mt-0.5 h-3 w-4 shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <Skeleton className="h-8 w-10 shrink-0" />
    </li>
  );
}

function RankedCard({ icon: Icon, title, description, isPending, isEmpty, emptyLabel, children }) {
  return (
    <Card as="section" aria-label={title} className="overflow-hidden">
      <header className="flex items-start gap-2 border-b border-line px-4 py-3">
        <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-content">{title}</h3>
          <p className="text-xs text-muted">{description}</p>
        </div>
      </header>
      {isPending ? (
        <ul className="divide-y divide-line">
          {Array.from({ length: 3 }, (_, index) => (
            <RankedRowSkeleton key={index} />
          ))}
        </ul>
      ) : isEmpty ? (
        <div className="p-3">
          <EmptyState
            icon={Inbox}
            title={emptyLabel}
            description="Nothing was recorded in this time range. Try a wider one, such as all time."
          />
        </div>
      ) : (
        <ol className="divide-y divide-line">{children}</ol>
      )}
    </Card>
  );
}

export function TopActiveSection({ time }) {
  const params = { time, limit: TOP_ACTIVE_LIMIT };
  const { data, isPending, error, refetch } = useQuery({
    queryKey: queryKeys.adminTopActive(params),
    queryFn: () => getTopActive(params),
  });

  if (error) {
    return (
      <ErrorState
        title="Could not load the leaderboards"
        message={getErrorMessage(error)}
        onRetry={refetch}
      />
    );
  }

  const communities = data?.communities ?? [];
  const users = data?.users ?? [];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <RankedCard
        icon={Trophy}
        title="Most active communities"
        description={`Top ${TOP_ACTIVE_LIMIT} by posts, comments and votes combined`}
        isPending={isPending}
        isEmpty={communities.length === 0}
        emptyLabel="No community activity yet"
      >
        {communities.map((community, index) => (
          <RankedRow
            key={community.community_id ?? index}
            rank={index + 1}
            name={community.community_name ? `r/${community.community_name}` : 'Unknown community'}
            to={community.community_name ? `/r/${community.community_name}` : null}
            avatar={<Hash aria-hidden="true" className="size-4 shrink-0 text-muted" />}
            total={community.total}
            breakdown={community.breakdown}
          />
        ))}
      </RankedCard>

      <RankedCard
        icon={Users}
        title="Most active users"
        description={`Top ${TOP_ACTIVE_LIMIT} by posts, comments and votes combined`}
        isPending={isPending}
        isEmpty={users.length === 0}
        emptyLabel="No user activity yet"
      >
        {users.map((activeUser, index) => (
          <RankedRow
            key={activeUser.user_id ?? index}
            rank={index + 1}
            name={activeUser.username ? `u/${activeUser.username}` : 'Unknown user'}
            to={activeUser.username ? `/u/${activeUser.username}` : null}
            avatar={<Avatar name={activeUser.username ?? 'deleted'} size="sm" />}
            total={activeUser.total}
            breakdown={activeUser.breakdown}
          />
        ))}
      </RankedCard>
    </div>
  );
}
