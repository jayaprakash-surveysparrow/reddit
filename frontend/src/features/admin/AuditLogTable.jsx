import { Filter } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { IconButton } from '../../components/ui/IconButton';
import { Skeleton } from '../../components/ui/Skeleton';
import { absoluteTime, relativeTime } from '../../lib/format';

const ACTION_STYLES = {
  create: 'text-success',
  update: 'text-link',
  delete: 'text-danger',
};

const COLUMNS = ['Action', 'Entity', 'Actor', 'When', 'Changes'];

function shortId(id) {
  if (!id) return null;
  return id.length > 10 ? `${id.slice(0, 8)}…` : id;
}

function TableHead() {
  return (
    <thead>
      <tr className="border-b border-line text-left">
        {COLUMNS.map((column) => (
          <th
            key={column}
            scope="col"
            className="px-4 py-2 text-xs font-bold tracking-wide whitespace-nowrap text-muted uppercase"
          >
            {column}
          </th>
        ))}
      </tr>
    </thead>
  );
}

function ChangesCell({ changes }) {
  const isEmpty =
    changes === null ||
    changes === undefined ||
    (typeof changes === 'object' && Object.keys(changes).length === 0);

  if (isEmpty) return <span className="text-faint">No recorded fields</span>;

  return (
    <details>
      <summary className="cursor-pointer text-xs font-bold text-link">View JSON</summary>
      <div className="mt-2 max-h-64 max-w-[26rem] overflow-x-auto overflow-y-auto rounded border border-line bg-inset p-2">
        <pre className="text-xs leading-relaxed text-content">
          {JSON.stringify(changes, null, 2)}
        </pre>
      </div>
    </details>
  );
}

export function AuditLogTable({ logs, onFilterActor }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <caption className="sr-only">Audit log entries</caption>
          <TableHead />
          <tbody className="divide-y divide-line">
            {logs.map((log) => (
              <tr key={log.id} className="align-top hover:bg-surface-hover">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`rounded-full bg-inset px-2 py-0.5 text-xs font-bold ${
                      ACTION_STYLES[log.action] ?? 'text-content'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="block font-bold text-content">{log.entity_type}</span>
                  <span className="block font-mono text-xs text-muted" title={log.entity_id}>
                    {shortId(log.entity_id) ?? '—'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {log.actor_id ? (
                    <span className="inline-flex items-center gap-1">
                      <span className="font-mono text-xs text-content" title={log.actor_id}>
                        {shortId(log.actor_id)}
                      </span>
                      {onFilterActor && (
                        <IconButton
                          icon={Filter}
                          label={`Filter by actor ${log.actor_id}`}
                          size="sm"
                          onClick={() => onFilterActor(log.actor_id)}
                        />
                      )}
                    </span>
                  ) : (
                    <span className="text-faint">System</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-muted">
                  <time dateTime={log.created_at} title={absoluteTime(log.created_at)}>
                    {relativeTime(log.created_at)}
                  </time>
                </td>
                <td className="px-4 py-3">
                  <ChangesCell changes={log.changes} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AuditLogTableSkeleton({ rows = 8 }) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <caption className="sr-only">Loading audit log entries</caption>
          <TableHead />
          <tbody className="divide-y divide-line">
            {Array.from({ length: rows }, (_, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <Skeleton className="h-5 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-1.5 h-3 w-16" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-3 w-20" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-3 w-24" />
                </td>
                <td className="px-4 py-3">
                  <Skeleton className="h-3 w-20" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
