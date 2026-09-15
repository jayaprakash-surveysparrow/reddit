import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Minus, Plus, Reply } from 'lucide-react';
import { useAuth } from '../../auth/authContext';
import { Avatar } from '../../components/ui/Avatar';
import { absoluteTime, relativeTime } from '../../lib/format';
import { useToast } from '../../toast/toastContext';
import { CommentAuthorMenu } from './CommentAuthorMenu';
import { CommentForm } from './CommentForm';
import { CommentVote } from './CommentVote';

const DEEP_NESTING_DEPTH = 5;

function countDescendants(comment) {
  const replies = comment.replies ?? [];
  return replies.reduce((total, reply) => total + 1 + countDescendants(reply), 0);
}

export function CommentNode({ comment, postId, depth = 0 }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [expandedDeep, setExpandedDeep] = useState(false);

  const replies = comment.replies ?? [];
  const deleted = Boolean(comment.deleted_at);
  const hiddenCount = countDescendants(comment);
  const deepCutoff = depth >= DEEP_NESTING_DEPTH && !expandedDeep;

  const handleReplyClick = () => {
    if (!user) {
      toast.info('Log in to join the conversation.');
      navigate('/login', { state: { from: location } });
      return;
    }
    setReplying((current) => !current);
  };

  return (
    <article className="flex gap-2">
      <div className="flex flex-col items-center gap-1">
        <Avatar name={comment.author_username || 'deleted'} size="xs" />
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse this thread"
            className="group flex flex-1 justify-center px-1"
          >
            <span aria-hidden="true" className="w-px flex-1 bg-line group-hover:bg-line-strong" />
          </button>
        )}
      </div>

      <div className="min-w-0 flex-1 pb-1">
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
          <button
            type="button"
            onClick={() => setCollapsed((current) => !current)}
            aria-expanded={!collapsed}
            aria-label={collapsed ? 'Expand this thread' : 'Collapse this thread'}
            className="rounded p-0.5 text-muted hover:bg-surface-hover hover:text-content"
          >
            {collapsed ? (
              <Plus aria-hidden="true" className="size-3" />
            ) : (
              <Minus aria-hidden="true" className="size-3" />
            )}
          </button>

          {comment.author_username ? (
            <Link
              to={`/u/${comment.author_username}`}
              className="font-bold text-content hover:text-link hover:underline"
            >
              u/{comment.author_username}
            </Link>
          ) : (
            <span className="font-bold text-faint">u/[deleted]</span>
          )}
          <span aria-hidden="true" className="text-muted">
            ·
          </span>
          <time
            dateTime={comment.created_at}
            title={absoluteTime(comment.created_at)}
            className="text-muted"
          >
            {relativeTime(comment.created_at)}
          </time>
          {collapsed && hiddenCount > 0 && (
            <span className="text-muted">
              ({hiddenCount} {hiddenCount === 1 ? 'reply' : 'replies'} hidden)
            </span>
          )}
        </div>

        {!collapsed && (
          <>
            {editing ? (
              <div className="mt-2">
                <CommentForm
                  postId={postId}
                  comment={comment}
                  submitLabel="Save changes"
                  autoFocus
                  onCancel={() => setEditing(false)}
                  onDone={() => setEditing(false)}
                />
              </div>
            ) : (
              <p
                className={`mt-1 text-sm whitespace-pre-line ${
                  deleted ? 'text-faint italic' : 'text-content'
                }`}
              >
                {deleted ? '[deleted]' : comment.body}
              </p>
            )}

            {!editing && !deleted && (
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <CommentVote comment={comment} />
                <button
                  type="button"
                  onClick={handleReplyClick}
                  className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-bold text-muted transition-colors hover:bg-surface-hover hover:text-content"
                >
                  <Reply aria-hidden="true" className="size-4" />
                  Reply
                </button>
                <CommentAuthorMenu
                  comment={comment}
                  postId={postId}
                  onEdit={() => setEditing(true)}
                />
              </div>
            )}

            {replying && (
              <div className="mt-2">
                <CommentForm
                  postId={postId}
                  parentId={comment.id}
                  placeholder={`Reply to u/${comment.author_username ?? '[deleted]'}`}
                  submitLabel="Reply"
                  autoFocus
                  onCancel={() => setReplying(false)}
                  onDone={() => setReplying(false)}
                />
              </div>
            )}

            {replies.length > 0 &&
              (deepCutoff ? (
                <button
                  type="button"
                  onClick={() => setExpandedDeep(true)}
                  className="mt-2 text-xs font-bold text-link hover:underline"
                >
                  Continue this thread ({hiddenCount} more{' '}
                  {hiddenCount === 1 ? 'reply' : 'replies'})
                </button>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {replies.map((reply) => (
                    <CommentNode
                      key={reply.id}
                      comment={reply}
                      postId={postId}
                      depth={depth + 1}
                    />
                  ))}
                </div>
              ))}
          </>
        )}
      </div>
    </article>
  );
}
