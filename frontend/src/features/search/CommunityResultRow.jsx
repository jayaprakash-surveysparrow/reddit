import { Avatar } from '../../components/ui/Avatar';
import { absoluteTime, pluralize, relativeTime } from '../../lib/format';
import { MetaDot, ResultMeta, ResultRowLink } from './ResultList';

export function CommunityResultRow({ community }) {
  return (
    <ResultRowLink to={`/r/${community.name}`}>
      <div className="flex items-start gap-3">
        <Avatar name={community.name} size="md" />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-content">r/{community.name}</h3>
          <ResultMeta>
            <span>{pluralize(community.member_count, 'member')}</span>
            <MetaDot />
            <span>
              created{' '}
              <time dateTime={community.created_at} title={absoluteTime(community.created_at)}>
                {relativeTime(community.created_at)}
              </time>
            </span>
          </ResultMeta>
          {community.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted">{community.description}</p>
          )}
        </div>
      </div>
    </ResultRowLink>
  );
}
