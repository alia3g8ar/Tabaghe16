"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ChevronLeft,
  ExternalLink,
  FileText,
} from "lucide-react";

type ResourceType = "book" | "article";

interface Resource {
  id: number;
  type: ResourceType;
  title: string;
  subtitle: string;
  category: string;
  episodeTitle: string;
  episodeSlug: string;
}

interface BookResource extends Resource {
  type: "book";
  gradient: string;
}

interface ArticleResource extends Resource {
  type: "article";
  source: string;
  readMinutes: number;
  url: string;
}

const books: BookResource[] = [
  {
    id: 1,
    type: "book",
    title: "اثر مرکب",
    subtitle: "دارن هاردی",
    category: "عادت‌ها",
    episodeTitle: "زندگی",
    episodeSlug: "legacy-episode-12",
    gradient:
      "bg-gradient-to-br from-amber-500/80 via-orange-700/80 to-red-900/90",
  },
  {
    id: 2,
    type: "book",
    title: "قدرت عادت",
    subtitle: "چارلز داهیگ",
    category: "رفتارشناسی",
    episodeTitle: "خلاقیت",
    episodeSlug: "legacy-episode-11",
    gradient:
      "bg-gradient-to-br from-sky-500/80 via-blue-700/80 to-indigo-900/90",
  },
  {
    id: 3,
    type: "book",
    title: "آغازگر",
    subtitle: "دیوید اپستین",
    category: "یادگیری",
    episodeTitle: "هوش مصنوعی؛ هرآنچه پیش‌رو داریم",
    episodeSlug: "legacy-episode-5",
    gradient:
      "bg-gradient-to-br from-emerald-500/80 via-teal-700/80 to-cyan-900/90",
  },
  {
    id: 4,
    type: "book",
    title: "نابخردی‌های پیش‌بینی‌پذیر",
    subtitle: "دن اریلی",
    category: "اقتصاد رفتاری",
    episodeTitle: "عضو اتاق بازرگانی تهران",
    episodeSlug: "legacy-episode-10",
    gradient:
      "bg-gradient-to-br from-fuchsia-500/80 via-purple-700/80 to-violet-950/90",
  },
];

const articles: ArticleResource[] = [
  {
    id: 5,
    type: "article",
    title: "چرا تخصص‌های ترکیبی برنده‌اند؟",
    subtitle: "دیوید اپستین",
    category: "یادگیری",
    source: "Harvard Business Review",
    readMinutes: 12,
    url: "https://hbr.org",
    episodeTitle: "هوش مصنوعی؛ هرآنچه پیش‌رو داریم",
    episodeSlug: "legacy-episode-5",
  },
  {
    id: 6,
    type: "article",
    title: "ساختار شکستن عادت‌های قدیمی",
    subtitle: "جیمز کلیر",
    category: "عادت‌ها",
    source: "Medium",
    readMinutes: 8,
    url: "https://medium.com",
    episodeTitle: "زندگی",
    episodeSlug: "legacy-episode-12",
  },
  {
    id: 7,
    type: "article",
    title: "تصمیم‌های کوچک، زندگی بزرگ",
    subtitle: "دن اریلی",
    category: "اقتصاد رفتاری",
    source: "TED",
    readMinutes: 10,
    url: "https://ted.com",
    episodeTitle: "عضو اتاق بازرگانی تهران",
    episodeSlug: "legacy-episode-10",
  },
  {
    id: 8,
    type: "article",
    title: "تمرین صبحگاهی برای ذهن خلاق",
    subtitle: "مایکل مایکلز",
    category: "خلاقیت",
    source: "سایت طبقه ۱۶",
    readMinutes: 6,
    url: "/",
    episodeTitle: "خلاقیت",
    episodeSlug: "legacy-episode-11",
  },
];

const FILTERS = ["همه", "کتاب", "مقاله"] as const;

const DetailPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<string>("همه");

  const visibleBooks = useMemo(
    () =>
      activeFilter === "مقاله" ? [] : books,
    [activeFilter],
  );
  const visibleArticles = useMemo(
    () =>
      activeFilter === "کتاب" ? [] : articles,
    [activeFilter],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      {/* Header */}
      <header className="mb-8 md:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-IRANYekanMedium text-gray-300">
          <BookOpen className="h-3.5 w-3.5 text-white/70" />
          کتاب‌ها و منابع
        </div>

        <h1 className="text-3xl font-IRANYekanExtraBold leading-tight text-white md:text-5xl">
          دیتیل{" "}
          <span className="bg-gradient-to-l from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            طبقه ۱۶
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
          هر کتاب، مقاله و منبعی که تو پادکست‌ها درباره‌ش حرف زدیم — یک‌جا و
          مرتب؛ تا بعد از هر قسمت راحت بری سراغ اصل مطلب.
        </p>

        {/* Filters */}
        <div className="mt-6 flex items-center gap-2">
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-IRANYekanMedium transition-all duration-300 active:scale-95 md:text-sm ${
                  isActive
                    ? "border-white/30 bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.25)]"
                    : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25 hover:text-white"
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </header>

      {/* Books — special book-cover layout */}
      {visibleBooks.length > 0 && (
        <section className="mb-12">
          <div className="mb-6 flex items-center gap-2">
            <h2 className="text-xl font-IRANYekanExtraBold text-white md:text-2xl">
              کتاب‌ها
            </h2>
            <span className="h-px flex-1 bg-gradient-to-l from-white/15 to-transparent" />
            <span className="text-xs text-gray-500">
              {visibleBooks.length} مورد
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {visibleBooks.map((book, index) => (
              <div
                key={book.id}
                style={{ animationDelay: `${Math.min(index * 90, 450)}ms` }}
                className="animate-fade-up group"
              >
                {/* Book cover */}
                <div
                  className={`relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-xl border border-white/10 p-4 shadow-[0_15px_40px_rgba(0,0,0,0.45)] transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-white/25 group-hover:shadow-[0_25px_60px_rgba(0,0,0,0.6)] ${book.gradient}`}
                >
                  {/* Spine */}
                  <div className="absolute inset-y-0 right-0 w-2.5 bg-black/30" />
                  <div className="absolute inset-y-0 right-2.5 w-px bg-white/15" />

                  {/* Ambient glow */}
                  <div className="pointer-events-none absolute -top-12 -left-12 h-36 w-36 rounded-full bg-white/15 blur-2xl" />

                  <span className="relative z-10 self-start rounded-full bg-black/30 px-2.5 py-0.5 text-[10px] font-IRANYekanMedium text-white/85 backdrop-blur-sm">
                    {book.category}
                  </span>

                  <div className="relative z-10">
                    <h3 className="text-base font-IRANYekanExtraBold leading-7 text-white drop-shadow-md sm:text-lg">
                      {book.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/75">
                      {book.subtitle}
                    </p>
                  </div>
                </div>

                {/* Book footer */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] text-gray-500">
                    ذکر شده در «{book.episodeTitle}»
                  </span>
                  <Link
                    href={`/watch?slug=${book.episodeSlug}`}
                    className="flex shrink-0 items-center gap-1 text-[11px] font-IRANYekanMedium text-gray-300 transition-colors duration-300 hover:text-white"
                  >
                    قسمت
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Articles — document-style layout */}
      {visibleArticles.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <h2 className="text-xl font-IRANYekanExtraBold text-white md:text-2xl">
              مقاله‌ها
            </h2>
            <span className="h-px flex-1 bg-gradient-to-l from-white/15 to-transparent" />
            <span className="text-xs text-gray-500">
              {visibleArticles.length} مورد
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {visibleArticles.map((article, index) => (
              <article
                key={article.id}
                style={{ animationDelay: `${Math.min(index * 90, 450)}ms` }}
                className="animate-fade-up group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/25 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-gray-300 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                    <FileText className="h-5 w-5" />
                  </span>
                  <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] font-IRANYekanMedium text-gray-400">
                    {article.category}
                  </span>
                </div>

                <h3 className="mt-4 text-sm font-IRANYekanExtraBold leading-6 text-white transition-all duration-300 group-hover:[text-shadow:0_0_12px_rgba(255,255,255,0.35)] sm:text-base">
                  {article.title}
                </h3>
                <p className="mt-1.5 text-xs text-gray-400">
                  {article.subtitle} · {article.source}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
                  <span className="text-[11px] text-gray-500">
                    {article.readMinutes} دقیقه مطالعه
                  </span>

                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-IRANYekanMedium text-gray-300 transition-all duration-300 hover:border-white/25 hover:text-white active:scale-95"
                  >
                    مطالعه
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>

                <Link
                  href={`/watch?slug=${article.episodeSlug}`}
                  className="mt-3 flex items-center gap-1 text-[11px] text-gray-500 transition-colors duration-300 hover:text-gray-300"
                >
                  ذکر شده در قسمت «{article.episodeTitle}»
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {visibleBooks.length === 0 && visibleArticles.length === 0 && (
        <p className="py-16 text-center text-sm text-gray-500">
          تو این دسته هنوز چیزی نذاشتیم، بعداً سر بزن!
        </p>
      )}
    </div>
  );
};

export default DetailPage;
