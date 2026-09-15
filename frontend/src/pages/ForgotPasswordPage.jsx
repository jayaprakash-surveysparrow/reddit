import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { forgotPassword } from '../api/auth';
import { Button } from '../components/ui/Button';
import { FormAlert } from '../components/ui/FormAlert';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { AuthCard } from '../features/auth/AuthCard';
import { getErrorMessage } from '../lib/errors';

const schema = z.object({
  email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email address'),
});

export function ForgotPasswordPage() {
  const emailId = useId();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = async (values) => {
    try {
      await forgotPassword({ email: values.email.trim() });
      setSent(true);
    } catch (error) {
      setError('root', { message: getErrorMessage(error, 'Could not send the reset email.') });
    }
  };

  return (
    <AuthCard
      title="Reset your password"
      description={
        sent ? undefined : 'We will email you a link if an account matches that address.'
      }
      footer={
        <Link to="/login" className="font-bold text-link hover:underline">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <div className="flex flex-col gap-4">
          <FormAlert tone="success">
            If an account exists for that address, a reset link is on its way. The link contains a
            token that expires, so use it soon.
          </FormAlert>
          <Button variant="outline" onClick={() => setSent(false)}>
            Send to a different address
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          {errors.root && <FormAlert>{errors.root.message}</FormAlert>}

          <FormField label="Email" htmlFor={emailId} error={errors.email?.message}>
            <Input
              id={emailId}
              type="email"
              autoFocus
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </FormField>

          <Button type="submit" size="lg" loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
