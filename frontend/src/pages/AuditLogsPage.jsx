import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BarChart3, Info, SearchX } from 'lucide-react';
import { getAuditLogs } from '../api/auditLogs';
import { queryKeys } from '../lib/queryKeys';
import { getErrorMessage } from '../lib/errors';
import { pluralize } from '../lib/format';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Pagination } from '../components/ui/Pagination';
import { AuditLogFilters } from '../features/admin/AuditLogFilters';
import { AuditLogTable, AuditLogTableSkeleton } from '../features/admin/AuditLogTable';
import { AUDIT_PAGE_LIMIT } from '../features/admin/constants';

const EMPTY_FILTERS = { entityType: '', entityId: '', actorId: '' };

function toParams(filters, page) {
  const params = { page, limit: AUDIT_PAGE_LIMIT };
  if (filters.entityType) params.entityType = filters.entityType;
  if (filters.entityId) params.entityId = filters.entityId;
  if (filters.actorId) params.actorId = filters.actorId;
  return params;
}

export function AuditLogsPage() {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const params = toParams(filters, page);
  const { data, isPending, isFetching, error, refetch } = useQuery({
    queryKey: queryKeys.auditLogs(params),
    queryFn: () => getAuditLogs(params),
    placeholderData: keepPreviousData,
  });

  const applyFilters = (next) => {
    setFilters(next);
    setPage(1);
  };

  const logs = data?.logs ?? [];
  const hasFilters = Boolean(filters.entityType || filters.entityId || filters.actorId);

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-content">Audit logs</h1>
            <p className="text-sm text-muted">
              Every create, update and delete recorded against users, communities, posts, comments
              and votes.
            </p>
          </div>
          <Button as={Link} to="/admin" variant="outline" size="sm">
            <BarChart3 aria-hidden="true" className="size-4" />
            Activity insights
          </Button>
        </div>

        <Card className="flex items-start gap-2 p-3">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
          <p className="text-sm text-muted">
            The backend has no role system yet, so this log is readable by any logged-in account.
            Sensitive fields such as password hashes are redacted before they are written.
          </p>
        </Card>
      </header>

      <AuditLogFilters value={filters} onApply={applyFilters} loading={isFetching} />

      {error ? (
        <ErrorState
          title="Could not load audit logs"
          message={getErrorMessage(error)}
          onRetry={refetch}
        />
      ) : isPending ? (
        <AuditLogTableSkeleton />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={hasFilters ? 'No entries match these filters' : 'No audit entries yet'}
          description={
            hasFilters
              ? 'Try a different entity type, or clear the filters to see the most recent activity.'
              : 'Entries appear here as soon as something is created, updated or deleted.'
          }
          action={
            hasFilters ? (
              <Button variant="outline" size="sm" onClick={() => applyFilters(EMPTY_FILTERS)}>
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-4">
          <p aria-live="polite" className="text-sm text-muted">
            {pluralize(logs.length, 'entry', 'entries')} on page {page}
            {isFetching ? ' · updating…' : ''}
          </p>
          <AuditLogTable
            logs={logs}
            onFilterActor={(actorId) => applyFilters({ ...filters, actorId })}
          />
          <Pagination
            page={page}
            onPageChange={setPage}
            hasNext={logs.length === AUDIT_PAGE_LIMIT}
            loading={isFetching}
          />
        </div>
      )}
    </div>
  );
}
