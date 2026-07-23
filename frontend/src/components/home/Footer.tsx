"use client";
import React, { useState, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import logo from "@/assets/logo.png";
import { platformsDark, vectors } from "@/constants/constants";

interface PlatformDark {
  src: string | StaticImageData;
  alt: string;
}
interface vector {
  src: string | StaticImageData;
  alt: string;
}

const Footer: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div
        className={`w-full ${isMobile ? "px-8" : isTablet ? "px-10" : "max-w-227.75 mx-auto"} h-auto mt-6 flex flex-col ${isMobile ? "" : "md:flex-row"} text-white border-t-[3px] border-[#3c3c3c] pt-8`}
      >
        <div
          className={`${isMobile ? "w-full" : isTablet ? "w-full md:w-1/2" : "w-74.5 mr-14"}`}
        >
          <div className="flex items-center font-IRANYekanBlack text-2xl gap-7">
            <Image src={logo} alt="logo" width={40} height={40} />
            پادکست طبقه 16
          </div>

          <p className="text-justify mt-4 mb-8 font-IRANYekanRegular text-[#bababa]">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
            استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در
            ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز،
            و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای
            زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و
            متخصصان را می طلبد
          </p>
        </div>

        <div
          className={`flex ${isMobile ? "flex-col" : "flex-row"} ${isMobile ? "gap-8" : "gap-12"}`}
        >
          {/* <div
            className={`${isMobile ? "w-full" : isTablet ? "w-1/2" : "mr-[5.875rem]"}`}
          >
            <div className="text-2xl font-IRANYekanBlack">لینک ها</div>
            <ul className="flex flex-col gap-4 mt-4 font-IRANYekanRegular cursor-pointer">
              <li>صفحه اصلی</li>
              <li>پادکست ها</li>
              <li>ویدیوهای کوتاه</li>
              <li>حمایت</li>
              <li>همکاری</li>
            </ul>
          </div> */}

          <div
            className={` mb-12 ${isMobile ? "w-full mt-8" : isTablet ? "w-1/2" : "mr-31.5"}`}
          >
            <div>
              <p className="text-2xl font-IRANYekanBlack">اینجا بشنوید</p>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 cursor-pointer">
              {platformsDark.map((platform: PlatformDark) => (
                <Image
                  src={platform.src}
                  alt={platform.alt}
                  key={platform.alt}
                  width={36}
                  height={36}
                />
              ))}
            </div>
            <div className="mt-8">
              <p className="text-2xl font-IRANYekanBlack">شبکه های اجتماعی</p>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 cursor-pointer">
              {vectors.map((platform: vector) => (
                <Image
                  src={platform.src}
                  alt={platform.alt}
                  key={platform.alt}
                  width={36}
                  height={36}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
