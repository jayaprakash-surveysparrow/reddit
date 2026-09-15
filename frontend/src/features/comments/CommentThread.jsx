import { Link, useLocation } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';
import { useAuth } from '../../auth/authContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { pluralize } from '../../lib/format';
import { CommentForm } from './CommentForm';
import { CommentNode } from './CommentNode';

export function CommentThread({ postId, comments = [], commentCount = 0 }) {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-content">
          {pluralize(commentCount || comments.length, 'comment')}
        </h2>
      </div>

      <div className="mt-3">
        {user ? (
          <CommentForm postId={postId} />
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-inset px-4 py-3">
            <p className="text-sm text-muted">Log in to leave a comment.</p>
            <Button as={Link} to="/login" state={{ from: location }} size="sm">
              Log in
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6">
        {comments.length ? (
          <div className="flex flex-col gap-5">
            {comments.map((comment) => (
              <CommentNode key={comment.id} comment={comment} postId={postId} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MessagesSquare aria-hidden="true" className="size-8 text-faint" />
            <p className="text-sm font-bold text-content">No comments yet</p>
            <p className="text-xs text-muted">Be the first to share what you think.</p>
          </div>
        )}
      </div>
    </Card>
  );
}
