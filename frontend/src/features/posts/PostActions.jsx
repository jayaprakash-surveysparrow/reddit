import { Link } from 'react-router-dom';
import { MessageSquare, Share2 } from 'lucide-react';
import { pluralize } from '../../lib/format';
import { useToast } from '../../toast/toastContext';
import { postPath } from './paths';

const ACTION_CLASS =
  'inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-bold text-muted transition-colors hover:bg-surface-hover hover:text-content';

export function PostActions({ post, children }) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}${postPath(post)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard.');
    } catch {
      toast.error('Your browser blocked copying. You can copy the address bar instead.');
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      <Link to={postPath(post)} className={ACTION_CLASS}>
        <MessageSquare aria-hidden="true" className="size-4" />
        {pluralize(post.comment_count ?? 0, 'comment')}
      </Link>
      <button type="button" onClick={handleShare} className={ACTION_CLASS}>
        <Share2 aria-hidden="true" className="size-4" />
        Share
      </button>
      {children}
    </div>
  );
}
