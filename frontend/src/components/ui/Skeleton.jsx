export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded bg-skeleton ${className}`} />;
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          className={`h-3 ${index === lines - 1 ? 'w-2/5' : index % 2 ? 'w-4/5' : 'w-full'}`}
        />
      ))}
    </div>
  );
}
