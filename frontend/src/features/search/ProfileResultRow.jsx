import { Avatar } from '../../components/ui/Avatar';
import { absoluteTime, pluralize, relativeTime } from '../../lib/format';
import { MetaDot, ResultMeta, ResultRowLink } from './ResultList';

export function ProfileResultRow({ profile }) {
  return (
    <ResultRowLink to={`/u/${profile.username}`}>
      <div className="flex items-center gap-3">
        <Avatar name={profile.username} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold text-content">u/{profile.username}</h3>
          <ResultMeta>
            <span>{pluralize(profile.karma, 'karma', 'karma')}</span>
            <MetaDot />
            <span>
              joined{' '}
              <time dateTime={profile.created_at} title={absoluteTime(profile.created_at)}>
                {relativeTime(profile.created_at)}
              </time>
            </span>
          </ResultMeta>
        </div>
      </div>
    </ResultRowLink>
  );
}
