"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-up/10 text-2xl">⚠️</div>
      <div>
        <h1 className="text-lg font-semibold text-ink">Something went wrong</h1>
        <p className="mt-1 text-sm text-subtle">This page hit an error. You can try again, or head back home.</p>
      </div>
      <div className="flex gap-2">
        <button onClick={reset} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accentInk">
          Try again
        </button>
        <a href="/" className="rounded-full border border-line px-4 py-2 text-sm text-subtle hover:text-ink">
          Go home
        </a>
      </div>
    </div>
  );
}