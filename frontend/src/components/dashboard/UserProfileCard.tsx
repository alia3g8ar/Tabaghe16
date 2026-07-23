"use client";

import Image, { StaticImageData } from "next/image";

interface UserProfileCardProps {
  name: string;
  phone: string;
  email: string;
  avatar: string | StaticImageData;
}

export default function UserProfileCard({
  name,
  phone,
  email,
  avatar,
}: UserProfileCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center gap-6 direction-rtl text-right flex-wrap md:text-center">
      {/* Avatar */}
      <div className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56">
        <Image
          src={avatar}
          alt={name}
          fill
          className="rounded-full object-cover border"
        />
      </div>

      {/* User Info */}
      <div className="flex flex-col">
        <p className="text-2xl font-semibold text-gray-900">{name}</p>
        <p className="text-md text-gray-600">{phone}</p>
        <p className="text-sm text-gray-500 truncate">{email}</p>
      </div>
    </div>
  );
}
