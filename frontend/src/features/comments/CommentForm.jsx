import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createPostComment } from '../../api/posts';
import { updateComment } from '../../api/comments';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { getErrorMessage } from '../../lib/errors';
import { queryKeys } from '../../lib/queryKeys';
import { useToast } from '../../toast/toastContext';

const schema = z.object({
  body: z.string().trim().min(1, 'Write something first').max(10000, 'That comment is too long'),
});

export function CommentForm({
  postId,
  parentId = null,
  comment = null,
  placeholder = 'What are your thoughts?',
  submitLabel = 'Comment',
  autoFocus = false,
  onCancel,
  onDone,
}) {
  const isEdit = Boolean(comment);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { body: comment?.body ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (values) =>
      isEdit
        ? updateComment(comment.id, { body: values.body.trim() })
        : createPostComment(postId, {
            body: values.body.trim(),
            ...(parentId ? { parent_comment_id: parentId } : {}),
          }),
    onSuccess: () => {
      toast.success(isEdit ? 'Comment updated.' : 'Comment posted.');
      queryClient.invalidateQueries({ queryKey: queryKeys.post(postId) });
      if (!isEdit) reset({ body: '' });
      onDone?.();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const pending = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="flex flex-col gap-2">
      <Textarea
        rows={isEdit || parentId ? 3 : 4}
        autoFocus={autoFocus}
        placeholder={placeholder}
        invalid={Boolean(errors.body)}
        aria-label={isEdit ? 'Edit your comment' : 'Your comment'}
        {...register('body')}
      />
      {errors.body && <p className="text-xs text-danger">{errors.body.message}</p>}
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
        <Button type="submit" size="sm" loading={pending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
