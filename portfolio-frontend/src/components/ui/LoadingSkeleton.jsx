export function SkeletonLine({ className = '' }) {
  return (
    <div className={`bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLine className="h-10 w-10 rounded-xl" />
        <SkeletonLine className="h-5 w-16" />
      </div>
      <SkeletonLine className="h-7 w-24" />
      <SkeletonLine className="h-4 w-32" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <SkeletonLine className="h-10 flex-1" />
          <SkeletonLine className="h-10 w-24" />
          <SkeletonLine className="h-10 w-20" />
        </div>
      ))}
    </div>
  );
}