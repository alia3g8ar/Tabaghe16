"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Clapperboard, Eye, Heart, Play, ThumbsUp } from "lucide-react";

interface ShortVideo {
  id: number;
  title: string;
  category: string;
  duration: number; // seconds
  views: number;
  likes: number;
  image: string;
  description: string;
}

const CATEGORIES = [
  "همه",
  "مصاحبه",
  "داستان",
  "کار و شغل",
  "کارآفرینی",
  "آموزش",
] as const;

const shortVideos: ShortVideo[] = [
  {
    id: 1,
    title: "دموکراسی واقعی؛ از پایین شروع می‌شود",
    category: "مصاحبه",
    duration: 58,
    views: 124_000,
    likes: 8_900,
    image: "/images/img_1.jfif",
    description: "گفت‌وگو درباره معنای واقعی مشارکت و انتخاب.",
  },
  {
    id: 2,
    title: "پنج حسرت بزرگ زندگی",
    category: "داستان",
    duration: 45,
    views: 98_000,
    likes: 6_400,
    image: "/images/img_3.jfif",
    description: "نگاهی صادقانه به چیزهایی که دیر می‌فهمیم.",
  },
  {
    id: 3,
    title: "مهارت مهم در استخدام که بهت یاد ندادند",
    category: "کار و شغل",
    duration: 62,
    views: 156_000,
    likes: 11_200,
    image: "/images/img_2.jfif",
    description: "مهارتی که رزومه‌ها از آن خالی‌اند.",
  },
  {
    id: 4,
    title: "دیجی‌کالا و آمازون؛ دو مسیر متفاوت",
    category: "کارآفرینی",
    duration: 51,
    views: 87_000,
    likes: 5_100,
    image: "/images/img_5.jpg",
    description: "از فروشگاه کوچک تا غول بازار؛ درس‌هایی از هر دو.",
  },
  {
    id: 5,
    title: "مهاجرت؛ تصمیمی که زندگی را عوض کرد",
    category: "داستان",
    duration: 72,
    views: 203_000,
    likes: 15_800,
    image: "/images/img_6.jpg",
    description: "روایت یک انتخاب سخت و تبعات شیرین و تلخش.",
  },
  {
    id: 6,
    title: "مدیریت زمان برای آدم‌های پرمشغله",
    category: "کار و شغل",
    duration: 39,
    views: 76_000,
    likes: 4_900,
    image: "/images/img_4.jpg",
    description: "سه تکنیک ساده که ساعت‌های از دست رفته را برمی‌گرداند.",
  },
  {
    id: 7,
    title: "نقشه راه یادگیری هوش مصنوعی",
    category: "آموزش",
    duration: 84,
    views: 189_000,
    likes: 13_500,
    image: "/images/img_7.jpg",
    description: "از کجا شروع کنیم؟ مسیر قدم‌به‌قدم برای مبتدی‌ها.",
  },
  {
    id: 8,
    title: "چرا شکست مهم‌تر از موفقیت است؟",
    category: "داستان",
    duration: 47,
    views: 112_000,
    likes: 9_300,
    image: "/images/img_8.jpg",
    description: "آنچه از زمین خوردن‌ها یاد می‌گیریم، جای دیگری یاد نمی‌گیریم.",
  },
  {
    id: 9,
    title: "استراتژی رشد برای کسب‌وکار کوچک",
    category: "کارآفرینی",
    duration: 66,
    views: 94_000,
    likes: 7_700,
    image: "/images/img_9.jpg",
    description: "رشد بدون شتاب‌زدگی؛ نقشه‌ای برای قدم‌های اول.",
  },
  {
    id: 10,
    title: "سخنرانی که مسیر زندگی‌ام را عوض کرد",
    category: "مصاحبه",
    duration: 55,
    views: 141_000,
    likes: 10_600,
    image: "/images/img_10.jpg",
    description: "درباره لحظه‌ای که همه‌چیز تغییر کرد.",
  },
  {
    id: 11,
    title: "روان‌شناسی تصمیم‌های روزمره",
    category: "آموزش",
    duration: 49,
    views: 68_000,
    likes: 4_200,
    image: "/images/img_11.jpg",
    description: "چرا انتخاب‌های کوچک، زندگی بزرگ ما را می‌سازند؟",
  },
  {
    id: 12,
    title: "تمرین صبحگاهی برای ذهن",
    category: "آموزش",
    duration: 38,
    views: 59_000,
    likes: 3_800,
    image: "/images/img_12.jpg",
    description: "ده دقیقه در روز برای شروعِ درستِ صبح.",
  },
];

const toPersianDigits = (value: number): string =>
  value.toLocaleString("fa-IR");

const formatViews = (views: number): string => {
  if (views >= 1_000_000) {
    return `${toPersianDigits(Math.round(views / 1_000_000))} میلیون`;
  }
  if (views >= 1_000) {
    return `${toPersianDigits(Math.round(views / 1_000))} هزار`;
  }
  return toPersianDigits(views);
};

const formatDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${toPersianDigits(minutes)}:${String(seconds).padStart(2, "0")}`;
};

const VideosPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>("همه");

  const visibleVideos = useMemo(() => {
    if (activeCategory === "همه") {
      return shortVideos;
    }
    return shortVideos.filter(
      (video) => video.category === activeCategory,
    );
  }, [activeCategory]);

  const [featured, ...rest] = visibleVideos;

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-white/[0.05] blur-3xl"
      />

      {/* Header */}
      <header className="relative mb-8 md:mb-12">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-IRANYekanMedium text-gray-300">
          <Clapperboard className="h-3.5 w-3.5 text-white/70" />
          کلیپ‌های منتخب طبقه ۱۶
        </div>

        <h1 className="text-3xl font-IRANYekanExtraBold leading-tight text-white md:text-5xl">
          ویدیوهای{" "}
          <span className="bg-gradient-to-l from-white via-white/80 to-white/40 bg-clip-text text-transparent">
            کوتاه
          </span>
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 md:text-base">
          تکه‌هایی از گفت‌وگوها، داستان‌ها و نکته‌هایی که می‌توانید در چند
          دقیقه ببینید؛ برای لحظه‌هایی که وقت کم است اما حرف زیاد.
        </p>
      </header>

      {/* Category filter */}
      <div className="relative mb-8 flex gap-2 overflow-x-auto pb-2 md:mb-10 md:flex-wrap md:overflow-visible">
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-IRANYekanMedium transition-all duration-300 active:scale-95 md:text-sm ${
                isActive
                  ? "border-white/30 bg-white text-black shadow-[0_0_24px_rgba(255,255,255,0.25)]"
                  : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/25 hover:text-white"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Featured video */}
      {featured && (
        <div className="group relative mb-6 cursor-pointer overflow-hidden rounded-3xl p-px bg-gradient-to-l from-white/30 via-white/10 to-transparent">
          <div className="relative aspect-video w-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-gray-900 sm:aspect-[21/9]">
            <Image
              src={featured.image}
              alt={featured.title}
              fill
              sizes="(max-width: 640px) 100vw, 90vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority
              unoptimized
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

            <div className="absolute inset-0 flex items-end p-5 sm:p-8">
              <div className="max-w-2xl">
                <div className="mb-3 flex items-center gap-3">
                  <span className="rounded-full border border-white/20 bg-black/40 px-3 py-1 text-[11px] font-IRANYekanMedium text-gray-200 backdrop-blur-sm">
                    {featured.category}
                  </span>
                  <span
                    dir="ltr"
                    className="rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
                  >
                    {formatDuration(featured.duration)}
                  </span>
                </div>

                <h2 className="text-xl font-IRANYekanExtraBold leading-snug text-white sm:text-3xl">
                  {featured.title}
                </h2>

                <p className="mt-2 hidden text-sm text-gray-300 sm:block">
                  {featured.description}
                </p>
              </div>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/10 text-white opacity-0 shadow-[0_0_40px_rgba(255,255,255,0.35)] backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 sm:h-20 sm:w-20 scale-75">
                <Play className="h-7 w-7 translate-x-[-1px] fill-current sm:h-9 sm:w-9" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {rest.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          ویدیویی در این دسته پیدا نشد.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rest.map((video) => (
            <div
              key={video.id}
              className="group relative cursor-pointer overflow-hidden rounded-2xl p-px bg-gradient-to-b from-white/20 via-white/[0.06] to-transparent transition-all duration-300 hover:from-white/40"
            >
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[calc(1rem-1px)] bg-gray-900">
                <Image
                  src={video.image}
                  alt={video.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                  unoptimized
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/20" />

                {/* Category + duration */}
                <div className="absolute top-3 right-3 left-3 flex items-center justify-between gap-2">
                  <span className="max-w-[60%] truncate rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-IRANYekanMedium text-gray-200 backdrop-blur-sm">
                    {video.category}
                  </span>
                  <span
                    dir="ltr"
                    className="shrink-0 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
                  >
                    {formatDuration(video.duration)}
                  </span>
                </div>

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-12 w-12 scale-75 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <Play className="h-5 w-5 translate-x-[-1px] fill-current" />
                  </span>
                </div>

                {/* Title + stats */}
                <div className="absolute right-3 bottom-3 left-3">
                  <h3 className="line-clamp-2 text-sm font-IRANYekanExtraBold leading-5 text-white">
                    {video.title}
                  </h3>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5" />
                      {formatViews(video.views)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      {toPersianDigits(video.likes)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-14 flex flex-col items-center gap-2 border-t border-white/[0.06] pt-8 text-center">
        <Heart className="h-4 w-4 text-white/40" />
        <p className="max-w-md text-xs leading-6 text-gray-500">
          این ویدیوها نسخه‌ی نمایشی هستند؛ به‌زودی ویدیوهای کوتاه واقعی طبقه ۱۶
          در همین صفحه منتشر می‌شود.
        </p>
      </div>
    </div>
  );
};

export default VideosPage;
