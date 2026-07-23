"use client";

import { fetchVideo } from "@/utils/api";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface Video {
  id: number;
  title: string;
  youtube_url: string;
  thumbnail: string;
  duration: string;
  guest: string;
}

const WatchVideoContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVideo = async () => {
      if (!id) return; // صبر کن تا id موجود باشد

      try {
        setLoading(true);
        setError(null);
        const data = await fetchVideo(id as string);
        setVideo(data);
      } catch (error) {
        console.error(error);
        setError("خطا در بارگذاری ویدیو");
      } finally {
        setLoading(false);
      }
    };

    loadVideo();
  }, [id]); // وابسته به id

  if (loading)
    return (
      <div className="text-white text-center py-8">در حال بارگذاری...</div>
    );

  if (error)
    return <div className="text-red-500 text-center py-8">{error}</div>;

  if (!video)
    return <div className="text-red-500 text-center py-8">ویدیو یافت نشد!</div>;

  // استخراج کد ویدیوی یوتیوب از URL
  const extractYoutubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/,
    );
    return match ? match[1] : null;
  };

  const youtubeId = extractYoutubeId(video.youtube_url);
  const embedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}`
    : "";

  return (
    <div className="w-full flex justify-center mt-10">
      <div className="w-full sm:w-4/5 mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-white text-2xl font-IRANYekanExtraBold text-right mb-6">
          {video.title}
        </h1>

        {/* ویدیو با نسبت 16:9 */}
        <div className="relative pb-[56.25%] h-0 overflow-hidden mb-6 rounded-lg">
          {youtubeId ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-lg"
              src={embedUrl}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
              <p className="text-white">لینک ویدیو معتبر نیست</p>
            </div>
          )}
        </div>

        {/* اطلاعات ویدیو */}
        <div className="bg-gray-900 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-white text-right">
            <div>
              <p className="font-IRANYekanBold text-lg mb-2">
                مهمان: {video.guest}
              </p>
              <p className="text-gray-300">مدت زمان: {video.duration}</p>
            </div>

            {/* دکمه بازگشت */}
            <button
              onClick={() => router.back()}
              className="mt-4 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-IRANYekanBold"
            >
              بازگشت
            </button>
          </div>
        </div>

        {/* دکمه اشتراک گذاری */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: video.title,
                  text: video.guest,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("لینک کپی شد!");
              }
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-IRANYekanBold text-white"
          >
            اشتراک گذاری
          </button>
        </div>
      </div>
    </div>
  );
};

const WatchVideo = () => {
  return (
    <Suspense fallback={<div className="text-white text-center py-8">در حال بارگذاری...</div>}>
      <WatchVideoContent />
    </Suspense>
  );
};

export default WatchVideo;
