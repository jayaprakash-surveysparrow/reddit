import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createCommunity } from '../../api/communities';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { getErrorMessage, getErrorStatus } from '../../lib/errors';
import { useUserState } from '../../state/userStateContext';
import { useToast } from '../../toast/toastContext';

// The API accepts underscores when creating a community, but its :name route
// validator is alphanumeric-only, which makes such a community unreachable.
// Restricting the form to letters and numbers keeps every new community usable.
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Use at least 3 characters')
    .max(21, 'Use at most 21 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Letters and numbers only — no spaces, dashes or underscores'),
  description: z.string().trim().max(500, 'Keep the description under 500 characters').optional(),
});

export function CommunityForm() {
  const nameId = useId();
  const descriptionId = useId();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setMembership } = useUserState();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  });

  const name = watch('name') ?? '';

  const mutation = useMutation({
    mutationFn: (values) =>
      createCommunity({
        name: values.name.trim(),
        ...(values.description?.trim() ? { description: values.description.trim() } : {}),
      }),
    onSuccess: (community, values) => {
      const created = community?.name ?? values.name.trim();
      setMembership(created, true);
      queryClient.invalidateQueries({ queryKey: ['communities'] });
      toast.success(`r/${created} is live.`);
      navigate(`/r/${created}`);
    },
    onError: (error, values) => {
      if (getErrorStatus(error) === 409) {
        setError('name', { message: `r/${values.name.trim()} is already taken` });
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });

  const pending = isSubmitting || mutation.isPending;

  return (
    <Card className="p-5">
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4"
      >
        <FormField
          label="Community name"
          htmlFor={nameId}
          error={errors.name?.message}
          hint="Letters and numbers only, 3–21 characters. This becomes the permanent URL."
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-muted">r/</span>
            <Input
              id={nameId}
              autoFocus
              autoCapitalize="none"
              autoComplete="off"
              spellCheck="false"
              placeholder="cooking"
              invalid={Boolean(errors.name)}
              {...register('name')}
            />
          </div>
        </FormField>

        <FormField
          label="Description"
          htmlFor={descriptionId}
          error={errors.description?.message}
          hint="Optional. Tell people what this community is for."
        >
          <Textarea
            id={descriptionId}
            rows={4}
            placeholder="A place to share recipes and techniques."
            invalid={Boolean(errors.description)}
            {...register('description')}
          />
        </FormField>

        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <p className="text-xs text-muted">
            {name.trim() ? `Your community will live at /r/${name.trim()}` : 'Pick a name to continue'}
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate(-1)} disabled={pending}>
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              Create community
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
}
