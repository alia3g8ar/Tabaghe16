"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  formatDuration,
  listPublishedPodcasts,
} from "@/utils/api";
import type { Podcast } from "@/utils/api";
import { useRouter } from "next/navigation";
import Pagination from "@/components/podcasts/Pagination";

const PodcastsList = (): React.ReactElement => {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const videosPerPage = 12;
  const router = useRouter();

  useEffect(() => {
    const loadPodcasts = async () => {
      try {
        setLoading(true);
        const response = await listPublishedPodcasts({
          page: currentPage,
          limit: videosPerPage,
        });
        setPodcasts(response.data);
        setTotalPages(response.meta.totalPages);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "خطای ناشناخته‌ای رخ داد.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadPodcasts();
  }, [currentPage]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // نمایش حالت بارگذاری
  if (loading) {
    return (
      <div className="w-full flex justify-center mt-4 md:mt-10">
        <div className="w-4/5 mx-auto flex flex-col px-4 sm:px-6 py-4">
          <h4 className="mb-0 sm:mb-2 text-white text-xl font-IRANYekanExtraBold text-right">
            لیست پادکست‌ها
          </h4>
          <div className="text-white text-center py-8">در حال بارگذاری...</div>
        </div>
      </div>
    );
  }

  // نمایش خطا
  if (error) {
    return (
      <div className="w-full flex justify-center mt-4 md:mt-10">
        <div className="w-4/5 mx-auto flex flex-col px-4 sm:px-6 py-4">
          <h4 className="mb-0 sm:mb-2 text-white text-xl font-IRANYekanExtraBold text-right">
            لیست پادکست‌ها
          </h4>
          <div className="text-red-500 text-center py-8">{error}</div>
        </div>
      </div>
    );
  }

  // نمایش حالت خالی
  if (podcasts.length === 0) {
    return (
      <div className="w-full flex justify-center mt-4 md:mt-10">
        <div className="w-4/5 mx-auto flex flex-col px-4 sm:px-6 py-4">
          <h4 className="mb-0 sm:mb-2 text-white text-xl font-IRANYekanExtraBold text-right">
            لیست پادکست‌ها
          </h4>
          <div className="text-gray-400 text-center py-8">پادکستی یافت نشد</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center mt-4 md:mt-10">
      <div className="w-full sm:w-4/5 mx-auto flex flex-col px-4 sm:px-6 py-4">
        <h4 className="mb-0 sm:mb-2 text-white text-xl font-IRANYekanExtraBold text-right">
          لیست پادکست‌ها
        </h4>
        <div className="container mx-auto py-0 sm:py-8 md:py-12">
          <div className="grid grid-cols-2 mt-5 md:mt-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className="rounded-t shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
                onClick={() =>
                  router.push(
                    `/watch?slug=${encodeURIComponent(podcast.slug)}`,
                  )
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    router.push(
                      `/watch?slug=${encodeURIComponent(podcast.slug)}`,
                    );
                  }
                }}
              >
                <div className="relative p-px rounded-lg bg-linear-to-r from-black to-white/40">
                  <div className="rounded-lg overflow-hidden">
                    <div className="relative w-full h-48 md:h-56">
                      {podcast.coverImageUrl ? (
                        <Image
                          src={podcast.coverImageUrl}
                          alt={podcast.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                          loading="lazy"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-800 text-sm text-gray-400">
                          تصویر موجود نیست
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-black py-2">
                  <h4 className="text-white text-[12px] font-IRANYekanExtraBold text-right mb-4 line-clamp-2">
                    {podcast.title}
                  </h4>
                  <div className="flex justify-between text-gray-500 text-[12px] md:text-[13px] font-IRANYekanExtraBold mt-2">
                    <span>مهمان: {podcast.guest || "—"}</span>
                    <span>{formatDuration(podcast.durationSeconds)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PodcastsList;
