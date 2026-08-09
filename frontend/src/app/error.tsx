"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-center backdrop-blur-sm">
        <div className="h-px w-full bg-gradient-to-l from-transparent via-white/25 to-transparent" />

        <div className="p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
            <AlertTriangle className="h-7 w-7" />
          </span>

          <h1 className="mt-5 text-xl font-IRANYekanExtraBold text-white">
            یه مشکلی پیش اومد!
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-400">
            یه جای کار میلنگه؛ نگران نباش، یه نفس بکش و دوباره تلاش کن. اگه
            بازم این صفحه رو دیدی، به ما خبر بده.
          </p>

          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 active:scale-95"
          >
            <RefreshCcw className="h-4 w-4" />
            دوباره تلاش کن
          </button>

          {error.message && (
            <p
              dir="ltr"
              className="mt-5 truncate rounded-lg bg-black/40 px-3 py-1.5 text-left text-[11px] text-gray-600"
              title={error.message}
            >
              {error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
