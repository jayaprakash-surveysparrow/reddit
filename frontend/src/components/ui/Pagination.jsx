import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ page, onPageChange, hasNext, loading = false, className = '' }) {
  if (page <= 1 && !hasNext) return null;
  return (
    <nav aria-label="Pagination" className={`flex items-center justify-center gap-3 ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || loading}
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        Previous
      </Button>
      <span className="text-xs font-bold text-muted">Page {page}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNext || loading}
      >
        Next
        <ChevronRight aria-hidden="true" className="size-4" />
      </Button>
    </nav>
  );
}
