export function Card({ as: Component = 'div', className = '', ...props }) {
  return (
    <Component className={`rounded-md border border-line bg-surface ${className}`} {...props} />
  );
}
