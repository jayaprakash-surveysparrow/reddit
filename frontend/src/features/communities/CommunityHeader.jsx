import { Link } from 'react-router-dom';
import { PenLine } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { pluralize, relativeTime } from '../../lib/format';
import { JoinCommunityButton } from './JoinCommunityButton';

export function CommunityHeader({ community }) {
  return (
    <Card className="overflow-hidden">
      <div aria-hidden="true" className="h-14 bg-brand" />
      <div className="flex flex-wrap items-end gap-3 px-4 pb-3">
        <span
          aria-hidden="true"
          className="-mt-6 flex size-16 items-center justify-center rounded-full border-4 border-surface bg-brand text-2xl font-bold text-white"
        >
          r
        </span>
        <div className="min-w-0 flex-1 pt-2">
          <h1 className="truncate text-xl font-bold text-content">r/{community.name}</h1>
          <p className="text-xs text-muted">
            {pluralize(community.member_count ?? 0, 'member')} · created{' '}
            {relativeTime(community.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 pb-1">
          <JoinCommunityButton name={community.name} size="md" />
          <Button as={Link} to={`/r/${community.name}/submit`} variant="secondary" size="md">
            <PenLine aria-hidden="true" className="size-4" />
            Create post
          </Button>
        </div>
      </div>
      {community.description && (
        <p className="border-t border-line px-4 py-3 text-sm text-muted">{community.description}</p>
      )}
    </Card>
  );
}
