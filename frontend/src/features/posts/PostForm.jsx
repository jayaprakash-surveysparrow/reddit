import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Link2 } from 'lucide-react';
import { createCommunityPost } from '../../api/communities';
import { updatePost } from '../../api/posts';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { Textarea } from '../../components/ui/Textarea';
import { getErrorMessage, getErrorStatus } from '../../lib/errors';
import { queryKeys } from '../../lib/queryKeys';
import { useToast } from '../../toast/toastContext';
import { JoinCommunityButton } from '../communities/JoinCommunityButton';
import { isHttpUrl } from './paths';
import { Controller } from 'react-hook-form';
import { CommunityAutocompleteField } from '../communities/CommunityAutocompleteField';
const TYPE_ITEMS = [
  { key: 'text', label: 'Text', icon: FileText },
  { key: 'link', label: 'Link', icon: Link2 },
];

const TITLE_LIMIT = 300;

const titleField = z
  .string()
  .trim()
  .min(1, 'Please add a title')
  .max(TITLE_LIMIT, `Titles are limited to ${TITLE_LIMIT} characters`);

const linkRefinement = [
  (values) => values.post_type !== 'link' || isHttpUrl(values.url),
  { path: ['url'], message: 'A link post needs a valid http(s) URL' },
];

const createSchema = z
  .object({
    community: z
      .string()
      .trim()
      .min(3, 'Community names are at least 3 characters')
      .max(21, 'Community names are at most 21 characters')
      .regex(/^[a-zA-Z0-9]+$/, 'Letters and numbers only'),
    post_type: z.enum(['text', 'link']),
    title: titleField,
    body: z.string().optional(),
    url: z.string().optional(),
  })
  .refine(...linkRefinement);

const editSchema = z
  .object({
    post_type: z.enum(['text', 'link']),
    title: titleField,
    body: z.string().optional(),
    url: z.string().optional(),
  })
  .refine(...linkRefinement);

export function PostForm({
  mode = 'create',
  post,
  defaultCommunity = '',
  lockCommunity = false,
  onCancel,
  onDone,
}) {
  const isEdit = mode === 'edit';
  const communityId = useId();
  const titleId = useId();
  const bodyId = useId();
  const urlId = useId();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [joinPrompt, setJoinPrompt] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: isEdit
      ? {
          post_type: post.post_type ?? 'text',
          title: post.title ?? '',
          body: post.body ?? '',
          url: post.url ?? '',
        }
      : { community: defaultCommunity, post_type: 'text', title: '', body: '', url: '' },
  });

  const postType = watch('post_type');
  const title = watch('title') ?? '';

  const mutation = useMutation({
    mutationFn: (values) => {
      const trimmedTitle = values.title.trim();
      if (isEdit) {
        return updatePost(
          post.id,
          values.post_type === 'link'
            ? { title: trimmedTitle, url: values.url.trim() }
            : { title: trimmedTitle, body: values.body?.trim() ? values.body.trim() : null }
        );
      }
      const payload =
        values.post_type === 'link'
          ? { title: trimmedTitle, post_type: 'link', url: values.url.trim() }
          : {
              title: trimmedTitle,
              post_type: 'text',
              body: values.body?.trim() ? values.body.trim() : null,
            };
      return createCommunityPost(values.community.trim(), payload);
    },
    onSuccess: (result, values) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });

      if (isEdit) {
        queryClient.invalidateQueries({ queryKey: queryKeys.post(post.id) });
        toast.success('Post updated.');
        onDone?.(result);
        return;
      }

      const community = values.community.trim();
      toast.success('Your post is live.');
      navigate(result?.id ? `/r/${community}/posts/${result.id}` : `/r/${community}`);
    },
    onError: (error, values) => {
      const status = getErrorStatus(error);
      const message = getErrorMessage(error);

      if (!isEdit && status === 403) {
        setJoinPrompt(values.community.trim());
        return;
      }
      if (!isEdit && status === 404) {
        setError('community', { message: `r/${values.community.trim()} doesn't exist yet` });
        return;
      }
      toast.error(message);
    },
  });

  const pending = isSubmitting || mutation.isPending;

  return (
    <Card className="p-5">
      <form
        onSubmit={handleSubmit((values) => {
          setJoinPrompt(null);
          mutation.mutate(values);
        })}
        className="flex flex-col gap-4"
      >
        {!isEdit &&
          (lockCommunity ? (
            <>
              <input type="hidden" {...register('community')} />
              <div className="flex items-center gap-2 rounded-md border border-line bg-inset px-3 py-2">
                <span
                  aria-hidden="true"
                  className="flex size-6 items-center justify-center rounded-full bg-brand text-xs font-bold text-white"
                >
                  r
                </span>
                <span className="text-sm font-bold text-content">r/{defaultCommunity}</span>
              </div>
            </>
          ) : (
            <FormField
              label="Community"
              htmlFor={communityId}
              error={errors.community?.message}
              hint="You have to be a member of the community to post in it."
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted">r/</span>
                <Controller
                  name="community"
                  control={control}
                  render={({ field }) => (
                    <CommunityAutocompleteField
                      id={communityId}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      invalid={Boolean(errors.community)}
                      placeholder="technology"
                    />
                  )}
                />
              </div>
            </FormField>
          ))}

        {joinPrompt && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-line bg-inset px-4 py-3">
            <p className="text-sm text-content">
              Join <span className="font-bold">r/{joinPrompt}</span> before posting there.
            </p>
            <JoinCommunityButton name={joinPrompt} />
          </div>
        )}

        <div>
          <input type="hidden" {...register('post_type')} />
          <Tabs
            items={TYPE_ITEMS}
            value={postType}
            onChange={(next) => setValue('post_type', next, { shouldValidate: false })}
            label="Post type"
            idPrefix="post-type"
          />
        </div>

        <FormField label="Title" htmlFor={titleId} error={errors.title?.message}>
          <Input
            id={titleId}
            autoFocus={!isEdit}
            placeholder="An interesting title"
            maxLength={TITLE_LIMIT}
            invalid={Boolean(errors.title)}
            {...register('title')}
          />
          <p className="self-end text-xs text-faint tabular-nums">
            {title.trim().length}/{TITLE_LIMIT}
          </p>
        </FormField>

        {postType === 'link' ? (
          <FormField label="URL" htmlFor={urlId} error={errors.url?.message}>
            <Input
              id={urlId}
              type="url"
              inputMode="url"
              placeholder="https://example.com/article"
              invalid={Boolean(errors.url)}
              {...register('url')}
            />
          </FormField>
        ) : (
          <FormField
            label="Text"
            htmlFor={bodyId}
            error={errors.body?.message}
            hint="Optional for text posts."
          >
            <Textarea
              id={bodyId}
              rows={8}
              placeholder="Share your thoughts…"
              invalid={Boolean(errors.body)}
              {...register('body')}
            />
          </FormField>
        )}

        <div className="flex justify-end gap-2 border-t border-line pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel ?? (() => navigate(-1))}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" loading={pending}>
            {isEdit ? 'Save changes' : 'Post'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
