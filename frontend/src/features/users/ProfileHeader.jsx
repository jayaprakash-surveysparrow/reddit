import { CakeSlice, Sparkles } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Card } from '../../components/ui/Card';
import { absoluteTime, compactNumber, relativeTime } from '../../lib/format';

export function ProfileHeader({ profile, isSelf = false }) {
  return (
    <Card className="overflow-hidden">
      <div aria-hidden="true" className="h-12 bg-brand" />
      <div className="flex flex-wrap items-end gap-3 px-4 pb-4">
        <span className="-mt-8">
          <Avatar name={profile.username} size="lg" className="border-4 border-surface" />
        </span>
        <div className="min-w-0 flex-1 pt-2">
          <h1 className="truncate text-xl font-bold text-content">u/{profile.username}</h1>
          {isSelf && profile.email && (
            <p className="truncate text-xs text-muted">{profile.email}</p>
          )}
        </div>
      </div>

      <dl className="flex gap-6 border-t border-line px-4 py-3">
        <div>
          <dt className="flex items-center gap-1 text-xs text-muted">
            <Sparkles aria-hidden="true" className="size-3.5" />
            Karma
          </dt>
          <dd className="text-base font-bold text-content">{compactNumber(profile.karma ?? 0)}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-xs text-muted">
            <CakeSlice aria-hidden="true" className="size-3.5" />
            Joined
          </dt>
          <dd className="text-sm font-bold text-content" title={absoluteTime(profile.created_at)}>
            {relativeTime(profile.created_at)}
          </dd>
        </div>
      </dl>
    </Card>
  );
}
