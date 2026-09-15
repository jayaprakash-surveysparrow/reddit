import { useId, useState } from 'react';
import { FilterX, ListFilter } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../toast/toastContext';
import { AUDIT_ENTITY_TYPES, UUID_PATTERN } from './constants';

const EMPTY = { entityType: '', entityId: '', actorId: '' };

export function AuditLogFilters({ value = EMPTY, onApply, loading = false }) {
  const entityTypeId = useId();
  const entityIdId = useId();
  const actorIdId = useId();
  const { toast } = useToast();

  const [draft, setDraft] = useState(value);
  const [applied, setApplied] = useState(value);
  const [errors, setErrors] = useState({});

  // The actor filter can also be set from a table row, so reset the draft when
  // the applied filters change identity from outside this form.
  if (value !== applied) {
    setApplied(value);
    setDraft(value);
    setErrors({});
  }

  const setField = (field) => (event) => {
    setDraft((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const next = {
      entityType: draft.entityType.trim(),
      entityId: draft.entityId.trim(),
      actorId: draft.actorId.trim(),
    };
    const nextErrors = {};
    if (next.entityId && !UUID_PATTERN.test(next.entityId)) {
      nextErrors.entityId = 'Enter a full UUID, or leave this blank.';
    }
    if (next.actorId && !UUID_PATTERN.test(next.actorId)) {
      nextErrors.actorId = 'Enter a full UUID, or leave this blank.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Entity and actor IDs must be full UUIDs.');
      return;
    }

    setErrors({});
    onApply(next);
  };

  const hasFilters = Boolean(draft.entityType || draft.entityId || draft.actorId);

  return (
    <Card as="form" onSubmit={handleSubmit} className="p-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FormField label="Entity type" htmlFor={entityTypeId}>
          <Select
            id={entityTypeId}
            value={draft.entityType}
            onChange={setField('entityType')}
            className="w-full"
          >
            <option value="">All entity types</option>
            {AUDIT_ENTITY_TYPES.map((entityType) => (
              <option key={entityType} value={entityType}>
                {entityType}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          label="Entity ID"
          htmlFor={entityIdId}
          error={errors.entityId}
          hint="UUID of the changed record"
        >
          <Input
            id={entityIdId}
            value={draft.entityId}
            invalid={Boolean(errors.entityId)}
            onChange={setField('entityId')}
            placeholder="00000000-0000-0000-0000-000000000000"
            autoComplete="off"
            spellCheck="false"
            className="font-mono"
          />
        </FormField>

        <FormField
          label="Actor ID"
          htmlFor={actorIdId}
          error={errors.actorId}
          hint="UUID of the user who made the change"
        >
          <Input
            id={actorIdId}
            value={draft.actorId}
            invalid={Boolean(errors.actorId)}
            onChange={setField('actorId')}
            placeholder="00000000-0000-0000-0000-000000000000"
            autoComplete="off"
            spellCheck="false"
            className="font-mono"
          />
        </FormField>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm" loading={loading}>
          <ListFilter aria-hidden="true" className="size-4" />
          Apply filters
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={!hasFilters}
          onClick={() => {
            setDraft(EMPTY);
            setErrors({});
            onApply(EMPTY);
          }}
        >
          <FilterX aria-hidden="true" className="size-4" />
          Clear filters
        </Button>
      </div>
    </Card>
  );
}
