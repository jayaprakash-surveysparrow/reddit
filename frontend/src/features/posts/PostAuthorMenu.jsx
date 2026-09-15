import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ellipsis, Pencil, Trash2 } from 'lucide-react';
import { deletePost } from '../../api/posts';
import { useAuth } from '../../auth/authContext';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Menu, MenuItem } from '../../components/ui/Menu';
import { getErrorMessage } from '../../lib/errors';
import { queryKeys } from '../../lib/queryKeys';
import { useToast } from '../../toast/toastContext';

export function PostAuthorMenu({ post, onEdit, redirectAfterDelete = false }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const mutation = useMutation({
    mutationFn: () => deletePost(post.id),
    onSuccess: () => {
      toast.success('Post deleted.');
      setConfirming(false);
      queryClient.removeQueries({ queryKey: queryKeys.post(post.id) });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      if (redirectAfterDelete) {
        navigate(post.community_name ? `/r/${post.community_name}` : '/', { replace: true });
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  if (!user || !post.author_id || user.id !== post.author_id) return null;

  return (
    <>
      <Menu
        label="Post options"
        trigger={
          <span className="flex items-center gap-1 rounded px-2 py-1 text-xs font-bold">
            <Ellipsis aria-hidden="true" className="size-4" />
          </span>
        }
      >
        {onEdit && (
          <MenuItem icon={Pencil} onClick={onEdit}>
            Edit post
          </MenuItem>
        )}
        <MenuItem icon={Trash2} danger onClick={() => setConfirming(true)}>
          Delete post
        </MenuItem>
      </Menu>

      <ConfirmDialog
        open={confirming}
        title="Delete this post?"
        description="This removes the post for everyone. Its comments stay attached to the deleted post."
        confirmLabel="Delete"
        loading={mutation.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => mutation.mutate()}
      />
    </>
  );
}
