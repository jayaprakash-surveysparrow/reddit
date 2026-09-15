const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
];

export function relativeTime(value) {
  if (!value) return '';
  const seconds = (Date.parse(value) - Date.now()) / 1000;
  if (Number.isNaN(seconds)) return '';
  const magnitude = Math.abs(seconds);
  if (magnitude < 45) return 'just now';
  for (const [unit, size] of UNITS) {
    if (magnitude >= size) return rtf.format(Math.round(seconds / size), unit);
  }
  return rtf.format(Math.round(seconds), 'second');
}

export function absoluteTime(value) {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function compactNumber(value) {
  const n = Number(value) || 0;
  if (Math.abs(n) < 1000) return String(n);
  return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

export function pluralize(count, word, plural = `${word}s`) {
  return `${compactNumber(count)} ${Math.abs(Number(count) || 0) === 1 ? word : plural}`;
}
