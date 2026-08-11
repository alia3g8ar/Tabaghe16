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
      <div className="mx-auto flex max-w-4xl items-center justify-center">
        <div
          className="w-full rounded-2xl px-5 py-7 transition-all duration-300 ease-in-out hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] sm:px-8 md:rounded-3xl md:px-12 md:py-10"
          style={{
            background: "linear-gradient(135deg, #2c3038 0%, #1b1e23 100%)",
          }}
        >
          <h3 className="mb-6 text-center font-IRANYekanBlack text-lg text-white sm:text-xl md:mb-8 md:text-2xl">
            حامیان
          </h3>

          <div className="grid grid-cols-2 items-center justify-items-center gap-6 sm:grid-cols-4 sm:gap-8 md:gap-10">
            {platforms.map((platform, index) => (
              <a
                key={index}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.alt}
                className="block h-20 w-20 p-2 transition-all duration-300 ease-in-out hover:scale-110 sm:h-24 sm:w-24 md:h-28 md:w-28"
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
