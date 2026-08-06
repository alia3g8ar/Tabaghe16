import React from "react";
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
  return (
    <div className="mt-6 w-full border-t-[3px] border-[#3c3c3c] pt-8 text-white">
      <div className="mx-auto flex w-full max-w-227.75 flex-col gap-10 px-8 sm:px-10 md:flex-row md:gap-12 lg:gap-0">
        <div className="w-full md:w-1/2 lg:w-74.5 lg:shrink-0 lg:mr-14">
          <div className="flex items-center gap-7 text-2xl font-IRANYekanBlack">
            <Image src={logo} alt="logo" width={40} height={40} />
            پادکست طبقه 16
          </div>

          <p className="mt-4 mb-8 text-justify font-IRANYekanRegular text-[#bababa]">
            لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
            استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله در
            ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد نیاز،
            و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد، کتابهای
            زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان جامعه و
            متخصصان را می طلبد
          </p>
        </div>

        <div className="w-full pb-12 md:w-1/2 md:pb-0 lg:w-auto lg:mr-31.5 lg:shrink-0">
          <p className="text-2xl font-IRANYekanBlack">اینجا بشنوید</p>
          <div className="mt-4 flex flex-wrap gap-4 cursor-pointer">
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
          <p className="mt-8 text-2xl font-IRANYekanBlack">شبکه های اجتماعی</p>
          <div className="mt-4 flex flex-wrap gap-4 cursor-pointer">
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
  );
};

export default Footer;
