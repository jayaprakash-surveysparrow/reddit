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

const schema = z.object({
  username: z.string().trim().min(1, 'Enter your username or email'),
  password: z.string().min(1, 'Enter your password'),
});

export function LoginPage() {
  const usernameId = useId();
  const passwordId = useId();
  const { login, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from;
  const target = from?.pathname && from.pathname !== '/login' ? from : null;
  const redirectTo = target ? `${target.pathname}${target.search ?? ''}` : '/';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { username: '', password: '' } });

  useEffect(() => {
    if (user) navigate(redirectTo, { replace: true });
  }, [user, navigate, redirectTo]);

  const onSubmit = async (values) => {
    try {
      const profile = await login({ username: values.username.trim(), password: values.password });
      toast.success(`Welcome back, u/${profile.username}.`);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Could not log you in.') });
    }
  };

  return (
    <AuthCard
      title="Log in"
      description="Use your username or email address."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-bold text-link hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {errors.root && <FormAlert>{errors.root.message}</FormAlert>}

        <FormField label="Username or email" htmlFor={usernameId} error={errors.username?.message}>
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

        <FormField label="Password" htmlFor={passwordId} error={errors.password?.message}>
          <PasswordInput
            id={passwordId}
            autoComplete="current-password"
            invalid={Boolean(errors.password)}
            {...register('password')}
          />
        </FormField>

        <div className="flex items-center justify-between">
          <Link to="/forgot-password" className="text-xs font-bold text-link hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={isSubmitting}>
          Log in
        </Button>
      </form>
    </AuthCard>
  );
}
