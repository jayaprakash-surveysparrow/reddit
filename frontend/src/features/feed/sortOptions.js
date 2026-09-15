import { Clock, Flame, TrendingUp } from 'lucide-react';

export const POST_SORTS = [
  { key: 'hot', label: 'Hot', icon: Flame },
  { key: 'top', label: 'Top', icon: TrendingUp },
  { key: 'new', label: 'New', icon: Clock },
];

export const POST_SORT_KEYS = POST_SORTS.map((sort) => sort.key);

export function normalizeSort(value) {
  return POST_SORT_KEYS.includes(value) ? value : 'hot';
}

export function normalizePage(value) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}
