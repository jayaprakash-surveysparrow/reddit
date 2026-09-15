import { forwardRef } from 'react';

export const Input = forwardRef(function Input({ invalid = false, className = '', ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={`h-9 w-full rounded-md border bg-surface px-3 text-sm text-content transition-colors placeholder:text-faint focus:border-ring ${
        invalid ? 'border-danger' : 'border-line-strong'
      } ${className}`}
      {...props}
    />
  );
});
