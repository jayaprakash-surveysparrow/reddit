import { ArrowBigUp, MessageSquare } from 'lucide-react';
import { absoluteTime, pluralize, relativeTime } from '../../lib/format';
import { MetaDot, ResultMeta, ResultRowLink } from './ResultList';

export function PostResultRow({ post }) {
  return (
    <ResultRowLink to={`/r/${post.community_name}/posts/${post.id}`}>
      <ResultMeta>
        <span className="font-bold text-content">r/{post.community_name}</span>
        <MetaDot />
        <span>u/{post.author_username}</span>
        <MetaDot />
        <time dateTime={post.created_at} title={absoluteTime(post.created_at)}>
          {relativeTime(post.created_at)}
        </time>
        {post.post_type === 'link' && (
          <span className="rounded-full bg-inset px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted uppercase">
            Link
          </span>
        )}
      </ResultMeta>

      <h3 className="mt-1 text-base leading-snug font-bold text-content">{post.title}</h3>

      {post.body && <p className="mt-1 line-clamp-2 text-sm text-muted">{post.body}</p>}

      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-muted">
        <span className="inline-flex items-center gap-1">
          <ArrowBigUp aria-hidden="true" className="size-4" />
          {pluralize(post.score, 'point')}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageSquare aria-hidden="true" className="size-4" />
          {pluralize(post.comment_count, 'comment')}
        </span>
      </p>
    </ResultRowLink>
  );
}
