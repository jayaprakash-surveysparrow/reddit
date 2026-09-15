import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'bg-inset text-content hover:bg-surface-hover',
  outline: 'border border-line-strong text-content hover:bg-surface-hover',
  ghost: 'text-muted hover:bg-surface-hover hover:text-content',
  danger: 'bg-danger text-white hover:brightness-110',
};

const SIZES = {
  sm: 'h-7 gap-1.5 px-3 text-xs',
  md: 'h-9 gap-2 px-4 text-sm',
  lg: 'h-10 gap-2 px-5 text-sm',
};

export const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    className = '',
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <Component
      ref={ref}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 aria-hidden="true" className="size-4 animate-spin" />}
      {children}
    </Component>
  );
});
