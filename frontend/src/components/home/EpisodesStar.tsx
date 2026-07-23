"use client";
import Image from "next/image";

const EpisodesStar = () => {
  const episodes = [
    {
      UrlImg: "/images/img_4.jpg",
      title: "سرآوا",
      guest: "سعید رحمانی",
      time: "01:25:45",
    },
    {
      UrlImg: "/images/img_5.jpg",
      title: "استراتژی پروکورین",
      guest: "سعید رحمانی",
      time: "01:25:45",
    },
    {
      UrlImg: "/images/img_6.jpg",
      title: "مدیریت مهندسی",
      guest: "سعید رحمانی",
      time: "01:25:45",
    },
    {
      UrlImg: "/images/img_7.jpg",
      title: "هوش مصنوعی",
      guest: "سعید رحمانی",
      time: "01:25:45",
    },
  ];

  return (
    <>
      <div className="w-full h-auto mt-2 md:mt-10">
        <h4 className="  text-white mx-auto text-2xl sm:text-2xl lg:text-2xl font-IRANYekanExtraBold leading-tight text-center">
          اپیزود های منتخب
        </h4>

        <div className="w-full sm:w-[80%] mx-auto px-2 py-0 sm:py-8 md:py-12">
          <div className="grid grid-cols-2 scale-[0.90] sm:scale-[1] sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {episodes.map((episode, index) => (
              <div
                key={index}
                className="rounded-[10px] shadow-lg transform transition-transform duration-300 hover:scale-105 relative p-px bg-linear-to-t from-white/20 to-transparent"
              >
                {/* محتوای اصلی کارت */}
                <div className="relative h-full w-full bg-black rounded-[10px] overflow-hidden">
                  {/* بخش تصویر */}
                  <div className="relative h-40 md:h-56 w-full">
                    <Image
                      src={episode.UrlImg}
                      alt={episode.title || "تصویر اپیزود"}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* بخش متن */}
                  <div className="p-3">
                    <h4 className="text-white text-[15px] font-IRANYekanExtraBold leading-tight text-right mb-5 line-clamp-2">
                      {episode.title}
                    </h4>

                    {episode.guest && episode.time && (
                      <div className="flex justify-between w-full text-gray-400 text-[10px] md:text-[14px] font-IRANYekanExtraBold">
                        <span>مهمان: {episode.guest}</span>
                        <span>{episode.time}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EpisodesStar;
