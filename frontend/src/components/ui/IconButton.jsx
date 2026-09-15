const SIZES = {
  sm: 'size-7',
  md: 'size-9',
};

export function IconButton({
  as: Component = 'button',
  icon: Icon,
  label,
  size = 'md',
  active = false,
  className = '',
  ...props
}) {
  return (
    <Component
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full transition-colors hover:bg-surface-hover ${
        active ? 'text-content' : 'text-muted hover:text-content'
      } ${SIZES[size]} ${className}`}
      {...props}
    >
      <Icon aria-hidden="true" className={size === 'sm' ? 'size-4' : 'size-5'} />
    </Component>
  );
}
