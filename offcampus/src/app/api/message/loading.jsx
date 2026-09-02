import { SkeletonRow } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-4 h-7 w-32 animate-pulse rounded bg-line" />
      <div className="flex flex-col gap-2">
        <SkeletonRow /><SkeletonRow /><SkeletonRow /><SkeletonRow />
      </div>
    </div>
  );
}