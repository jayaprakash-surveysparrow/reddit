import { ArrowBigUp, MessageSquare } from 'lucide-react';
import { absoluteTime, pluralize, relativeTime } from '../../lib/format';
import { MetaDot, ResultMeta, ResultRowLink } from './ResultList';

export function CommentResultRow({ comment }) {
  return (
    <ResultRowLink to={`/posts/${comment.post_id}`}>
      <ResultMeta>
        <MessageSquare aria-hidden="true" className="size-4" />
        <span className="font-bold text-content">u/{comment.author_username}</span>
        <span>commented</span>
        <MetaDot />
        <time dateTime={comment.created_at} title={absoluteTime(comment.created_at)}>
          {relativeTime(comment.created_at)}
        </time>
      </ResultMeta>

      <p className="mt-1 line-clamp-3 text-sm text-content">{comment.body}</p>

      <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-muted">
        <ArrowBigUp aria-hidden="true" className="size-4" />
        {pluralize(comment.score, 'point')}
      </p>
    </ResultRowLink>
  );
}
