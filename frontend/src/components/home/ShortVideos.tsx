"use client";
import Image from "next/image";
import Link from "next/link";
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
    image: "/images/img_5.jpg",
    title: "دیجی‌کالا و آمازون",
  },
];

const ShortVideos = () => {
  return (
    <div
      id="short-videos"
      className="w-full bg-black py-14 flex justify-center"
    >
      <div className="w-[90%] sm:w-[80%]">
        <h2 className="text-white text-center text-xl sm:text-2xl font-IRANYekanExtraBold mb-8">
          اکسپلور
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {shortVideos.map((video, index) => (
            <Link
              key={index}
              href="/videos"
              className="relative rounded-xl overflow-hidden group shadow-md hover:shadow-white/10 transition-all duration-300 h-32 sm:h-40"
            >
              <Image
                src={video.image}
                alt={video.title}
                fill
                sizes="(max-width: 640px) 100vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/70 flex items-center px-5">
                <div className="flex items-center justify-between w-full gap-3">
                  <span className="text-white text-sm sm:text-lg font-IRANYekanExtraBold leading-6 drop-shadow-md">
                    {video.title}
                  </span>
                  <PlayCircle className="text-white w-11 h-11 sm:w-14 sm:h-14 shrink-0 drop-shadow-lg" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link
          href="/videos"
          className="block text-center text-white mt-7 text-sm cursor-pointer font-IRANYekanExtraBold transition-opacity duration-300 hover:opacity-75"
        >
          مشاهده همه
        </Link>
      </div>
    </div>
  );
};

export default ShortVideos;
