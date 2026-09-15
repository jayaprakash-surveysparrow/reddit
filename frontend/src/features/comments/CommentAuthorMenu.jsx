import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { deleteComment } from '../../api/comments';
import { useAuth } from '../../auth/authContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Menu, MenuItem } from '../../components/ui/Menu';
import { getErrorMessage } from '../../lib/errors';
import { queryKeys } from '../../lib/queryKeys';
import { useToast } from '../../toast/toastContext';

export function CommentAuthorMenu({ comment, postId, onEdit }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: () => deleteComment(comment.id),
    onSuccess: () => {
      toast.success('Comment deleted.');
      setConfirming(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (!user || !comment.author_id || user.id !== comment.author_id) return null;

  return (
    <>
      <Menu
        label="Comment options"
        trigger={
          <span className="flex items-center rounded px-1.5 py-1">
            <Ellipsis aria-hidden="true" className="size-4" />
          </span>
        }
      >
        <MenuItem icon={Pencil} onClick={onEdit}>
          Edit
        </MenuItem>
        <MenuItem icon={Trash2} danger onClick={() => setConfirming(true)}>
          Delete
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirming}
        title="Delete this comment?"
        description="The comment body is removed but its replies stay in the thread."
        confirmLabel="Delete"
        loading={mutation.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => mutation.mutate()}
      />
    </>
  );
}
