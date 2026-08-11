"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { listPublishedPodcasts } from "@/utils/api";
import type { Podcast } from "@/utils/api";

const FALLBACK_EPISODES: Array<{
  slug: string;
  image: string;
  title: string;
  guest: string;
}> = [
  {
    slug: "legacy-episode-9",
    image: "/images/img_2.jfif",
    title: "سرآوا",
    guest: "سعید رحمانی",
  },
  {
    slug: "legacy-episode-11",
    image: "/images/img_2.jfif",
    title: "خلاقیت",
    guest: "هوتن هاشمی",
  },
  {
    slug: "legacy-episode-8",
    image: "/images/img_2.jfif",
    title: "Engineering Manager at Frame.io",
    guest: "سینا جزایری",
  },
  {
    slug: "legacy-episode-12",
    image: "/images/img_1.jfif",
    title: "زندگی",
    guest: "آرش میر",
  },
  {
    slug: "legacy-episode-7",
    image: "/images/main-image.jfif",
    title: "تعبیر یک دنیا؛ واقعیت مجازی، واقعیت افزوده",
    guest: "مارتین بصیری",
  },
  {
    slug: "legacy-episode-5",
    image: "/images/main-image.jfif",
    title: "هوش مصنوعی؛ هرآنچه پیش‌رو داریم",
    guest: "کوشیار عظیمیان",
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
        }))
      : FALLBACK_EPISODES;

  return (
    <div className="w-full h-auto mt-2 md:mt-10">
      <h4 className="text-white mx-auto text-2xl sm:text-2xl lg:text-2xl font-IRANYekanExtraBold leading-tight text-center">
        اپیزود های طبقه 16
      </h4>

      <div className="w-full sm:w-[80%] mx-auto px-2 py-0 sm:py-8 md:py-12">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:gap-6">
          {items.map((episode, index) => (
            <Link
              key={episode.slug}
              href={`/watch?slug=${encodeURIComponent(episode.slug)}`}
              className="group flex items-center gap-2 rounded-[15px] py-2 pr-2 pl-3 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_40px_rgba(255,255,255,0.08)] sm:gap-3"
              style={{
                background:
                  "linear-gradient(252.35deg, rgba(255, 255, 255, 0.2) 28.3%, rgba(0, 0, 0, 0) 65.06%)",
              }}
            >
              {/* تامنیل */}
              <div className="relative h-14 w-16 shrink-0 overflow-hidden rounded-[5px] md:h-16 md:w-28">
                <Image
                  src={episode.image}
                  alt={episode.title || "تصویر اپیزود"}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
              </div>

              {/* شماره اپیزود */}
              <span className="shrink-0 text-[15px] font-IRANYekanExtraBold font-bold leading-tight text-white">
                {`${index + 1}.`}
              </span>

              {/* متن */}
              <div className="flex min-w-0 flex-1 flex-col">
                <h4 className="line-clamp-2 text-right text-[13px] font-IRANYekanExtraBold leading-tight text-white transition-colors duration-300 group-hover:text-gray-200 md:text-[15px]">
                  {episode.title}
                </h4>
                {episode.guest && (
                  <div className="mt-1 text-right text-[9px] font-IRANYekanExtraBold leading-tight text-gray-500 md:text-[11px]">
                    مهمان: {episode.guest}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/podcasts"
          className="mt-[0.1rem] mb-4 block text-xs font-IRANYekanExtraBold leading-tight text-center text-white transition-colors duration-300 hover:text-gray-300 sm:mt-8 sm:mb-6"
        >
          مشاهده همه
        </Link>
      </div>
    </div>
  );
};

export default EndEpisodes;
