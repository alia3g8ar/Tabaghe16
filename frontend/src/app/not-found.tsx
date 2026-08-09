import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-center backdrop-blur-sm">
        <div className="h-px w-full bg-gradient-to-l from-transparent via-white/25 to-transparent" />

        <div className="p-8">
          <p className="text-6xl font-IRANYekanBlack text-white/90">۴۰۴</p>

          <span className="mx-auto mt-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-gray-300">
            <Compass className="h-7 w-7" />
          </span>

          <h1 className="mt-5 text-xl font-IRANYekanExtraBold text-white">
            اینجا که هیچی نیست!
          </h1>

          <p className="mt-2 text-sm leading-7 text-gray-400">
            صفحهای که دنبالش بودی یا جابهجا شده یا اصلاً وجود نداره. بیا
            برگردیم به یه جای آشنا.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
            >
              صفحه اصلی
            </Link>
            <Link
              href="/podcasts"
              className="rounded-xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-gray-200 transition hover:border-white/30 hover:text-white"
            >
              پادکست‌ها
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
