"use client";

import {
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Camera,
  Check,
  Clock3,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Phone,
  Save,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import Image from "next/image";

import { useAuth } from "@/contexts/AuthContext";
import {
  formatDuration,
  getMyProfile,
  listSavedPodcasts,
  resolveMediaUrl,
  togglePodcastSave,
  updateMyProfile,
  uploadMyAvatar,
} from "@/utils/api";
import type { Podcast } from "@/utils/api";

const getEmailInitial = (email: string) => {
  const emailUsername = email.trim().split("@")[0];
  return emailUsername?.charAt(0).toUpperCase() || "?";
};

// Convert Persian/Arabic digits to Latin and strip spaces/dashes
function normalizePhone(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹٠١٢٣٤٥٦٧٨٩";
  const latinDigits = "01234567890123456789";
  const converted = value
    .split("")
    .map((char) => {
      const index = persianDigits.indexOf(char);
      return index >= 0 ? latinDigits[index] : char;
    })
    .join("");
  return converted.replace(/[\s-]/g, "");
}

function formatMemberSince(dateString: string | null): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

export default function Profile() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();

  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingSlug, setRemovingSlug] = useState<string | null>(null);

  // editable profile fields
  const [memberSince, setMemberSince] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // avatar upload
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("لطفاً یک فایل تصویری انتخاب کنید");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAvatarError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد");
      return;
    }

    setAvatarError(null);
    setAvatarUploading(true);

    // instant local preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    try {
      const updated = await uploadMyAvatar(file);
      setAvatarUrl(updated.avatarUrl);
      setAvatarPreview(null);
      URL.revokeObjectURL(objectUrl);
      updateUser({ avatarUrl: updated.avatarUrl });
    } catch (caughtError) {
      setAvatarPreview(null);
      URL.revokeObjectURL(objectUrl);
      setAvatarError(
        caughtError instanceof Error
          ? caughtError.message
          : "آپلود تصویر ناموفق بود",
      );
    } finally {
      setAvatarUploading(false);
      event.target.value = "";
    }
  };

  const loadSaved = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listSavedPodcasts();
      setPodcasts(data);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "خطا در بارگذاری پادکست‌های ذخیره‌شده",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await getMyProfile();
      setNameInput(profile.name ?? "");
      setPhoneInput(profile.phone ?? "");
      setMemberSince(profile.createdAt ?? null);
      setAvatarUrl(profile.avatarUrl);
      // keep the global context (navbar, dashboard) in sync with the
      // backend — localStorage may hold stale values from older sessions
      updateUser({
        name: profile.name,
        phone: profile.phone,
        avatarUrl: profile.avatarUrl,
      });
    } catch {
      // fall back to the user from context
      setNameInput(user?.name ?? "");
      setPhoneInput(user?.phone ?? "");
      setAvatarUrl(user?.avatarUrl ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateUser]);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.replace("/sign-in");
      return;
    }

    let cancelled = false;

    // Defer the loads out of the synchronous effect body (they update state),
    // and skip them entirely if the component unmounts first.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      void loadSaved();
      void loadProfile();
    });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, isLoading, loadSaved, loadProfile, router]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileSaved(false);
    setProfileError(null);
    try {
      const name = nameInput.trim();
      const phone = phoneInput.trim()
        ? normalizePhone(phoneInput.trim())
        : null;

      const updated = await updateMyProfile({
        name: name || null,
        phone,
      });

      updateUser({
        name: updated.name,
        phone: updated.phone,
      });
      setNameInput(updated.name ?? "");
      setPhoneInput(updated.phone ?? "");
      setProfileSaved(true);

      window.setTimeout(() => setProfileSaved(false), 2500);
    } catch (caughtError) {
      setProfileError(
        caughtError instanceof Error
          ? caughtError.message
          : "ذخیره اطلاعات ناموفق بود",
      );
    } finally {
      setProfileSaving(false);
    }
  };



  const handleRemove = async (slug: string) => {
    setRemovingSlug(slug);
    try {
      await togglePodcastSave(slug);
      setPodcasts((previous) =>
        previous.filter((podcast) => podcast.slug !== slug),
      );
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        console.error("remove saved failed:", caughtError.message);
      }
    } finally {
      setRemovingSlug(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="w-full" dir="rtl">
      <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="mb-8">
          <h1 className="text-2xl font-IRANYekanExtraBold text-white sm:text-3xl">
            پروفایل من
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            اطلاعات حساب و پادکست‌های ذخیره‌شده‌ات
          </p>
        </div>

        {/* User info card */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-l from-white/[0.06] via-white/[0.02] to-transparent p-6 backdrop-blur-sm">
          <div className="h-px w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />

          <div className="flex flex-wrap items-center gap-5 pt-4">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="group relative block overflow-hidden rounded-2xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-transform duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-70"
                title="تغییر عکس پروفایل"
                aria-label="تغییر عکس پروفایل"
              >
                {avatarPreview || avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={
                      avatarPreview ??
                      resolveMediaUrl(avatarUrl) ??
                      undefined
                    }
                    alt="عکس پروفایل"
                    className="h-16 w-16 object-cover sm:h-20 sm:w-20"
                  />
                ) : (
                  <span
                    dir="ltr"
                    className="flex h-16 w-16 items-center justify-center bg-gradient-to-br from-gray-600 to-gray-900 text-2xl font-bold text-white sm:h-20 sm:w-20"
                  >
                    {getEmailInitial(user.email)}
                  </span>
                )}

                <span className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {avatarUploading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-white" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(event) => void handleAvatarChange(event)}
              />
            </div>

            <div className="min-w-0 flex-1 text-right">
              <p className="text-xl font-bold text-white sm:text-2xl">
                {nameInput.trim() || user.name?.trim() || "کاربر طبقه ۱۶"}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
                <Bookmark className="h-4 w-4 text-gray-300" />
                <span className="text-xs font-medium text-gray-200">
                  {new Intl.NumberFormat("fa-IR").format(podcasts.length)}{" "}
                  پادکست ذخیره‌شده
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2">
                <CalendarDays className="h-4 w-4 text-gray-300" />
                <span className="text-xs font-medium text-gray-200">
                  عضویت از {formatMemberSince(memberSince)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit profile card */}
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-IRANYekanExtraBold text-white">
            <UserRound className="h-5 w-5 text-gray-400" />
            اطلاعات حساب
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="profile-email"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                ایمیل
              </label>
              <div className="relative">
                <Mail className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Lock className="absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
                <input
                  id="profile-email"
                  type="email"
                  dir="ltr"
                  value={user.email}
                  readOnly
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-11 text-left text-sm text-gray-400 focus:border-white/30 focus:outline-none"
                  title="ایمیل قابل تغییر نیست"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500">
                ایمیل حساب شما قابل تغییر نیست
              </p>
            </div>

            <div>
              <label
                htmlFor="profile-name"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                نام نمایشی
              </label>
              <input
                id="profile-name"
                type="text"
                value={nameInput}
                onChange={(event) => {
                  setNameInput(event.target.value);
                  setProfileError(null);
                  setProfileSaved(false);
                }}
                placeholder="نام خود را وارد کنید"
                maxLength={255}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-white/30 focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="profile-phone"
                className="mb-2 block text-sm font-medium text-gray-300"
              >
                شماره تلفن
              </label>
              <div className="relative">
                <Phone className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <input
                  id="profile-phone"
                  type="tel"
                  dir="ltr"
                  value={phoneInput}
                  onChange={(event) => {
                    // فقط ارقام (فارسی/انگلیسی) و علامت + مجاز است
                    const filtered = event.target.value.replace(
                      /[^0-9+۰-۹٠-٩]/g,
                      "",
                    );
                    setPhoneInput(filtered);
                    setProfileError(null);
                    setProfileSaved(false);
                  }}
                  placeholder="09123456789"
                  maxLength={20}
                  className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pl-4 pr-11 text-left text-sm text-white placeholder:text-gray-500 focus:border-white/30 focus:outline-none"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-gray-500">
                برای اطلاع‌رسانی‌ها و بازیابی حساب استفاده می‌شود
              </p>
            </div>
          </div>

          {avatarError && (
            <p className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              <ImagePlus className="h-4 w-4 shrink-0" />
              {avatarError}
            </p>
          )}

          {profileError && (
            <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
              {profileError}
            </p>
          )}

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => void handleSaveProfile()}
              disabled={profileSaving}
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200 disabled:opacity-50"
            >
              {profileSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : profileSaved ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {profileSaving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>

            {profileSaved && !profileError && (
              <span className="text-sm text-emerald-400">اطلاعات ذخیره شد ✓</span>
            )}
          </div>
        </div>

        {/* Saved podcasts */}
        <div id="saved" className="scroll-mt-28">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-IRANYekanExtraBold text-white">
              <BookmarkCheck className="h-5 w-5 text-amber-300" />
              پادکست‌های ذخیره‌شده
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">در حال بارگذاری...</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          ) : podcasts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center">
              <Bookmark className="mx-auto mb-3 h-10 w-10 text-gray-600" />
              <p className="text-sm text-gray-400">
                هنوز پادکستی ذخیره نکرده‌ای.
              </p>
              <button
                onClick={() => router.push("/podcasts")}
                className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
              >
                گشت‌وگذار در پادکست‌ها
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {podcasts.map((podcast) => (
                <div
                  key={podcast.id}
                  className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.02] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.05]"
                  onClick={() =>
                    router.push(
                      `/watch?slug=${encodeURIComponent(podcast.slug)}`,
                    )
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      router.push(
                        `/watch?slug=${encodeURIComponent(podcast.slug)}`,
                      );
                    }
                  }}
                >
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <div className="relative h-36 w-full md:h-44">
                      {podcast.coverImageUrl ? (
                        <Image
                          src={podcast.coverImageUrl}
                          alt={podcast.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-800 text-sm text-gray-400">
                          تصویر موجود نیست
                        </div>
                      )}
                    </div>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void handleRemove(podcast.slug);
                      }}
                      disabled={removingSlug === podcast.slug}
                      className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/70 text-amber-300 backdrop-blur-sm transition-all duration-200 hover:bg-black/90 hover:text-amber-200 active:scale-90 disabled:opacity-50"
                      title="حذف از ذخیره‌شده‌ها"
                      aria-label="حذف از ذخیره‌شده‌ها"
                    >
                      {removingSlug === podcast.slug ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <BookmarkCheck className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="p-3.5">
                    <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-IRANYekanExtraBold leading-5 text-white">
                      {podcast.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500">
                      <span className="flex items-center gap-1">
                        <UserRound className="h-3 w-3" />
                        {podcast.guest || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {formatDuration(podcast.durationSeconds)}
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-[11px] text-gray-600">
                      <MessageCircle className="h-3 w-3" />
                      {new Intl.NumberFormat("fa-IR").format(
                        podcast.commentsCount ?? 0,
                      )}{" "}
                      نظر
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
