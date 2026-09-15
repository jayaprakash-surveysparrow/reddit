import { Card } from '../../components/ui/Card';

export function AuthCard({ title, description, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-md py-4">
      <Card className="p-6">
        <h1 className="text-xl font-bold text-content">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
        <div className="mt-5">{children}</div>
      </Card>
      {footer && <div className="mt-4 text-center text-sm text-muted">{footer}</div>}
    </div>
  );
}
