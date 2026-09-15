import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FileText,
  LayoutList,
  Loader2,
  MessageSquare,
  Search,
  SearchX,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import { search } from '../api/search';
import { getErrorMessage } from '../lib/errors';
import { compactNumber, pluralize } from '../lib/format';
import { queryKeys } from '../lib/queryKeys';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { IconButton } from '../components/ui/IconButton';
import { Input } from '../components/ui/Input';
import { TabPanel, Tabs } from '../components/ui/Tabs';
import { SearchFilters } from '../features/search/SearchFilters';
import { SORT_OPTIONS, TIME_OPTIONS } from '../features/search/searchOptions';
import { SearchResultGroup } from '../features/search/SearchResultGroup';
import { SearchSkeletonPanel } from '../features/search/SearchResultSkeleton';

const DEBOUNCE_MS = 350;
const RESULT_LIMIT = 25;
const PREVIEW_COUNT = 5;
const MAX_QUERY_LENGTH = 200;
const ID_PREFIX = 'search';

const GROUPS = [
  { key: 'posts', label: 'Posts', heading: 'Posts', icon: FileText },
  { key: 'communities', label: 'Communities', heading: 'Communities', icon: Users },
  { key: 'comments', label: 'Comments', heading: 'Comments', icon: MessageSquare },
  { key: 'profiles', label: 'People', heading: 'People', icon: UserRound },
];

