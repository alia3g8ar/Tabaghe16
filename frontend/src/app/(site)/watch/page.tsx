"use client";

import {
  formatDuration,
  getPublishedPodcast,
} from "@/utils/api";
import type { Podcast } from "@/utils/api";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function getYoutubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (
      hostname === "youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const [kind, id] = url.pathname.split("/").filter(Boolean);
        if (kind === "embed" || kind === "shorts" || kind === "v") {
          videoId = id || null;
        }
      }
    }

    if (!videoId || !/^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const WatchPodcastContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPodcast = async () => {
      if (!slug) {
        setError("شناسه پادکست در آدرس موجود نیست.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setPodcast(await getPublishedPodcast(slug));
      } catch (caughtError) {
        const message =
          caughtError instanceof Error
            ? caughtError.message
            : "خطا در بارگذاری پادکست";
        setError(
          message === "podcast not found"
            ? "پادکست موردنظر یافت نشد."
            : message,
        );
      } finally {
        setLoading(false);
      }
    };

    void loadPodcast();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-8 text-center text-white">در حال بارگذاری...</div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="py-8 text-center text-red-500">
        {error || "پادکست یافت نشد!"}
      </div>
    );
  }

  const youtubeEmbedUrl = podcast.videoUrl
    ? getYoutubeEmbedUrl(podcast.videoUrl)
    : null;
  const directVideoUrl =
    podcast.videoUrl &&
    !youtubeEmbedUrl &&
    isHttpUrl(podcast.videoUrl)
      ? podcast.videoUrl
      : null;

  return (
    <div className="mt-10 flex w-full justify-center" dir="rtl">
      <div className="mx-auto w-full px-4 py-4 sm:w-4/5 sm:px-6">
        <h1 className="mb-6 text-right text-2xl font-IRANYekanExtraBold text-white">
          {podcast.title}
        </h1>

        {podcast.videoUrl && (
          <div className="relative mb-6 h-0 overflow-hidden rounded-lg pb-[56.25%]">
            {youtubeEmbedUrl ? (
              <iframe
                className="absolute inset-0 h-full w-full rounded-lg"
                src={youtubeEmbedUrl}
                title={podcast.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : directVideoUrl ? (
              <video
                className="absolute inset-0 h-full w-full rounded-lg bg-black"
                controls
                poster={podcast.coverImageUrl || undefined}
                src={directVideoUrl}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-gray-800">
                <p className="text-white">لینک ویدیو پشتیبانی نمی‌شود</p>
              </div>
            )}
          </div>
        )}

        {!podcast.videoUrl && podcast.coverImageUrl && (
          <img
            src={podcast.coverImageUrl}
            alt={podcast.title}
            className="mb-6 max-h-[32rem] w-full rounded-lg object-cover"
          />
        )}

        {podcast.audioUrl && (
          <div className="mb-6 rounded-lg bg-gray-900 p-4">
            <p className="mb-3 text-right text-white">نسخه صوتی</p>
            <audio className="w-full" controls src={podcast.audioUrl}>
              مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
            </audio>
          </div>
        )}

        <div className="rounded-lg bg-gray-900 p-4 text-right">
          <div className="flex flex-col justify-between text-white md:flex-row md:items-center">
            <div>
              <p className="mb-2 text-lg font-IRANYekanBold">
                مهمان: {podcast.guest || "—"}
              </p>
              <p className="text-gray-300">
                مدت زمان: {formatDuration(podcast.durationSeconds)}
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="mt-4 rounded-lg bg-blue-600 px-4 py-2 font-IRANYekanBold transition-colors hover:bg-blue-700 md:mt-0"
            >
              بازگشت
            </button>
          </div>
          {podcast.description && (
            <p className="mt-4 border-t border-gray-700 pt-4 leading-8 text-gray-300">
              {podcast.description}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              if (navigator.share) {
                void navigator.share({
                  title: podcast.title,
                  text: podcast.guest || podcast.description || "",
                  url: window.location.href,
                });
              } else {
                void navigator.clipboard.writeText(window.location.href);
                alert("لینک کپی شد!");
              }
            }}
            className="rounded-lg bg-green-600 px-4 py-2 font-IRANYekanBold text-white transition-colors hover:bg-green-700"
          >
            اشتراک‌گذاری
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WatchPodcast() {
  return (
    <Suspense
      fallback={
        <div className="py-8 text-center text-white">
          در حال بارگذاری...
        </div>
      }
    >
      <WatchPodcastContent />
    </Suspense>
  );
}
