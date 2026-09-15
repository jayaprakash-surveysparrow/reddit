import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { PostActions } from './PostActions';
import { PostAuthorMenu } from './PostAuthorMenu';
import { PostMeta } from './PostMeta';
import { PostVote } from './PostVote';
import { linkHost, postPath } from './paths';

export function PostCard({ post, showCommunity = true }) {
  return (
    <Card className="flex overflow-hidden transition-colors hover:border-line-strong">
      <div className="flex shrink-0 flex-col items-center bg-inset px-1 py-2">
        <PostVote post={post} />
      </div>

      <div className="min-w-0 flex-1 p-3">
        <PostMeta post={post} showCommunity={showCommunity} />

        <h3 className="mt-1 text-base leading-snug font-bold text-content">
          <Link to={postPath(post)} className="hover:text-link">
            {post.title}
          </Link>
        </h3>

        {post.post_type === 'link' && post.url ? (
          <a
            href={post.url}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 inline-flex max-w-full items-center gap-1 text-xs text-link hover:underline"
          >
            <span className="truncate">{linkHost(post.url)}</span>
            <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
          </a>
        ) : post.body ? (
          <p className="mt-1 line-clamp-3 text-sm whitespace-pre-line text-muted">{post.body}</p>
        ) : null}

        <div className="mt-2">
          <PostActions post={post}>
            <PostAuthorMenu post={post} />
          </PostActions>
        </div>
      </div>
    </Card>
  );
}
