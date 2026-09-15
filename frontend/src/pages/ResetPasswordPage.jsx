import { useId } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { resetPassword } from '../api/auth';
import { Button } from '../components/ui/Button';
import { FormAlert } from '../components/ui/FormAlert';
import { FormField } from '../components/ui/FormField';
import { PasswordInput } from '../components/ui/PasswordInput';
import { AuthCard } from '../features/auth/AuthCard';
import { getErrorMessage } from '../lib/errors';
import { useToast } from '../toast/toastContext';

const schema = z
  .object({
    newPassword: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export function ResetPasswordPage() {
  const passwordId = useId();
  const confirmId = useId();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    try {
      await resetPassword({ token, newPassword: values.newPassword });
      toast.success('Password updated. You can log in now.');
      navigate('/login', { replace: true });
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Could not reset your password.') });
    }
  };

  if (!token) {
    return (
      <AuthCard
        title="Reset link is incomplete"
        footer={
          <Link to="/forgot-password" className="font-bold text-link hover:underline">
            Request a new link
          </Link>
        }
      >
        <FormAlert>
          This page needs the token from your reset email. Open the link from the email directly, or
          request a new one.
        </FormAlert>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Choose a new password"
      description="Pick something you haven't used here before."
      footer={
        <Link to="/login" className="font-bold text-link hover:underline">
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {errors.root && <FormAlert>{errors.root.message}</FormAlert>}

        <FormField label="New password" htmlFor={passwordId} error={errors.newPassword?.message}>
          <PasswordInput
            id={passwordId}
            autoFocus
            autoComplete="new-password"
            invalid={Boolean(errors.newPassword)}
            {...register('newPassword')}
          />
        </FormField>

        <FormField
          label="Confirm new password"
          htmlFor={confirmId}
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id={confirmId}
            autoComplete="new-password"
            invalid={Boolean(errors.confirmPassword)}
            {...register('confirmPassword')}
          />
        </FormField>

        <Button type="submit" size="lg" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </AuthCard>
  );
}
