"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="bg-black text-white">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </span>

            <h1 className="mt-5 text-xl font-IRANYekanExtraBold text-white">
              یه مشکل جدی پیش اومد
            </h1>

            <p className="mt-2 text-sm leading-7 text-gray-400">
              صفحه از کار افتاد؛ بزن روی دکمه تا دوباره امتحان کنیم.
            </p>

            <button
              type="button"
              onClick={() => reset()}
              className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 active:scale-95"
            >
              دوباره تلاش کن
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
