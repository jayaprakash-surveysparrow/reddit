import { useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { Info, ScrollText } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { FormField } from '../components/ui/FormField';
import { Select } from '../components/ui/Select';
import { useAuth } from '../auth/authContext';
import { ActivityLookupSection } from '../features/admin/ActivityLookupSection';
import { TopActiveSection } from '../features/admin/TopActiveSection';
import { TIME_OPTIONS } from '../features/admin/constants';

export function AdminPage() {
  const timeId = useId();
  const [time, setTime] = useState('week');
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-content">Activity insights</h1>
            <p className="text-sm text-muted">
              Site-wide leaderboards and per-subject activity, aggregated from posts, comments and
              votes.
            </p>
          </div>
          <Button as={Link} to="/audit-logs" variant="outline" size="sm">
            <ScrollText aria-hidden="true" className="size-4" />
            Audit logs
          </Button>
        </div>

        <Card className="flex items-start gap-2 p-3">
          <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-muted" />
          <p className="text-sm text-muted">
            These are account-wide insights, not a moderator view. The backend has no role system
            yet, so every one of these numbers is readable by any logged-in account
            {user?.username ? `, including yours (u/${user.username})` : ''}. Nothing here is
            restricted or private.
          </p>
        </Card>

        <Card className="p-3">
          <FormField label="Time range" htmlFor={timeId} className="sm:max-w-56">
            <Select
              id={timeId}
              value={time}
              onChange={(event) => setTime(event.target.value)}
              className="w-full"
            >
              {TIME_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormField>
        </Card>
      </header>

      <section aria-labelledby="top-active-heading" className="space-y-4">
        <div>
          <h2 id="top-active-heading" className="text-lg font-bold text-content">
            Most active
          </h2>
          <p className="text-sm text-muted">
            Ranked by total recorded events in the selected time range.
          </p>
        </div>
        <TopActiveSection time={time} />
      </section>

      <ActivityLookupSection time={time} />
    </div>
  );
}
