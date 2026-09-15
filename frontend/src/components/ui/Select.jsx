import { forwardRef } from 'react';

export const Select = forwardRef(function Select({ className = '', children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={`h-9 rounded-md border border-line-strong bg-surface px-2 text-sm text-content transition-colors focus:border-ring ${className}`}
      {...props}
    >
      {children}
    </select>
  );
});
