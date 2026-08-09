"use client";
import Image from "next/image";
import digi from "../../assets/digi.png";
import fid from "../../assets/fid.png";
import snapp from "../../assets/snapp.png";
import ta from "../../assets/ta.png";

export default function Sponsors() {
  const platforms = [
    { src: digi, alt: "دیجی‌کالا", url: "https://www.digikala.com" },
    { src: fid, alt: "فیدیبو", url: "https://fidibo.com" },
    { src: snapp, alt: "اسنپ", url: "https://snapp.ir" },
    { src: ta, alt: "طاقچه", url: "https://taaghche.com" },
  ];

  return (
    <div className="w-full px-4 py-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-transparent px-5 py-7 sm:px-8 md:rounded-3xl md:px-12 md:py-10">
          <div className="flex flex-col items-center gap-2">
            <h3 className="font-IRANYekanBlack text-center text-lg text-white sm:text-xl md:text-2xl">
              حامیان
            </h3>
            <p className="text-center text-xs text-gray-500 sm:text-sm">
              پشتیبان‌های طبقه ۱۶
            </p>
          </div>

          <div className="my-6 h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent sm:my-8" />

          <div className="grid grid-cols-2 items-center gap-x-6 gap-y-8 justify-items-center sm:grid-cols-4 sm:gap-8">
            {platforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.alt}
                className="block h-24 w-24 p-2 sm:h-28 sm:w-28 md:h-32 md:w-32"
              >
                <Image
                  src={platform.src}
                  alt={platform.alt}
                  width={112}
                  height={112}
                  className="h-full w-full object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
