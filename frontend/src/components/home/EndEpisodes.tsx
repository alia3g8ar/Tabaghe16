"use client";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { useEffect, useState } from "react";

import { formatDuration, listPublishedPodcasts } from "@/utils/api";
import type { Podcast } from "@/utils/api";

const FALLBACK_EPISODES: Array<{
  slug: string;
  image: string;
  title: string;
  guest: string;
  durationSeconds: number;
}> = [
  {
    slug: "legacy-episode-9",
    image: "/images/img_2.jfif",
    title: "سرآوا",
    guest: "سعید رحمانی",
    durationSeconds: 5125,
  },
  {
    slug: "legacy-episode-11",
    image: "/images/img_2.jfif",
    title: "خلاقیت",
    guest: "هوتن هاشمی",
    durationSeconds: 5415,
  },
  {
    slug: "legacy-episode-8",
    image: "/images/img_2.jfif",
    title: "Engineering Manager at Frame.io",
    guest: "سینا جزایری",
    durationSeconds: 6330,
  },
  {
    slug: "legacy-episode-12",
    image: "/images/img_1.jfif",
    title: "زندگی",
    guest: "آرش میر",
    durationSeconds: 6035,
  },
  {
    slug: "legacy-episode-7",
    image: "/images/main-image.jfif",
    title: "تعبیر یک دنیا؛ واقعیت مجازی، واقعیت افزوده",
    guest: "مارتین بصیری",
    durationSeconds: 4810,
  },
  {
    slug: "legacy-episode-5",
    image: "/images/main-image.jfif",
    title: "هوش مصنوعی؛ هرآنچه پیش‌رو داریم",
    guest: "کوشیار عظیمیان",
    durationSeconds: 6025,
  },
];

const EndEpisodes = () => {
  const [episodes, setEpisodes] = useState<Podcast[]>([]);

  useEffect(() => {
    let cancelled = false;

    listPublishedPodcasts({ page: 1, limit: 6 })
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

  const items =
    episodes.length > 0
      ? episodes.map((episode) => ({
          slug: episode.slug,
          image: episode.coverImageUrl ?? "/images/img_2.jfif",
          title: episode.title,
          guest: episode.guest ?? "—",
          durationSeconds: episode.durationSeconds,
        }))
      : FALLBACK_EPISODES;

  return (
    <>
      <div className="w-full h-auto mt-2 md:mt-10">
        <h4 className="  text-white mx-auto text-2xl sm:text-2xl lg:text-2xl font-IRANYekanExtraBold leading-tight text-center">
          اپیزود های طبقه 16
        </h4>
        <div className="w-full sm:w-[80%] mx-auto px-2 py-0 sm:py-8 md:py-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
            {items.map((episode) => (
              <Link
                key={episode.slug}
                href={`/watch?slug=${encodeURIComponent(episode.slug)}`}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.06] hover:shadow-[0_15px_40px_rgba(0,0,0,0.4)] sm:p-3"
              >
                {/* تامنیل */}
                <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-900 md:h-[4.5rem] md:w-28">
                  <Image
                    src={episode.image}
                    alt={episode.title || "تصویر اپیزود"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                </div>

                {/* متن */}
                <div className="min-w-0 flex-1">
                  <h4 className="line-clamp-2 text-[13px] font-IRANYekanExtraBold leading-5 text-white md:text-[15px] md:leading-6">
                    {episode.title}
                  </h4>
                  {episode.guest && (
                    <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 text-[10px] font-IRANYekanMedium text-gray-500 md:text-[11px]">
                      <span className="truncate">مهمان: {episode.guest}</span>
                      <span className="shrink-0 rounded-md bg-white/[0.05] px-1.5 py-0.5 text-gray-400">
                        {formatDuration(episode.durationSeconds ?? null)}
                      </span>
                    </div>
                  )}
                </div>

                {/* پلی */}
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-gray-500 transition-all duration-300 group-hover:border-white/25 group-hover:bg-white group-hover:text-black active:scale-90">
                  <Play className="h-4 w-4 translate-x-[-1px] fill-current" />
                </span>
              </Link>
            ))}
          </div>

          <Link
            href="/podcasts"
            className="mt-[0.1rem] sm:mt-8 mb-4 sm:mb-6 block text-white mx-auto text-xs font-IRANYekanExtraBold leading-tight text-center transition-colors duration-300 hover:text-gray-300"
          >
            مشاهده همه
          </Link>
        </div>
      </div>
    </>
  );
};

export default EndEpisodes;
