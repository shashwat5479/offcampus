import { SkeletonCard } from "@/components/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] gap-8">
      <div className="hidden w-56 shrink-0 md:block" />
      <div className="mx-auto min-w-0 flex-1 md:max-w-2xl">
        <div className="mb-4 h-20 animate-pulse rounded-xl2 border border-line bg-paper" />
        <div className="flex flex-col gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
      <div className="hidden w-72 shrink-0 lg:block" />
    </div>
  );
}