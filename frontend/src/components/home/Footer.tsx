import React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import logo from "@/assets/logo.png";
import { platformsDark, vectors } from "@/constants/constants";

interface PlatformDark {
  src: string | StaticImageData;
  alt: string;
  url: string;
}
interface vector {
  src: string | StaticImageData;
  alt: string;
  url: string;
}

const CREDITS = [
  {
    name: "arya",
    url: "https://www.linkedin.com/in/aliasghar-aryayimehr",
  },
  {
    name: "mmdb",
    url: "https://www.linkedin.com/search/results/all/?keywords=%D9%85%D8%AD%D9%85%D8%AF%20%D8%A8%D8%A7%D8%B4%D8%AA%D9%86%DB%8C",
  },
];

const Footer: React.FC = () => {
  return (
    <div className="mt-6 w-full border-t-[3px] border-[#3c3c3c] pt-8 text-white">
      <div className="mx-auto flex w-full max-w-227.75 flex-col gap-10 px-8 sm:px-10 md:flex-row md:gap-12 lg:gap-0">
        <div className="w-full md:w-1/2 lg:w-74.5 lg:shrink-0 lg:mr-14">
          <Link href="/" className="flex items-center gap-7 text-2xl font-IRANYekanBlack">
            <Image src={logo} alt="logo" width={40} height={40} />
            پادکست طبقه 16
          </Link>

          <p className="mt-4 mb-8 text-justify font-IRANYekanRegular text-[#bababa]">
            طبقه ۱۶ یه پادکسته درباره‌ی زندگی، کار و انتخاب‌هایی که همه‌مون هر روز
            باهاشون دست‌وپنجه نرم می‌کنیم. اینجا می‌شینی، گوش می‌دی و با آدمای
            جذاب هم‌صحبت می‌شی؛ اپیزودها رو از همین صفحه یا هر پلتفرمی که
            راحت‌تری گوش کن و اگه خوشت اومد، برامون نظر بذار.
          </p>
        </div>

        <div className="w-full pb-12 md:w-1/2 md:pb-0 lg:w-auto lg:mr-31.5 lg:shrink-0">
          <p className="text-2xl font-IRANYekanBlack">اینجا بشنوید</p>
          <div className="mt-4 flex flex-wrap gap-4">
            {platformsDark.map((platform: PlatformDark) =>
              platform.url.startsWith("/") ? (
                <Link
                  key={platform.alt}
                  href={platform.url}
                  aria-label={platform.alt}
                  className="opacity-80 transition-opacity duration-300 hover:opacity-100"
                >
                  <Image
                    src={platform.src}
                    alt={platform.alt}
                    width={36}
                    height={36}
                  />
                </Link>
              ) : (
                <a
                  key={platform.alt}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform.alt}
                  className="opacity-80 transition-opacity duration-300 hover:opacity-100"
                >
                  <Image
                    src={platform.src}
                    alt={platform.alt}
                    width={36}
                    height={36}
                  />
                </a>
              ),
            )}
          </div>
          <p className="mt-8 text-2xl font-IRANYekanBlack">شبکه های اجتماعی</p>
          <div className="mt-4 flex flex-wrap gap-4">
            {vectors.map((platform: vector) => (
              <a
                key={platform.alt}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.alt}
                className="opacity-80 transition-opacity duration-300 hover:opacity-100"
              >
                <Image
                  src={platform.src}
                  alt={platform.alt}
                  width={36}
                  height={36}
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* اعتبار سازندگان */}
      <div className="border-t border-white/10 px-8 py-6 text-center">
        <p className="text-sm text-gray-400">
          دولوپ بای{" "}
          {CREDITS.map((person, index) => (
            <React.Fragment key={person.url}>
              <a
                href={person.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline decoration-white/80 decoration-1 underline-offset-4 transition-colors duration-300 hover:decoration-white"
              >
                {person.name}
              </a>
              {index < CREDITS.length - 1 && <span className="mx-1">و</span>}
            </React.Fragment>
          ))}
        </p>
      </div>
    </div>
  );
};

export default Footer;
