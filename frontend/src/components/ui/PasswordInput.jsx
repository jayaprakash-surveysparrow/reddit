import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

export const PasswordInput = forwardRef(function PasswordInput(
  { invalid = false, className = '', ...props },
  ref
) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visible ? 'text' : 'password'}
        invalid={invalid}
        className={`pr-10 ${className}`}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className="absolute top-1/2 right-1 -translate-y-1/2 rounded p-1.5 text-muted transition-colors hover:bg-surface-hover hover:text-content"
      >
        {visible ? (
          <EyeOff aria-hidden="true" className="size-4" />
        ) : (
          <Eye aria-hidden="true" className="size-4" />
        )}
      </button>
    </div>
  );
});
