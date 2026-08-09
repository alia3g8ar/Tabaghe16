"use client";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";

import { formatDuration, listPublishedPodcasts } from "@/utils/api";
import type { Podcast } from "@/utils/api";

interface EpisodeItem {
  slug: string;
  image: string;
  title: string;
  guest: string;
  time: string;
}

const FALLBACK_EPISODES: EpisodeItem[] = [
  {
    slug: "legacy-episode-9",
    image: "/images/img_4.jpg",
    title: "سرآوا",
    guest: "سعید رحمانی",
    time: formatDuration(5125),
  },
  {
    slug: "legacy-episode-12",
    image: "/images/img_5.jpg",
    title: "زندگی",
    guest: "آرش میر",
    time: formatDuration(6035),
  },
  {
    slug: "legacy-episode-5",
    image: "/images/img_6.jpg",
    title: "هوش مصنوعی؛ هرآنچه پیش‌رو داریم",
    guest: "کوشیار عظیمیان",
    time: formatDuration(6025),
  },
  {
    slug: "legacy-episode-10",
    image: "/images/img_7.jpg",
    title: "عضو اتاق بازرگانی تهران",
    guest: "فرزین فردیس",
    time: formatDuration(4520),
  },
];

const EpisodesStar = () => {
  const [episodes, setEpisodes] = useState<Podcast[]>([]);

  useEffect(() => {
    let cancelled = false;

    listPublishedPodcasts({ page: 1, limit: 4 })
      .then((response) => {
        if (!cancelled && response.data.length > 0) {
          setEpisodes(response.data);
        }
      })
      .catch(() => {
        // fall back to the static list below
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const items: EpisodeItem[] =
    episodes.length > 0
      ? episodes.map((episode) => ({
          slug: episode.slug,
          image: episode.coverImageUrl ?? "/images/img_4.jpg",
          title: episode.title,
          guest: episode.guest ?? "—",
          time: formatDuration(episode.durationSeconds),
        }))
      : FALLBACK_EPISODES;

  return (
    <>
      <div className="w-full h-auto mt-2 md:mt-10">
        <h4 className="  text-white mx-auto text-2xl sm:text-2xl lg:text-2xl font-IRANYekanExtraBold leading-tight text-center">
          اپیزود های منتخب
        </h4>

        <div className="w-full sm:w-[80%] mx-auto px-2 py-0 sm:py-8 md:py-12">
          <div className="grid grid-cols-2 scale-[0.90] sm:scale-[1] sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {items.map((episode) => (
              <Link
                key={episode.slug}
                href={`/watch?slug=${encodeURIComponent(episode.slug)}`}
                className="group rounded-[10px] shadow-lg transform transition-transform duration-300 hover:scale-105 relative p-px bg-linear-to-t from-white/20 to-transparent"
              >
                {/* محتوای اصلی کارت */}
                <div className="relative h-full w-full bg-black rounded-[10px] overflow-hidden">
                  {/* بخش تصویر */}
                  <div className="relative h-40 md:h-56 w-full">
                    <Image
                      src={episode.image}
                      alt={episode.title || "تصویر اپیزود"}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />

                    {/* گرادیان روی تصویر برای خوانایی */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* دکمه پلی */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow-[0_0_30px_rgba(255,255,255,0.25)] backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:border-white/60 group-hover:bg-white/25 md:h-14 md:w-14">
                        <Play className="h-5 w-5 translate-x-[-1px] fill-current md:h-6 md:w-6" />
                      </span>
                    </div>
                  </div>

                  {/* بخش متن */}
                  <div className="p-3">
                    <h4 className="text-white text-[15px] font-IRANYekanExtraBold leading-tight text-right mb-5 line-clamp-2">
                      {episode.title}
                    </h4>

                    <div className="flex justify-between w-full text-gray-400 text-[10px] md:text-[14px] font-IRANYekanExtraBold">
                      <span>مهمان: {episode.guest}</span>
                      <span>{episode.time}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EpisodesStar;
