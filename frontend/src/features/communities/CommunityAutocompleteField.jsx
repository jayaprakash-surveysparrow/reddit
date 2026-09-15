import {useEffect, useId, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query'
import { autocompleteCommunities } from '../../api/communities';
import { queryKeys } from '../../lib/queryKeys';

const DEBOUNCE_MS = 300;
const MIN_CHARS = 1;

export function CommunityAutocompleteField({id, value, onChange, onBlur, invalid, placeholder}) {
    const [term, setTerm] = useState(value ?? '');
    const [debounced, setDebounced] = useState(term);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef(null);
    const listboxId = useId();

    useEffect(() => setTerm(value ?? ''), [value]);

    useEffect(()=> {
        const timer = setTimeout(()=> setDebounced(term.trim()), DEBOUNCE_MS);
        return () => clearTimeout(timer);
    }, [term]);

    const {data, isFetching} = useQuery({
        queryKey: queryKeys.communityAutocomplete(debounced),
        queryFn: () => autocompleteCommunities(debounced),
        enabled: debounced.length >= MIN_CHARS,
        staleTime: 30_000,
    });

    const suggestions = debounced.length >= MIN_CHARS ? (data?.communities ?? []) : [];

    useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [open]);

  const commit = (name) => {
    onChange(name);
    setTerm(name);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (event) => {
    if (!open || suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0) {
        event.preventDefault();
        commit(suggestions[activeIndex].name);
      }
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <input
        id={id}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck="false"
        placeholder={placeholder}
        aria-invalid={invalid || undefined}
        className={`h-9 w-full rounded-md border bg-surface px-3 text-sm text-content transition-colors placeholder:text-faint focus:border-ring ${
          invalid ? 'border-danger' : 'border-line-strong'
        }`}
        value={term}
        onChange={(event) => {
          const next = event.target.value;
          setTerm(next);
          onChange(next);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
      />

      {open && debounced.length >= MIN_CHARS && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-40 mt-1 max-h-64 w-full overflow-auto rounded-md border border-line bg-surface py-1 shadow-lg"
        >
          {isFetching && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">Searching…</li>
          ) : suggestions.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">No matching communities</li>
          ) : (
            suggestions.map((community, index) => (
              <li
                key={community.id}
                id={`${listboxId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => {
                  event.preventDefault();
                  commit(community.name);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`flex cursor-pointer items-center justify-between gap-2 px-3 py-2 text-sm ${
                  index === activeIndex ? 'bg-surface-hover' : ''
                }`}
              >
                <span className="font-medium text-content">r/{community.name}</span>
                <span className="text-xs text-muted">{community.member_count} members</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}