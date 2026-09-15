import { Link } from 'react-router-dom';
import { CakeSlice, PenLine, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { absoluteTime, compactNumber, relativeTime } from '../../lib/format';

export function CommunityAbout({ community }) {
  return (
    <Card className="overflow-hidden">
      <h2 className="border-b border-line bg-inset px-4 py-2.5 text-xs font-bold tracking-wide text-muted uppercase">
        About r/{community.name}
      </h2>
      <div className="space-y-3 p-4">
        {community.description ? (
          <p className="text-sm whitespace-pre-line text-content">{community.description}</p>
        ) : (
          <p className="text-sm text-muted italic">No description yet.</p>
        )}

        <dl className="flex gap-6 border-t border-line pt-3">
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted">
              <Users aria-hidden="true" className="size-3.5" />
              Members
            </dt>
            <dd className="text-base font-bold text-content">
              {compactNumber(community.member_count ?? 0)}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-1 text-xs text-muted">
              <CakeSlice aria-hidden="true" className="size-3.5" />
              Created
            </dt>
            <dd className="text-sm font-bold text-content" title={absoluteTime(community.created_at)}>
              {relativeTime(community.created_at)}
            </dd>
          </div>
        </dl>

        <Button as={Link} to={`/r/${community.name}/submit`} className="w-full">
          <PenLine aria-hidden="true" className="size-4" />
          Create a post
        </Button>
      </div>
    </Card>
  );
}
