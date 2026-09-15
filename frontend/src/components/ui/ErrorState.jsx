import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center gap-3 rounded-md border border-line bg-surface px-6 py-10 text-center ${className}`}
    >
      <span className="flex size-11 items-center justify-center rounded-full bg-inset text-danger">
        <TriangleAlert aria-hidden="true" className="size-5" />
      </span>
      <div className="space-y-1">
        <p className="text-base font-bold text-content">{title}</p>
        {message && <p className="mx-auto max-w-sm text-sm text-muted">{message}</p>}
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCcw aria-hidden="true" className="size-4" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
