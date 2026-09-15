const PALETTE = ['#ff4500', '#0079d3', '#24a0ed', '#46d160', '#ffb000', '#ff66ac', '#7193ff', '#00a6a5'];

const SIZES = {
  xs: 'size-5 text-[10px]',
  sm: 'size-6 text-xs',
  md: 'size-8 text-sm',
  lg: 'size-16 text-xl',
};

function colorFor(name) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 997;
  }
  return PALETTE[hash % PALETTE.length];
}

export function Avatar({ name, size = 'md', className = '' }) {
  const label = name || 'deleted';
  return (
    <span
      aria-hidden="true"
      style={{ backgroundColor: colorFor(label) }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold text-white ${SIZES[size]} ${className}`}
    >
      {label.charAt(0).toUpperCase()}
    </span>
  );
}
