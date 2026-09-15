export function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-md border border-line bg-surface px-6 py-12 text-center ${className}`}
    >
      {Icon && (
        <span className="flex size-12 items-center justify-center rounded-full bg-inset text-muted">
          <Icon aria-hidden="true" className="size-6" />
        </span>
      )}
      <div className="space-y-1">
        <p className="text-base font-bold text-content">{title}</p>
        {description && <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
