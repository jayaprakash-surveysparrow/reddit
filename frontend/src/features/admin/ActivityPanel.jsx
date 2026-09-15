import { ArrowBigUp, CalendarOff, FileText, MessageSquare } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { absoluteTime, compactNumber } from '../../lib/format';
import { StatTile, StatTileSkeleton } from './StatTile';

const TILES = [
  { key: 'post_created', label: 'Posts', icon: FileText },
  { key: 'comment_created', label: 'Comments', icon: MessageSquare },
  { key: 'vote_cast', label: 'Votes', icon: ArrowBigUp },
];

function TimelineHead() {
  return (
    <thead>
      <tr className="border-b border-line text-left">
        <th scope="col" className="px-4 py-2 text-xs font-bold tracking-wide text-muted uppercase">
          Date
        </th>
        <th
          scope="col"
          className="px-4 py-2 text-right text-xs font-bold tracking-wide text-muted uppercase"
        >
          Posts
        </th>
        <th
          scope="col"
          className="px-4 py-2 text-right text-xs font-bold tracking-wide text-muted uppercase"
        >
          Comments
        </th>
        <th
          scope="col"
          className="px-4 py-2 text-right text-xs font-bold tracking-wide text-muted uppercase"
        >
          Votes
        </th>
      </tr>
    </thead>
  );
}

export function ActivityPanel({ subjectLabel, totals, timeline }) {
  const rows = timeline ?? [];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <StatTile
            key={tile.key}
            icon={tile.icon}
            label={tile.label}
            value={totals?.[tile.key] ?? 0}
          />
        ))}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={CalendarOff}
          title="No activity in this time range"
          description={`${subjectLabel} has no recorded events for the selected range. Try a wider range, such as all time.`}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="sr-only">Activity over time for {subjectLabel}</caption>
              <TimelineHead />
              <tbody className="divide-y divide-line">
                {rows.map((row) => (
                  <tr key={row.date} className="hover:bg-surface-hover">
                    <th
                      scope="row"
                      className="px-4 py-2 text-left font-normal whitespace-nowrap text-content"
                    >
                      {absoluteTime(row.date) || row.date}
                    </th>
                    <td className="px-4 py-2 text-right text-content tabular-nums">
                      {compactNumber(row.post_created)}
                    </td>
                    <td className="px-4 py-2 text-right text-content tabular-nums">
                      {compactNumber(row.comment_created)}
                    </td>
                    <td className="px-4 py-2 text-right text-content tabular-nums">
                      {compactNumber(row.vote_cast)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export function ActivityPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {TILES.map((tile) => (
          <StatTileSkeleton key={tile.key} />
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <caption className="sr-only">Loading activity over time</caption>
            <TimelineHead />
            <tbody className="divide-y divide-line">
              {Array.from({ length: 6 }, (_, index) => (
                <tr key={index}>
                  <td className="px-4 py-2">
                    <Skeleton className="h-3 w-28" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="ml-auto h-3 w-8" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="ml-auto h-3 w-8" />
                  </td>
                  <td className="px-4 py-2">
                    <Skeleton className="ml-auto h-3 w-8" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
