export function SkeletonLine({ w = "w-full" }) {
  return <div className={`h-3 ${w} animate-pulse rounded bg-line`} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl2 border border-line bg-paper p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-line" />
        <div className="flex-1 space-y-1.5">
          <SkeletonLine w="w-1/3" />
          <SkeletonLine w="w-1/4" />
        </div>
      </div>
      <SkeletonLine w="w-3/4" />
      <div className="mt-2 h-40 animate-pulse rounded-lg bg-line" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 rounded-xl2 border border-line bg-paper p-3">
      <div className="h-10 w-10 animate-pulse rounded-lg bg-line" />
      <div className="flex-1 space-y-1.5">
        <SkeletonLine w="w-1/2" />
        <SkeletonLine w="w-1/4" />
      </div>
      <div className="h-7 w-16 animate-pulse rounded-full bg-line" />
    </div>
  );
}