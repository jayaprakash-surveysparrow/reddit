import { useId, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { getCommunityActivity, getUserActivity } from '../../api/admin';
import { queryKeys } from '../../lib/queryKeys';
import { getErrorMessage } from '../../lib/errors';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ActivityPanel, ActivityPanelSkeleton } from './ActivityPanel';
import { TIME_OPTIONS } from './constants';

export function ActivityLookupSection({ time }) {
  const kindId = useId();
  const nameId = useId();

  const [kind, setKind] = useState('community');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState({ kind: 'community', name: '' });
  const [formError, setFormError] = useState('');

  const isCommunity = submitted.kind === 'community';
  const hasSubject = submitted.name.length > 0;
  const params = { time };

  const communityQuery = useQuery({
    queryKey: queryKeys.adminCommunityActivity(submitted.name, params),
    queryFn: () => getCommunityActivity(submitted.name, params),
    enabled: hasSubject && isCommunity,
    retry: false,
  });

  const userQuery = useQuery({
    queryKey: queryKeys.adminUserActivity(submitted.name, params),
    queryFn: () => getUserActivity(submitted.name, params),
    enabled: hasSubject && !isCommunity,
    retry: false,
  });

  const active = isCommunity ? communityQuery : userQuery;
  const subjectLabel = isCommunity ? `r/${submitted.name}` : `u/${submitted.name}`;
  const timeLabel = TIME_OPTIONS.find((option) => option.value === time)?.label ?? time;

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError('Enter a community name or username to look up.');
      return;
    }
    setFormError('');
    setSubmitted({ kind, name: trimmed });
  };

  return (
    <section aria-labelledby="activity-lookup-heading" className="space-y-4">
      <div>
        <h2 id="activity-lookup-heading" className="text-lg font-bold text-content">
          Look up activity
        </h2>
        <p className="text-sm text-muted">
          Posts, comments and votes for a single community or user over the selected time range.
        </p>
      </div>

      <Card as="form" onSubmit={handleSubmit} className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <FormField label="Subject" htmlFor={kindId} className="sm:w-44">
            <Select
              id={kindId}
              value={kind}
              onChange={(event) => setKind(event.target.value)}
              className="w-full"
            >
              <option value="community">Community</option>
              <option value="user">User</option>
            </Select>
          </FormField>

          <FormField
            label={kind === 'community' ? 'Community name' : 'Username'}
            htmlFor={nameId}
            error={formError}
            hint={kind === 'community' ? 'For example: reactjs' : 'For example: ada'}
            className="min-w-0 flex-1"
          >
            <Input
              id={nameId}
              value={name}
              invalid={Boolean(formError)}
              onChange={(event) => {
                setName(event.target.value);
                if (formError) setFormError('');
              }}
              placeholder={kind === 'community' ? 'Community name' : 'Username'}
              autoComplete="off"
              spellCheck="false"
            />
          </FormField>

          <div className="sm:pt-6">
            <Button type="submit" loading={hasSubject && active.isFetching}>
              <Search aria-hidden="true" className="size-4" />
              Look up
            </Button>
          </div>
        </div>
      </Card>

      {!hasSubject ? (
        <EmptyState
          icon={Search}
          title="No subject selected yet"
          description="Pick a community or user, enter a name, and choose Look up to see their activity totals and timeline."
        />
      ) : active.isPending ? (
        <ActivityPanelSkeleton />
      ) : active.error ? (
        <ErrorState
          title={`Could not load activity for ${subjectLabel}`}
          message={getErrorMessage(active.error)}
          onRetry={active.refetch}
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted">
            Showing <span className="font-bold text-content">{subjectLabel}</span> &middot;{' '}
            {timeLabel}
          </p>
          <ActivityPanel
            subjectLabel={subjectLabel}
            totals={active.data?.totals}
            timeline={active.data?.timeline}
          />
        </div>
      )}
    </section>
  );
}
