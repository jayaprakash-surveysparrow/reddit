import { CircleCheck, TriangleAlert } from 'lucide-react';

const TONES = {
  error: { icon: TriangleAlert, className: 'text-danger' },
  success: { icon: CircleCheck, className: 'text-success' },
};

export function FormAlert({ tone = 'error', children }) {
  const { icon: Icon, className } = TONES[tone] ?? TONES.error;
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-md border border-line bg-inset px-3 py-2.5"
    >
      <Icon aria-hidden="true" className={`mt-0.5 size-4 shrink-0 ${className}`} />
      <p className="text-sm text-content">{children}</p>
    </div>
  );
}
