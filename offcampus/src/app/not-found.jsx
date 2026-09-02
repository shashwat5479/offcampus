import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto mt-20 max-w-feed text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
      <p className="mt-2 text-sm text-subtle">That page, post, or community doesn't exist.</p>
      <Link href="/" className="mt-5 inline-block rounded-full bg-ink px-4 py-2 text-sm font-medium text-white">
        Back to feed
      </Link>
    </div>
  );
}
