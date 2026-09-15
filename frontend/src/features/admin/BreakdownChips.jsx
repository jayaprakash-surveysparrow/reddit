import { ACTIVITY_TYPES } from './constants';
import { compactNumber } from '../../lib/format';

const KNOWN_KEYS = new Set(ACTIVITY_TYPES.map((type) => type.key));

function labelFor(key) {
  const known = ACTIVITY_TYPES.find((type) => type.key === key);
  if (known) return known.short;
  return key.replace(/_/g, ' ');
}

export function BreakdownChips({ breakdown }) {
  const entries = Object.entries(breakdown ?? {});
  const ordered = [
    ...ACTIVITY_TYPES.filter((type) => type.key in (breakdown ?? {})).map((type) => [
      type.key,
      breakdown[type.key],
    ]),
    ...entries.filter(([key]) => !KNOWN_KEYS.has(key)),
  ];

  if (ordered.length === 0) return null;

  return (
    <ul className="flex flex-wrap items-center gap-1">
      {ordered.map(([key, count]) => (
        <li
          key={key}
          className="rounded-full bg-inset px-2 py-0.5 text-xs whitespace-nowrap text-muted"
        >
          <span className="font-bold text-content">{compactNumber(count)}</span> {labelFor(key)}
        </li>
      ))}
    </ul>
  );
}
