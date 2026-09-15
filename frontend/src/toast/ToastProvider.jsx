import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';
import { ToastContext } from './toastContext';

const MAX_VISIBLE = 4;
const DURATIONS = { success: 4000, info: 4500, error: 6500 };
const ICONS = { success: CircleCheck, error: TriangleAlert, info: Info };
const TONES = { success: 'text-success', error: 'text-danger', info: 'text-link' };

let nextId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (type, message, options = {}) => {
      if (!message) return null;
      const id = (nextId += 1);
      setToasts((current) => [...current, { id, type, message, title: options.title }].slice(-MAX_VISIBLE));
      const duration = options.duration ?? DURATIONS[type] ?? 4000;
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration)
      );
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      for (const timer of pending.values()) clearTimeout(timer);
      pending.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      toast: {
        success: (message, options) => push('success', message, options),
        error: (message, options) => push('error', message, options),
        info: (message, options) => push('info', message, options),
      },
      dismiss,
    }),
    [push, dismiss]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end">
        {toasts.map((toast) => {
          const Icon = ICONS[toast.type] ?? Info;
          return (
            <div
              key={toast.id}
              role={toast.type === 'error' ? 'alert' : 'status'}
              className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-line bg-surface px-4 py-3 shadow-lg"
            >
              <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${TONES[toast.type]}`} />
              <div className="min-w-0 flex-1">
                {toast.title && <p className="text-sm font-bold text-content">{toast.title}</p>}
                <p className="text-sm break-words text-content">{toast.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                aria-label="Dismiss notification"
                className="-mr-1 rounded p-1 text-muted transition-colors hover:bg-surface-hover hover:text-content"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
