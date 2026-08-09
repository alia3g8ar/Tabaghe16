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
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-transparent px-5 py-7 transition-colors duration-300 hover:border-white/20 sm:px-8 md:rounded-3xl md:px-12 md:py-10">
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-IRANYekanBlack text-center text-lg text-white sm:text-xl md:text-2xl">
              طبقه ۱۶ را اینجا بشنوید
            </h3>
            <p className="text-center text-xs text-gray-500 sm:text-sm">
              هر جا راحت‌تری گوش بده
            </p>
          </div>

          <div className="my-6 h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent sm:my-8" />

          <div className="grid grid-cols-3 items-center gap-x-4 gap-y-5 justify-items-center sm:grid-cols-6 sm:gap-4 md:gap-6">
            {platforms.map((platform, index) => {
              const icon = (
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/5 p-1.5 transition-all duration-300 hover:scale-110 hover:border-white/20 hover:bg-white/[0.04] sm:h-14 sm:w-14 sm:p-2">
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
