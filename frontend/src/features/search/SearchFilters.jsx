import { FormField } from '../../components/ui/FormField';
import { Select } from '../../components/ui/Select';
import { SORT_OPTIONS, TIME_OPTIONS } from './searchOptions';

export function SearchFilters({ sort, time, onSortChange, onTimeChange, disabled = false }) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <FormField
        label="Sort by"
        htmlFor="search-sort"
        hint={sort === 'comments' ? 'Comment count only reorders the Posts results.' : undefined}
        className="min-w-40 flex-1 sm:max-w-56"
      >
        <Select
          id="search-sort"
          value={sort}
          disabled={disabled}
          onChange={(event) => onSortChange(event.target.value)}
          className="w-full"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField label="Time" htmlFor="search-time" className="min-w-32 flex-1 sm:max-w-44">
        <Select
          id="search-time"
          value={time}
          disabled={disabled}
          onChange={(event) => onTimeChange(event.target.value)}
          className="w-full"
        >
          {TIME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>
    </div>
  );
}
