import { forwardRef } from 'react';

export const Textarea = forwardRef(function Textarea(
  { invalid = false, className = '', rows = 5, ...props },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={`w-full resize-y rounded-md border bg-surface px-3 py-2 text-sm leading-relaxed text-content transition-colors placeholder:text-faint focus:border-ring ${
        invalid ? 'border-danger' : 'border-line-strong'
      } ${className}`}
      {...props}
    />
  );
});
