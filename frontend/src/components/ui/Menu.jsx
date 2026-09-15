import { useEffect, useId, useRef, useState } from 'react';

export function Menu({ label, trigger, align = 'right', children, className = '' }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 rounded-full text-muted transition-colors hover:bg-surface-hover hover:text-content"
      >
        {trigger}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          onClick={() => setOpen(false)}
          className={`absolute top-full z-40 mt-1 min-w-48 overflow-hidden rounded-md border border-line bg-surface py-1 shadow-lg ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function MenuItem({
  as: Component = 'button',
  icon: Icon,
  danger = false,
  className = '',
  children,
  ...props
}) {
  return (
    <Component
      role="menuitem"
      type={Component === 'button' ? 'button' : undefined}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-surface-hover ${
        danger ? 'text-danger' : 'text-content'
      } ${className}`}
      {...props}
    >
      {Icon && <Icon aria-hidden="true" className="size-4 shrink-0" />}
      {children}
    </Component>
  );
}
