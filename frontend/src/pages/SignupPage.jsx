import { useEffect, useId } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../auth/authContext';
import { Button } from '../components/ui/Button';
import { FormAlert } from '../components/ui/FormAlert';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { AuthCard } from '../features/auth/AuthCard';
import { getErrorMessage } from '../lib/errors';
import { useToast } from '../toast/toastContext';

// The API does no format or strength validation on signup, so these rules are
// enforced entirely here to stop unusable accounts being created.
const schema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Use at least 3 characters')
      .max(20, 'Use at most 20 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
    email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export function SignupPage() {
  const usernameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const { signup, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const target = from?.pathname && from.pathname !== '/signup' ? from : null;
  const redirectTo = target ? `${target.pathname}${target.search ?? ''}` : '/';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const onSubmit = async (values) => {
    try {
      const profile = await signup({
        username: values.username.trim(),
        email: values.email.trim(),
        password: values.password,
      });
      toast.success(`Welcome, u/${profile.username}.`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Could not create your account.') });
    }
  };

  return (
    <AuthCard
      title="Sign up"
      description="Join the conversation in a few seconds."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-link hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {errors.root && <FormAlert>{errors.root.message}</FormAlert>}

        <FormField
          label="Username"
          htmlFor={usernameId}
          error={errors.username?.message}
          hint="This is how people will see you, as u/username."
        >
          <Input
            id={usernameId}
            autoFocus
            autoComplete="username"
            autoCapitalize="none"
            spellCheck="false"
            invalid={Boolean(errors.username)}
            {...register('username')}
          />
        </FormField>

        <FormField label="Email" htmlFor={emailId} error={errors.email?.message}>
          <Input
            id={emailId}
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck="false"
            invalid={Boolean(errors.email)}
            {...register('email')}
          />
        </FormField>

        <FormField label="Password" htmlFor={passwordId} error={errors.password?.message}>
          <PasswordInput
            id={passwordId}
            autoComplete="new-password"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <FormField
          label="Confirm password"
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
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
