import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';

export function ResultList({ label, children }) {
  return (
    <Card as="ul" aria-label={label} className="overflow-hidden">
      {children}
    </Card>
  );
}

export function ResultRowLink({ to, children }) {
  return (
    <li className="border-b border-line last:border-b-0">
      <Link
        to={to}
        className="block px-3 py-3 transition-colors hover:bg-surface-hover sm:px-4"
      >
        {children}
      </Link>
    </li>
  );
}

export function ResultMeta({ children }) {
  return (
    <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted">{children}</p>
  );
}

export function MetaDot() {
  return <span aria-hidden="true">·</span>;
}
