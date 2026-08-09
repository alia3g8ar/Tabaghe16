"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Clapperboard,
  Eye,
  Heart,
  MessageCircle,
  Play,
  Share2,
  X,
} from "lucide-react";

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [liked, setLiked] = useState<Record<number, boolean>>({});

  const visibleVideos = useMemo(() => {
    if (activeCategory === "همه") {
      return shortVideos;
    }
    return shortVideos.filter(
      (video) => video.category === activeCategory,
    );
  }, [activeCategory]);

  const closeReel = useCallback(() => setActiveIndex(null), []);

  const prevReel = useCallback(() => {
    setActiveIndex((current) =>
      current === null || current <= 0 ? current : current - 1,
    );
  }, []);

  const nextReel = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      if (current >= visibleVideos.length - 1) return null; // close after the last reel
      return current + 1;
    });
  }, [visibleVideos.length]);

  // Keyboard navigation while the viewer is open
  useEffect(() => {
    if (activeIndex === null) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeReel();
      } else if (event.key === "ArrowRight") {
        nextReel();
      } else if (event.key === "ArrowLeft") {
        prevReel();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, closeReel, nextReel, prevReel]);

  // Lock body scroll while the viewer is open
  useEffect(() => {
    if (activeIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex]);

  const toggleLike = (videoId: number) => {
    setLiked((previous) => ({ ...previous, [videoId]: !previous[videoId] }));
  };

  const activeVideo =
    activeIndex !== null ? visibleVideos[activeIndex] : null;

  return (
    <div className="relative mx-auto w-full pb-10">
      {/* Slim header + category chips (Instagram-style top bar) */}
      <div className="flex flex-col items-center gap-4 px-4 pt-6 pb-5 sm:px-6">
        <div className="flex items-center gap-2 text-white">
          <Clapperboard className="h-5 w-5 text-white/70" />
          <h1 className="text-lg font-IRANYekanExtraBold sm:text-xl">
            اکسپلور
          </h1>
        </div>

        <div className="flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-IRANYekanMedium transition-all duration-300 active:scale-95 md:text-sm ${
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
      </div>

      {/* Instagram-explore style masonry: fixed-height dense grid.
          Rows keep a fixed height so tiles always stick together with no dead
          space — a taller (reels) tile just spans two rows and the rest pack
          tightly around it via grid-flow-dense. */}
      {visibleVideos.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-500">
          تو این دسته هنوز ویدیویی نیست، بعداً سر بزن!
        </p>
      ) : (
        <div className="grid grid-flow-dense auto-rows-[9rem] grid-cols-3 gap-0.5 sm:grid-cols-4 sm:gap-1 sm:auto-rows-[10rem] md:grid-cols-5 lg:grid-cols-6 lg:auto-rows-[11.5rem]">
          {visibleVideos.map((video, index) => (
            <div
              key={video.id}
              style={{ animationDelay: `${Math.min(index * 55, 550)}ms` }}
              onClick={() => setActiveIndex(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  setActiveIndex(index);
                }
              }}
              className={`animate-fade-up group relative cursor-pointer overflow-hidden bg-gray-900 ${
                index % 4 === 2 ? "row-span-2" : ""
              }`}
            >
              <Image
                src={video.image}
                alt={video.title}
                fill
                sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 16vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
                unoptimized
              />

              {/* Desktop: dark overlay with play + views on hover */}
              <div className="absolute inset-0 hidden items-center justify-center gap-1.5 bg-black/50 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:flex">
                <Play className="h-4 w-4 fill-current" />
                <span className="text-sm font-bold">
                  {formatViews(video.views)}
                </span>
              </div>

              {/* Mobile: play + views pill */}
              <div className="absolute right-1.5 bottom-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm sm:hidden">
                <Eye className="h-3 w-3" />
                {formatViews(video.views)}
              </div>

              {/* Duration badge (reels style) */}
              <span
                dir="ltr"
                className="absolute bottom-1.5 left-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
              >
                {formatDuration(video.duration)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Reels-style fullscreen viewer (thumbnail for now, until real videos) */}
      {activeVideo && activeIndex !== null && (
        <div
          dir="rtl"
          role="dialog"
          aria-modal="true"
          aria-label={`ویدیوی کوتاه: ${activeVideo.title}`}
          className="fixed inset-0 z-[100] flex flex-col bg-black"
        >
          {/* Progress bars */}
          <div className="absolute top-0 right-0 left-0 z-20 flex gap-1 p-2">
            {visibleVideos.map((video, index) => (
              <div
                key={video.id}
                className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/20"
              >
                <div
                  className={`h-full rounded-full bg-white ${
                    index === activeIndex ? "animate-reels-progress" : ""
                  }`}
                  style={index < activeIndex ? { width: "100%" } : undefined}
                  onAnimationEnd={() => {
                    if (index !== activeIndex) return;
                    if (index < visibleVideos.length - 1) {
                      setActiveIndex(index + 1);
                    } else {
                      closeReel();
                    }
                  }}
                />
              </div>
            ))}
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={closeReel}
            aria-label="بستن"
            className="absolute top-4 left-4 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Media area with tap zones */}
          <div className="relative flex h-full items-center justify-center">
            {/* Tap left quarter = previous, right quarter = next */}
            <button
              type="button"
              onClick={prevReel}
              aria-label="ویدیوی قبلی"
              className="absolute inset-y-0 left-0 z-10 w-1/4"
            />
            <button
              type="button"
              onClick={nextReel}
              aria-label="ویدیوی بعدی"
              className="absolute inset-y-0 right-0 z-10 w-1/4"
            />

            {/* Thumbnail stands in for the video until real videos exist */}
            <div className="relative z-0 flex max-h-full w-full items-center justify-center px-4 sm:px-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeVideo.image}
                alt={activeVideo.title}
                className="max-h-[calc(100dvh-8rem)] max-w-full rounded-2xl object-contain shadow-2xl"
              />
            </div>

            {/* Prev / Next chevrons */}
            <button
              type="button"
              onClick={prevReel}
              aria-label="ویدیوی قبلی"
              className="absolute top-1/2 left-3 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 active:scale-90 sm:block"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={nextReel}
              aria-label="ویدیوی بعدی"
              className="absolute top-1/2 right-3 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/20 active:scale-90 sm:block"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Action rail (like / comment / share / save) */}
          <div className="absolute bottom-6 left-3 z-20 flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={() => toggleLike(activeVideo.id)}
              aria-label="پسندیدن"
              className={`flex flex-col items-center gap-0.5 transition-all duration-300 active:scale-90 ${
                liked[activeVideo.id]
                  ? "text-red-500"
                  : "text-white hover:scale-110"
              }`}
            >
              <Heart
                className={`h-7 w-7 ${liked[activeVideo.id] ? "fill-red-500" : ""}`}
              />
              <span className="text-xs font-IRANYekanMedium">
                {toPersianDigits(
                  activeVideo.likes + (liked[activeVideo.id] ? 1 : 0),
                )}
              </span>
            </button>

            <button
              type="button"
              aria-label="نظر"
              className="flex flex-col items-center gap-0.5 text-white transition-all duration-300 hover:scale-110 active:scale-90"
            >
              <MessageCircle className="h-7 w-7" />
              <span className="text-xs font-IRANYekanMedium">
                {toPersianDigits(Math.max(1, Math.round(activeVideo.likes / 6)))}
              </span>
            </button>

            <button
              type="button"
              aria-label="اشتراک‌گذاری"
              className="text-white transition-all duration-300 hover:scale-110 active:scale-90"
            >
              <Share2 className="h-7 w-7" />
            </button>

            <button
              type="button"
              aria-label="ذخیره"
              className="text-white transition-all duration-300 hover:scale-110 active:scale-90"
            >
              <Bookmark className="h-7 w-7" />
            </button>
          </div>

          {/* Caption */}
          <div className="absolute right-4 bottom-6 left-16 z-20 max-w-[65%]">
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[11px] font-IRANYekanMedium text-gray-200 backdrop-blur-sm">
                {activeVideo.category}
              </span>
              <span
                dir="ltr"
                className="rounded bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm"
              >
                {formatDuration(activeVideo.duration)}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-300">
                <Eye className="h-3.5 w-3.5" />
                {formatViews(activeVideo.views)}
              </span>
            </div>

            <h2 className="text-base font-IRANYekanExtraBold leading-6 text-white sm:text-lg">
              {activeVideo.title}
            </h2>
            <p className="mt-1 hidden text-xs leading-6 text-gray-300 sm:block">
              {activeVideo.description}
            </p>
            <p className="mt-2 text-[11px] text-gray-500">
              طبقه ۱۶ · {activeIndex + 1} از {visibleVideos.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideosPage;
