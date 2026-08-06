"use client";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

const shortVideos = [
  {
    image: "/images/img_1.jfif",
    title: "دموکراسی واقعی",
  },
  {
    image: "/images/img_3.jfif",
    title: "پنج حسرت بزرگ زندگی",
  },
  {
    image: "/images/img_2.jfif",
    title: "مهارت مهم در استخدام",
  },
  {
    image: "/images/img_1.jfif",
    title: "دیجی‌کالا و آمازون",
  },
];

const ShortVideos = () => {
  return (
    <div
      id="short-videos"
      className="w-full bg-black py-10 flex justify-center"
    >
      <div className="w-[90%] sm:w-[80%]">
        <h2 className="text-white text-center text-xl sm:text-2xl font-IRANYekanExtraBold mb-6">
          ویدیوهای کوتاه
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shortVideos.map((video, index) => (
            <div
              key={index}
              className="relative rounded-xl overflow-hidden group shadow-md hover:scale-105 transition-transform duration-300 h-32 sm:h-40"
            >
              <Image
                src={video.image}
                alt={video.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center px-4">
                <div className="flex items-center justify-between w-full">
                  <span className="text-white text-sm sm:text-lg font-IRANYekanExtraBold">
                    {video.title}
                  </span>
                  <PlayCircle className="text-white w-12 h-12 sm:w-16 sm:h-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-white mt-6 text-sm cursor-pointer font-IRANYekanExtraBold">
          مشاهده همه
        </p>
      </div>
    </div>
  );
};

export default ShortVideos;
