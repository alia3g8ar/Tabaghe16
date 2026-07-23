"use client";
import Image from "next/image";
import wave from "../../assets/equalizer 1.png";

export default function Hero() {
  return (
    <>
      <div className="select-none  text-white mt-4 mb-8 sm:mt-8 sm:mb-2 lg:mt-16 lg:mb-4 px-4 sm:px-6 lg:px-20 flex justify-center items-center overflow-hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-0 lg:gap-40">
          {/* سمت راست - بخش متن */}
          <div className="w-full sm:w-[90%] md:w-[440px] h-auto sm:h-[410px] mx-auto lg:mx-0 space-y-4 sm:space-y-6  p-4 sm:p-6 md:mr-12 lg:mr-0  rounded-xl border border-gray-800/50">
            <div className="space-y-2">
              <p className="font-normal text-xl sm:text-2xl text-gray-400 font-IRANYekanRegular text-center lg:text-right">
                سهیل در
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-IRANYekanExtraBold leading-tight text-center lg:text-right">
                پادکست طبقه ۱۶
              </h1>
              <p className="text-gray-400 text-base sm:text-lg font-IRANYekanRegular text-center lg:text-right">
                در مورد چه صحبت می‌کند؟
              </p>
            </div>

            <div>
              <p className="text-gray-300 w-full sm:w-[366px] h-auto sm:h-[193px] mx-auto font-normal text-[13px] sm:text-[14px] leading-6 tracking-[0%] text-justify px-2 sm:px-0 ">
                لورم ایپسوم متن ساختگی با تولید سادگی نامفهوم از صنعت چاپ، و با
                استفاده از طراحان گرافیک است، چاپگرها و متون بلکه روزنامه و مجله
                در ستون و سطرآنچنان که لازم است، و برای شرایط فعلی تکنولوژی مورد
                نیاز، و کاربردهای متنوع با هدف بهبود ابزارهای کاربردی می باشد،
                کتابهای زیادی در شصت و سه درصد گذشته حال و آینده، شناخت فراوان
                جامعه و متخصصان را می طلبد، تا با نرم افزارها شناخت بیشتری را
                برای طراحان رایانه ای علی الخصوص طراحان خلاقی
              </p>
            </div>
          </div>

          {/* سمت چپ - بخش تصاویر */}
          <div className=" relative w-full sm:w-[500px] lg:w-full mx-auto lg:mx-0 flex flex-col items-center   scale-[0.65] sm:scale-[0.7] md:scale-[0.75] lg:scale-[1] lg:top-[33px]">
            {/* تصویر اصلی */}
            <div className="relative w-[391px] h-[220px] top-[34px] right-[33%] md:right-0 bg-gray-800 rounded-[110px] border border-gray-700/50 overflow-hidden shadow-lg z-10">
              <Image
                src="/images/main-image.jfif"
                alt="تصویر اصلی"
                fill
                className="object-cover"
              />
            </div>

            {/* تصاویر پس‌زمینه */}
            <div className="absolute top-1.5 left-[57%] md:left-[300px] w-[295px] h-[166px] bg-gray-700/80 rounded-[83px] overflow-hidden opacity-60 z-0 border border-gray-700/50">
              <Image
                src="/images/img_1.jfif"
                alt="تصویر 1"
                fill
                className="object-cover grayscale"
              />
            </div>

            <div className="absolute  top-[175px] md:top-[169px] left-[54%] lg:left-[340px] w-48 h-[109px] bg-gray-700/80 rounded-[63.5px] overflow-hidden opacity-60 z-0 border border-gray-700/50">
              <Image
                src="/images/img_2.jfif"
                alt="تصویر 2"
                fill
                className="object-cover grayscale"
              />
            </div>

            <div className="absolute md:block hidden  top-[255px] left-[195px] w-[174px] h-[97px] bg-gray-700/80 rounded-[360px] overflow-hidden opacity-60 z-0 border border-gray-700/50">
              <Image
                src="/images/img_3.jfif"
                alt="تصویر 3"
                fill
                className="object-cover grayscale"
              />
            </div>

            {/* موج صدا */}
            <div className="md:block hidden  w-[281px] h-[201px] absolute top-[220px] left-[-30px] rounded-full overflow-hidden opacity-80">
              <Image
                src={wave}
                alt="موج صدا"
                fill
                className="object-cover grayscale"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
