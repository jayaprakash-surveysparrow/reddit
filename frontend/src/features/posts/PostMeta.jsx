import { Link } from 'react-router-dom';
import { absoluteTime, relativeTime } from '../../lib/format';

export function PostMeta({ post, showCommunity = true, className = '' }) {
  const author = post.author_username;

  return (
    <div className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-muted ${className}`}>
      {showCommunity && post.community_name && (
        <>
          <Link
            to={`/r/${post.community_name}`}
            className="font-bold text-content hover:text-link hover:underline"
          >
            r/{post.community_name}
          </Link>
          <span aria-hidden="true">·</span>
        </>
      )}
      <span>
        Posted by{' '}
        {author ? (
          <Link to={`/u/${author}`} className="hover:text-link hover:underline">
            u/{author}
          </Link>
        ) : (
          <span className="text-faint">u/[deleted]</span>
        )}
      </span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.created_at} title={absoluteTime(post.created_at)}>
        {relativeTime(post.created_at)}
      </time>
    </div>
  );
}
