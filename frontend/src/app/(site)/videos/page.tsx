"use client";

import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  Pause,
  Play,
  Share2,
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

/** Fisher–Yates shuffle so every visit lands on a different, random reel. */
const shuffle = <T,>(input: readonly T[]): T[] => {
  const items = [...input];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

/**
 * Returns false during SSR and true only after hydration on the client. This
 * lets the shuffled feed render exclusively in the browser — the server and
 * client never disagree on reel content, so there is no hydration mismatch.
 */
const useIsClient = (): boolean =>
  useSyncExternalStore(
    () => () => undefined, // stable no-op subscribe: never emits
    () => true, // client snapshot
    () => false, // server snapshot
  );

const ReelsFeed: React.FC = () => {
  const mounted = useIsClient();
  const [reels] = useState<ShortVideo[]>(() => shuffle(shortVideos));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  // Simulated playback state: seconds already "played" per reel, and whether
  // playback is paused. The active reel always plays; scrolling to another
  // reel autoplays it and each reel resumes where it left off.
  const [elapsed, setElapsed] = useState<Record<number, number>>({});
  const [paused, setPaused] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const reelRefs = useRef<(HTMLElement | null)[]>([]);

  // Latest values for the playback tick (interval is created once).
  const playbackRef = useRef({ index: 0, paused: false, reels });
  useEffect(() => {
    playbackRef.current = { index: currentIndex, paused, reels };
  }, [currentIndex, paused, reels]);

  // One-second tick drives the active reel's progress; wraps at the end so
  // reels loop like real short-form video.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const { index, paused: isPaused, reels: list } = playbackRef.current;
      if (isPaused || list.length === 0) return;
      const video = list[index];
      if (!video) return;

      setElapsed((previous) => {
        const current = previous[video.id] ?? 0;
        const next = current + 1;
        return { ...previous, [video.id]: next % video.duration };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const scrollToReel = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, reels.length - 1));
      reelRefs.current[clamped]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [reels.length],
  );

  const handleScroll = useCallback(() => {
    const container = scrollRef.current;
    if (!container || container.clientHeight === 0) return;

    const index = Math.round(container.scrollTop / container.clientHeight);
    setCurrentIndex(Math.max(0, Math.min(index, reels.length - 1)));
  }, [reels.length]);

  // Keyboard navigation: arrows page up/down through the reels.
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        scrollToReel(currentIndex + 1);
      } else if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        scrollToReel(currentIndex - 1);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentIndex, scrollToReel]);

  const toggleLike = (videoId: number) => {
    setLiked((previous) => ({ ...previous, [videoId]: !previous[videoId] }));
  };

  const togglePlay = () => {
    setPaused((previous) => !previous);
  };

  if (!mounted) {
    return (
      <div className="h-[calc(100dvh-4.5rem)] bg-black md:h-[calc(100dvh-6rem)]" />
    );
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      dir="rtl"
      className="h-[calc(100dvh-4.5rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:h-[calc(100dvh-6rem)]"
    >
      {reels.map((video, index) => {
        const playedSeconds = elapsed[video.id] ?? 0;
        const progress = Math.min(100, (playedSeconds / video.duration) * 100);

        return (
          <section
            key={video.id}
            ref={(element) => {
              reelRefs.current[index] = element;
            }}
            aria-label={`ویدیوی کوتاه: ${video.title}`}
            className="relative h-full w-full snap-start snap-always overflow-hidden bg-black"
          >
            {/* Full-bleed thumbnail stands in for the video until real videos exist */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.image}
              alt={video.title}
              draggable={false}
              onClick={togglePlay}
              className="absolute inset-0 h-full w-full select-none object-cover"
            />

            {/* Legibility gradients */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-black/40" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

            {/* Progress segments (current position in the feed) */}
            <div className="pointer-events-none absolute top-2 right-0 left-0 z-20 flex gap-1 p-2">
              {reels.map((reel, reelIndex) => (
                <div
                  key={reel.id}
                  className={`h-[3px] flex-1 overflow-hidden rounded-full transition-colors duration-300 ${
                    reelIndex <= currentIndex ? "bg-white/90" : "bg-white/20"
                  }`}
                />
              ))}
            </div>

            {/* Play / pause toggle (autoplay: the visible reel always plays) */}
            <button
              type="button"
              onClick={togglePlay}
              aria-label={paused ? "پخش" : "توقف"}
              className="absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/50 p-3.5 text-white backdrop-blur-sm transition-all duration-300 hover:bg-black/70 active:scale-90"
            >
              {paused ? (
                <Play className="h-8 w-8 fill-current" />
              ) : (
                <Pause className="h-8 w-8" />
              )}
            </button>

            {/* Action rail (like / comment / share / save) */}
            <div className="absolute bottom-6 left-3 z-20 flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={() => toggleLike(video.id)}
                aria-label="پسندیدن"
                className={`flex flex-col items-center gap-0.5 transition-all duration-300 active:scale-90 ${
                  liked[video.id] ? "text-red-500" : "text-white hover:scale-110"
                }`}
              >
                <Heart
                  className={`h-7 w-7 ${liked[video.id] ? "fill-red-500" : ""}`}
                />
                <span className="text-xs font-IRANYekanMedium">
                  {toPersianDigits(video.likes + (liked[video.id] ? 1 : 0))}
                </span>
              </button>

              <button
                type="button"
                aria-label="نظر"
                className="flex flex-col items-center gap-0.5 text-white transition-all duration-300 hover:scale-110 active:scale-90"
              >
                <MessageCircle className="h-7 w-7" />
                <span className="text-xs font-IRANYekanMedium">
                  {toPersianDigits(Math.max(1, Math.round(video.likes / 6)))}
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
            <div className="pointer-events-none absolute right-4 bottom-6 left-16 z-20 max-w-[70%] sm:max-w-[60%]">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[11px] font-IRANYekanMedium text-gray-200 backdrop-blur-sm">
                  {video.category}
                </span>
                <span
                  dir="ltr"
                  className="rounded bg-black/60 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm"
                >
                  {formatDuration(playedSeconds)} / {formatDuration(video.duration)}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-gray-300">
                  <Eye className="h-3.5 w-3.5" />
                  {formatViews(video.views)}
                </span>
              </div>

              <h2 className="text-base font-IRANYekanExtraBold leading-6 text-white sm:text-lg">
                {video.title}
              </h2>
              <p className="mt-1 hidden text-xs leading-6 text-gray-300 sm:block">
                {video.description}
              </p>
              <p className="mt-2 text-[11px] text-gray-400">
                طبقه ۱۶ · {index + 1} از {reels.length}
              </p>
            </div>

            {/* Playback progress bar (fills over the reel's duration, loops) */}
            <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-20 h-1 bg-white/20">
              <div
                className="h-full bg-white/90 transition-[width] duration-1000 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ReelsFeed;
