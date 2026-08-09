"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Play } from "lucide-react";

const shortVideos = [
  {
    image: "/images/img_1.jfif",
    title: "دموکراسی واقعی",
    duration: 58,
  },
  {
    image: "/images/img_3.jfif",
    title: "پنج حسرت بزرگ زندگی",
    duration: 45,
  },
  {
    image: "/images/img_2.jfif",
    title: "مهارت مهم در استخدام",
    duration: 62,
  },
  {
    image: "/images/img_5.jpg",
    title: "دیجی‌کالا و آمازون",
    duration: 51,
  },
];

const formatDuration = (duration: number): string => {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

const ShortVideos = () => {
  return (
    <div
      id="short-videos"
      className="w-full bg-black py-14 flex justify-center"
    >
      <div className="w-[90%] sm:w-[80%]">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1.5 text-xs font-IRANYekanMedium text-gray-500">
              کلیپ‌های منتخب
            </p>
            <h2 className="text-white text-xl sm:text-2xl font-IRANYekanExtraBold">
              اکسپلور
            </h2>
          </div>

          <Link
            href="/videos"
            className="group flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-IRANYekanMedium text-gray-300 transition-all duration-300 hover:border-white/25 hover:text-white active:scale-95"
          >
            مشاهده همه
            <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {shortVideos.map((video) => (
            <Link
              key={video.title}
              href="/videos"
              className="group relative block overflow-hidden rounded-2xl p-px bg-gradient-to-b from-white/20 via-white/[0.06] to-transparent transition-all duration-300 hover:from-white/40"
            >
              <div className="relative aspect-[9/16] w-full overflow-hidden rounded-[calc(1rem-1px)] bg-gray-900 sm:aspect-[3/4] lg:aspect-[9/16]">
                <Image
                  src={video.image}
                  alt={video.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  loading="lazy"
                  unoptimized
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-black/20" />

                <span
                  dir="ltr"
                  className="absolute top-3 left-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm"
                >
                  {formatDuration(video.duration)}
                </span>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-11 w-11 scale-75 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:opacity-100">
                    <Play className="h-5 w-5 translate-x-[-1px] fill-current" />
                  </span>
                </div>

                <h3 className="absolute right-3 bottom-3 left-3 text-sm font-IRANYekanExtraBold leading-5 text-white">
                  {video.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortVideos;
