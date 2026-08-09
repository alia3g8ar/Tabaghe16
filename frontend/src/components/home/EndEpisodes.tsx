"use client";
import Image from "next/image";
import Link from "next/link";
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
          <div className="grid grid-cols-1 sm:grid-cols-2 grid-rows-1 scale-[0.90] sm:scale-[1]  lg:grid-cols-2 xl:grid-cols-2 gap-6">
            {items.map((episode, index) => (
              <Link
                key={episode.slug}
                href={`/watch?slug=${encodeURIComponent(episode.slug)}`}
                className="pr-2 py-2 flex items-center rounded-[15px] shadow-lg transform transition-transform duration-300 hover:scale-105"
                style={{
                  background:
                    "linear-gradient(252.35deg, rgba(255, 255, 255, 0.2) 28.3%, rgba(0, 0, 0, 0) 65.06%)",
                }}
              >
                {/* محتوای کارت بدون تغییر */}
                <div className="text-white ml-2 text-[15px] font-IRANYekanExtraBold leading-tight font-bold">
                  {`${index + 1}.`}
                </div>
                <div className="relative h-14 w-16 md:h-16 md:w-28 rounded-[5px] overflow-hidden ml-2">
                  <Image
                    src={episode.image}
                    alt={episode.title || "تصویر اپیزود"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="flex flex-col">
                  <h4 className="text-white text-[13px] md:text-[15px] font-IRANYekanExtraBold leading-tight text-right line-clamp-2">
                    {episode.title}
                  </h4>
                  {episode.guest && (
                    <div className="flex justify-between w-full text-gray-500 text-[9px] md:text-[11px] font-IRANYekanExtraBold">
                      <span>مهمان: {episode.guest}</span>
                      <span>{formatDuration(episode.durationSeconds ?? null)}</span>
                    </div>
                  )}
                </div>
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
