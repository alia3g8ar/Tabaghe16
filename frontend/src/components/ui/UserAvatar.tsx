"use client";

import { useState } from "react";
import { resolveMediaUrl } from "@/utils/api";

export function getAvatarInitial(
  name?: string | null,
  email?: string | null,
): string {
  const trimmedName = name?.trim();
  if (trimmedName) {
    // first character of the display name (works for Persian + Latin)
    return Array.from(trimmedName)[0]?.toUpperCase() || "?";
  }
  const username = email?.trim().split("@")[0] ?? "";
  return username.charAt(0).toUpperCase() || "?";
}

interface UserAvatarProps {
  name?: string | null;
  email?: string | null;
  src?: string | null;
  sizeClass?: string;
  textClass?: string;
  shapeClass?: string;
  extraClass?: string;
  alt?: string;
  isActive?: boolean;
}

export default function UserAvatar({
  name,
  email,
  src,
  sizeClass = "h-10 w-10",
  textClass = "text-sm",
  shapeClass = "rounded-full",
  extraClass = "border border-white/10",
  alt = "آواتار",
  isActive = false,
}: UserAvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolvedSrc = resolveMediaUrl(src);
  const activeRing = isActive ? " ring-2 ring-white/80" : "";

  // Track the exact src that failed to load instead of a boolean, so the
  // error state resets automatically whenever the source changes (e.g. after
  // uploading a new avatar) without needing an effect.
  const imgFailed = resolvedSrc !== null && failedSrc === resolvedSrc;

  if (resolvedSrc && !imgFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolvedSrc}
        alt={alt}
        onError={() => setFailedSrc(resolvedSrc)}
        referrerPolicy="no-referrer"
        className={`block shrink-0 object-cover transition-all duration-200 ${shapeClass} ${extraClass} ${sizeClass}${activeRing}`}
      />
    );
  }

  return (
    <span
      dir="ltr"
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-gray-600 to-gray-900 font-bold text-white transition-all duration-200 ${shapeClass} ${extraClass} ${sizeClass} ${textClass}${activeRing}`}
    >
      {getAvatarInitial(name, email)}
    </span>
  );
}
