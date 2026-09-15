import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { compactNumber } from '../../lib/format';

export function StatTile({ icon: Icon, label, value }) {
  return (
    <Card className="flex items-center gap-3 p-4">
      {Icon && (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-inset text-muted">
          <Icon aria-hidden="true" className="size-5" />
        </span>
      )}
      <div className="min-w-0">
        <p className="text-xs font-bold tracking-wide text-muted uppercase">{label}</p>
        <p className="text-xl font-bold text-content">{compactNumber(value)}</p>
      </div>
    </Card>
  );
}

export function StatTileSkeleton() {
  return (
    <Card className="flex items-center gap-3 p-4">
      <Skeleton className="size-9 shrink-0" />
      <div className="w-full space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-12" />
      </div>
    </Card>
  );
}
