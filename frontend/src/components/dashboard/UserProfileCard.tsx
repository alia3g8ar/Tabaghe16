"use client";

import UserAvatar from "@/components/ui/UserAvatar";

interface UserProfileCardProps {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

const ROLE_LABELS: Record<string, string> = {
  owner: "مالک",
  admin: "مدیر",
  user: "کاربر",
};

export default function UserProfileCard({
  name,
  email,
  role,
  avatarUrl,
}: UserProfileCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-l from-white/[0.06] via-white/[0.02] to-transparent p-6 backdrop-blur-sm">
      <div className="h-px w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />

      <div className="flex flex-wrap items-center justify-between gap-6 pt-4">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <UserAvatar
            name={name}
            email={email}
            src={avatarUrl}
            sizeClass="h-16 w-16"
            textClass="text-2xl"
            shapeClass="rounded-2xl"
            extraClass="border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)]"
          />

          {/* User Info */}
          <div className="text-right">
            <p className="text-xl font-bold text-white sm:text-2xl">
              {name || "کاربر طبقه ۱۶"}
            </p>
            <p
              dir="ltr"
              className="mt-1 max-w-[220px] truncate text-left text-sm text-gray-400 sm:max-w-xs"
              title={email}
            >
              {email}
            </p>
            <span className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-gray-200">
              {ROLE_LABELS[role] ?? role}
            </span>
          </div>
        </div>

        {/* Badge */}
        <div className="hidden items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 sm:flex">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
          <span className="text-xs font-medium text-emerald-300">
            حساب فعال
          </span>
        </div>
      </div>
    </div>
  );
}
