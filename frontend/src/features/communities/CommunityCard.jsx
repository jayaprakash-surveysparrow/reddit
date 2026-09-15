import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton';
import { pluralize } from '../../lib/format';
import { JoinCommunityButton } from './JoinCommunityButton';

export function CommunityCard({ community }) {
  return (
    <Card className="flex items-center gap-3 p-3 transition-colors hover:border-line-strong">
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white"
      >
        r
      </span>
      <div className="min-w-0 flex-1">
        <Link
          to={`/r/${community.name}`}
          className="text-sm font-bold text-content hover:text-link hover:underline"
        >
          r/{community.name}
        </Link>
        <p className="text-xs text-muted">{pluralize(community.member_count ?? 0, 'member')}</p>
        {community.description && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{community.description}</p>
        )}
      </div>
      <JoinCommunityButton name={community.name} />
    </Card>
  );
}

export function CommunityCardSkeletonList({ count = 5 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, index) => (
        <Card key={index} className="flex items-center gap-3 p-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3 w-40" />
            <SkeletonText lines={1} />
          </div>
          <Skeleton className="h-7 w-16 rounded-full" />
        </Card>
      ))}
    </div>
  );
}
