"use client";
import Image from "next/image";
import Link from "next/link";
import apple from "../../assets/Apple.png";
import feed from "../../assets/feed.png";
import logoAppAppl from "../../assets/logo_app_apple 1.png";
import spotify from "../../assets/Spotify.png";
import youtube from "../../assets/youtube.png";
import Group from "../../assets/Group.png";

export default function Listening16() {
  const platforms = [
    { src: feed, alt: "RSS Feed", url: "/podcasts" },
    {
      src: logoAppAppl,
      alt: "Apple Podcasts",
      url: "https://podcasts.apple.com",
    },
    {
      src: Group,
      alt: "Google Podcasts",
      url: "https://podcasts.google.com",
    },
    { src: apple, alt: "Apple Music", url: "https://music.apple.com" },
    { src: spotify, alt: "Spotify", url: "https://open.spotify.com" },
    { src: youtube, alt: "YouTube", url: "https://youtube.com" },
  ];

  return (
    <div className="w-full px-4 py-8 md:py-14">
      {/* بخش پلتفرم‌های پخش */}
      <div className="mx-auto flex max-w-6xl items-center justify-center">
        <div
          className="w-full rounded-[20px] px-6 py-8 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] sm:w-[90%] md:w-[80%] md:rounded-[24px] md:px-10 md:py-10 lg:w-[70%] xl:w-[60%]"
          style={{
            background:
              "linear-gradient(135deg, #24272e 0%, #18191d 100%)",
          }}
        >
          <h3 className="mb-8 text-center font-IRANYekanBlack text-xl text-white md:mb-10 md:text-2xl">
            طبقه ۱۶ را اینجا بشنوید
          </h3>

          <div className="grid grid-cols-3 items-center justify-items-center gap-x-4 gap-y-6 sm:grid-cols-6 sm:gap-4 md:gap-6">
            {platforms.map((platform, index) => {
              const icon = (
                <span className="flex h-11 w-11 items-center justify-center p-1 transition-all duration-300 ease-in-out hover:scale-110 sm:h-14 sm:w-14 sm:p-1.5 md:h-16 md:w-16 md:p-2">
                  <Image
                    src={platform.src}
                    alt={platform.alt}
                    width={64}
                    height={64}
                    className="h-full w-full object-contain"
                  />
                </span>
              );

              return platform.url.startsWith("/") ? (
                <Link
                  key={index}
                  href={platform.url}
                  aria-label={platform.alt}
                >
                  {icon}
                </Link>
              ) : (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform.alt}
                >
                  {icon}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
