import { Loader2 } from 'lucide-react';

export function Spinner({ label = 'Loading', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 aria-hidden="true" className="size-6 animate-spin text-muted" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
