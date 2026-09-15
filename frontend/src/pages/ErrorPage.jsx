import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Home, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ErrorState } from '../components/ui/ErrorState';
import { getErrorMessage } from '../lib/errors';

export function ErrorPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : getErrorMessage(error, error?.message || 'An unexpected error occurred.');

  return (
    <div className="mx-auto max-w-xl py-10">
      <ErrorState
        title="This page hit an error"
        message={message}
        onRetry={() => window.location.reload()}
        retryLabel="Reload page"
      />
      <div className="mt-4 flex justify-center gap-2">
        <Button as={Link} to="/" variant="outline" size="sm">
          <Home aria-hidden="true" className="size-4" />
          Back home
        </Button>
        <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
          <RotateCcw aria-hidden="true" className="size-4" />
          Go back
        </Button>
      </div>
    </div>
  );
}
