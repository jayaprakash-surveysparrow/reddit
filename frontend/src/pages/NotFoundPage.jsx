import { Link } from 'react-router-dom';
import { Compass, Home, SearchX } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      title="There's nothing here"
      description="This page doesn't exist, or the post or community it pointed to was removed."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Button as={Link} to="/">
            <Home aria-hidden="true" className="size-4" />
            Back home
          </Button>
          <Button as={Link} to="/communities" variant="outline">
            <Compass aria-hidden="true" className="size-4" />
            Browse communities
          </Button>
        </div>
      }
    />
  );
}