const SORT_VALUES = SORT_OPTIONS.map((option) => option.value);
const TIME_VALUES = TIME_OPTIONS.map((option) => option.value);
const EMPTY_RESULTS = { posts: [], communities: [], comments: [], profiles: [] };

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);

  const urlTerm = (searchParams.get('q') ?? '').slice(0, MAX_QUERY_LENGTH);
  const sortParam = searchParams.get('sort');
  const timeParam = searchParams.get('time');
  const sort = SORT_VALUES.includes(sortParam) ? sortParam : 'relevance';
  const time = TIME_VALUES.includes(timeParam) ? timeParam : 'all';

  const [term, setTerm] = useState(urlTerm);
  const [activeTab, setActiveTab] = useState('all');
  const committedRef = useRef(urlTerm);

  const typedQuery = term.trim();
  const activeQuery = urlTerm.trim();
  const enabled = activeQuery.length > 0;

  const updateParams = useCallback(
    (changes, options) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        for (const [key, value] of Object.entries(changes)) {
          if (value) next.set(key, value);
          else next.delete(key);
        }
        return next;
      }, options);
    },
    [setSearchParams]
  );

  const commitTerm = useCallback(
    (value) => {
      const trimmed = value.trim();
      committedRef.current = trimmed;
      updateParams({ q: trimmed }, { replace: true });
    },
    [updateParams]
  );

  // The URL moved on its own (navbar search, back/forward): adopt it into the input.
  useEffect(() => {
    if (urlTerm !== committedRef.current) {
      committedRef.current = urlTerm;
      setTerm(urlTerm);
    }
  }, [urlTerm]);

  useEffect(() => {
    if (typedQuery === activeQuery) return undefined;
    const timer = setTimeout(() => commitTerm(typedQuery), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [typedQuery, activeQuery, commitTerm]);

  const params = useMemo(
    () => ({ q: activeQuery, sort, time, limit: RESULT_LIMIT }),
    [activeQuery, sort, time]
  );

  const { data, error, isPending, isFetching, refetch } = useQuery({
    queryKey: queryKeys.search(params),
    queryFn: () => search(params),
    enabled,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
  });

  const results = data ?? EMPTY_RESULTS;
  const groups = GROUPS.map((group) => ({
    ...group,
    items: Array.isArray(results[group.key]) ? results[group.key] : [],
  }));
  const totalCount = groups.reduce((sum, group) => sum + group.items.length, 0);

  const hasResults = Boolean(data) && !error;
  const isDebouncing = enabled && typedQuery !== activeQuery;
  const busy = enabled && (isFetching || isDebouncing);
  const filtersActive = sort !== 'relevance' || time !== 'all';

  const tabItems = [
    {
      key: 'all',
      label: hasResults ? `All (${compactNumber(totalCount)})` : 'All',
      icon: LayoutList,
    },
    ...groups.map((group) => ({
      key: group.key,
      label: hasResults ? `${group.label} (${compactNumber(group.items.length)})` : group.label,
      icon: group.icon,
    })),
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    commitTerm(term);
  };

  const handleClear = () => {
    setTerm('');
    commitTerm('');
    inputRef.current?.focus();
  };

  const renderPanel = () => {
    if (error) {
      return (
        <ErrorState title="Search failed" message={getErrorMessage(error)} onRetry={refetch} />
      );
    }

    if (isPending) return <SearchSkeletonPanel kind={activeTab} />;

    if (totalCount === 0) {
      return (
        <EmptyState
          icon={SearchX}
          title={`No results for “${activeQuery}”`}
          description={
            filtersActive
              ? 'Try different keywords, or broaden the sort and time filters.'
              : 'Try different or fewer keywords — search matches titles, bodies and names.'
          }
          action={
            filtersActive ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateParams({ sort: '', time: '' })}
              >
                Reset filters
              </Button>
            ) : null
          }
        />
      );
    }

    if (activeTab !== 'all') {
      const group = groups.find((candidate) => candidate.key === activeTab);
      if (!group) return null;
      if (group.items.length === 0) {
        return (
          <EmptyState
            icon={SearchX}
            title={`No ${group.heading.toLowerCase()} for “${activeQuery}”`}
            description="Other categories may still have matches for this search."
            action={
              <Button variant="outline" size="sm" onClick={() => setActiveTab('all')}>
                See all results
              </Button>
            }
          />
        );
      }
      return (
        <section>
          <h2 className="sr-only">{group.heading} results</h2>
          <SearchResultGroup kind={group.key} items={group.items} label={group.heading} />
        </section>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {groups
          .filter((group) => group.items.length > 0)
          .map((group) => (
            <section key={group.key} aria-labelledby={`${ID_PREFIX}-section-${group.key}`}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2
                  id={`${ID_PREFIX}-section-${group.key}`}
                  className="flex items-center gap-2 text-sm font-bold text-content"
                >
                  <group.icon aria-hidden="true" className="size-4 text-muted" />
                  {group.heading}
                </h2>
                <span className="text-xs text-muted">{compactNumber(group.items.length)} found</span>
              </div>

              <SearchResultGroup
                kind={group.key}
                items={group.items.slice(0, PREVIEW_COUNT)}
                label={group.heading}
              />

              {group.items.length > PREVIEW_COUNT && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setActiveTab(group.key)}
                >
                  Show all {compactNumber(group.items.length)} {group.heading.toLowerCase()}
                </Button>
              )}
            </section>
          ))}
      </div>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <header className="flex flex-col gap-3">
        <h1 className="text-xl font-bold text-content">Search</h1>

        <form role="search" onSubmit={handleSubmit}>
          <label htmlFor={`${ID_PREFIX}-input`} className="sr-only">
            Search posts, communities, comments and people
          </label>
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            />
            <Input
              ref={inputRef}
              id={`${ID_PREFIX}-input`}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              maxLength={MAX_QUERY_LENGTH}
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search posts, communities and people"
              className="rounded-full bg-inset pr-10 pl-9"
            />
            {term.length > 0 && (
              <IconButton
                type="button"
                icon={X}
                label="Clear search"
                size="sm"
                onClick={handleClear}
                className="absolute top-1/2 right-1.5 -translate-y-1/2"
              />
            )}
          </div>
        </form>

        <SearchFilters
          sort={sort}
          time={time}
          disabled={!enabled}
          onSortChange={(value) => updateParams({ sort: value === 'relevance' ? '' : value })}
          onTimeChange={(value) => updateParams({ time: value === 'all' ? '' : value })}
        />
      </header>

      {!enabled ? (
        <EmptyState
          icon={Search}
          title="Search reddit-clone"
          description="Look up posts, communities, comments and people. Start typing above and results appear as you go."
        />
      ) : (
        <>
          <p role="status" className="flex h-5 items-center gap-1.5 text-xs text-muted">
            {busy ? (
              <>
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
                Searching…
              </>
            ) : hasResults ? (
              <>
                {pluralize(totalCount, 'result')} for “{activeQuery}”
              </>
            ) : null}
          </p>

          <div className="overflow-x-auto pb-1">
            <Tabs
              items={tabItems}
              value={activeTab}
              onChange={setActiveTab}
              label="Search result categories"
              idPrefix={ID_PREFIX}
              className="w-max"
            />
          </div>

          <TabPanel
            idPrefix={ID_PREFIX}
            value={activeTab}
            className={busy && hasResults ? 'opacity-60 transition-opacity' : 'transition-opacity'}
          >
            {renderPanel()}
          </TabPanel>
        </>
      )}
    </div>
  );
}
