export function Tabs({ items, value, onChange, label, idPrefix, className = '' }) {
  return (
    <div role="tablist" aria-label={label} className={`flex items-center gap-1 ${className}`}>
      {items.map((item) => {
        const selected = item.key === value;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            id={`${idPrefix}-tab-${item.key}`}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(item.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold transition-colors ${
              selected ? 'bg-inset text-content' : 'text-muted hover:bg-surface-hover hover:text-content'
            }`}
          >
            {Icon && <Icon aria-hidden="true" className="size-4" />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export function TabPanel({ idPrefix, value, className = '', children }) {
  return (
    <div role="tabpanel" aria-labelledby={`${idPrefix}-tab-${value}`} tabIndex={-1} className={className}>
      {children}
    </div>
  );
}
