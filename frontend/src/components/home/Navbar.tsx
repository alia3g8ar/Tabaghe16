"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import logo from "@/assets/logo.png";
import { NavbarItems } from "@/composables/NavbarItems";
import { useAuth } from "@/contexts/AuthContext";
import { resolveMediaUrl } from "@/utils/api";
import {
  Bookmark,
  BookOpen,
  ChevronLeft,
  Clapperboard,
  Home,
  Podcast,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import "@fortawesome/fontawesome-free/css/all.min.css";

const MENU_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/podcasts": Podcast,
  "/videos": Clapperboard,
  "/detail": BookOpen,
};

const getEmailInitial = (email: string) => {
  const emailUsername = email.trim().split("@")[0];

  return emailUsername?.charAt(0).toUpperCase() || "?";
};

interface UserAvatarProps {
  initial: string;
  src?: string | null;
  size?: "small" | "large";
  isActive?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  initial,
  src,
  size = "large",
  isActive = false,
}) => {
  const sizeClasses =
    size === "small"
      ? "h-10 w-10 text-lg"
      : "h-12 w-12 text-xl";

  const resolvedSrc = resolveMediaUrl(src);

  if (resolvedSrc) {
    return (
      <span
        aria-hidden="true"
        className={`block shrink-0 overflow-hidden rounded-full shadow-md transition-all duration-200 ${sizeClasses} ${
          isActive ? "ring-2 ring-white/80" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolvedSrc}
          alt="آواتار کاربر"
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      dir="ltr"
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-700 to-gray-950 font-bold uppercase text-white shadow-md transition-all duration-200 ${sizeClasses} ${
        isActive ? "ring-2 ring-white/80" : ""
      }`}
    >
      {initial}
    </span>
  );
};

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const avatarInitial = user
    ? getEmailInitial(user.email)
    : "?";

  useEffect(() => {
    if (!isProfileOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        event.target instanceof Node &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileOpen]);

  // Close the mobile menu with the Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const toggleMenu = () => {
    setIsOpen((previousState) => !previousState);
  };

  const toggleSearch = () => {
    setIsProfileOpen(false);
    setShowSearch((previousState) => !previousState);
  };

  const toggleProfile = () => {
    setShowSearch(false);
    setIsProfileOpen((previousState) => !previousState);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsProfileOpen(false);
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <nav className="sticky top-0 z-50 mx-auto w-full max-w-7xl px-3 pt-3 font-IRANSans sm:px-4 sm:pt-4">
      <div className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-black/60 px-3 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl md:gap-6 md:rounded-[1.35rem] md:px-5 md:py-4">
        {/* Logo */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="shrink-0">
            <Link href="/">
              <Image
                src={logo}
                alt="طبقه 16"
                width={48}
                height={40}
                className="h-8 w-10 object-contain transition-opacity hover:opacity-80 md:h-10 md:w-12"
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden items-center gap-6 md:flex lg:gap-10">
            {NavbarItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative text-sm font-medium transition-all duration-300 ${
                    pathname === item.href
                      ? "font-bold text-white [text-shadow:0_0_10px_rgba(255,255,255,0.9),0_0_22px_rgba(255,255,255,0.45)]"
                      : "text-gray-300 hover:text-white hover:[text-shadow:0_0_10px_rgba(255,255,255,0.4)]"
                  }`}
                  prefetch
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Authentication */}
          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <div
                  ref={profileMenuRef}
                  className="relative hidden md:block"
                >
                  <button
                    type="button"
                    onClick={toggleProfile}
                    className="block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                    aria-label="نمایش اطلاعات حساب کاربری"
                    aria-haspopup="menu"
                    aria-expanded={isProfileOpen}
                    aria-controls="user-profile-menu"
                    title="حساب کاربری"
                  >
                    <UserAvatar
                      initial={avatarInitial}
                      src={user.avatarUrl}
                      isActive={isProfileOpen}
                    />
                  </button>

                  {isProfileOpen && (
                    <div
                      id="user-profile-menu"
                      role="menu"
                      dir="rtl"
                      className="animate-popup-in absolute top-full left-0 z-[70] mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
                    >
                      <div className="h-px w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />

                      <div className="flex items-center gap-3 border-b border-white/10 p-4">
                        <UserAvatar initial={avatarInitial} src={user.avatarUrl} />

                        <div className="min-w-0 flex-1 text-right">
                          <p className="truncate text-sm font-semibold text-white">
                            {user.name?.trim() || "کاربر طبقه ۱۶"}
                          </p>

                          <p
                            dir="ltr"
                            className="mt-1 truncate text-left text-xs text-gray-400"
                            title={user.email}
                          >
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 p-3">
                        <Link
                          href="/profile"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}
                          className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-3 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.09]"
                        >
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/20 to-white/[0.04] text-white shadow-[0_0_20px_rgba(255,255,255,0.12)] transition-all duration-300 group-hover:shadow-[0_0_28px_rgba(255,255,255,0.28)]">
                            <UserRound className="h-5 w-5" />
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-IRANYekanExtraBold text-white">
                              پروفایل من
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-gray-400">
                              مشاهده و ویرایش اطلاعات حساب
                            </span>
                          </span>

                          <ChevronLeft className="h-4 w-4 shrink-0 text-gray-500 transition-all duration-300 group-hover:-translate-x-0.5 group-hover:text-white" />
                        </Link>

                        <Link
                          href="/profile#saved"
                          role="menuitem"
                          onClick={() => setIsProfileOpen(false)}
                          className="group flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3 py-2.5 text-xs text-gray-300 transition-colors duration-300 hover:bg-white/[0.08] hover:text-white"
                        >
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-gray-300 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                            <Bookmark className="h-4 w-4" />
                          </span>
                          پادکست‌های ذخیره‌شده
                        </Link>
                      </div>

                      <div className="flex flex-col gap-1.5 border-t border-white/10 p-3">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-500/20 hover:text-red-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98]"
                        >
                          <i
                            className="fas fa-right-from-bracket"
                            aria-hidden="true"
                          />
                          خروج از حساب
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="hidden text-sm text-gray-300 transition-colors hover:text-white md:block"
                >
                  ورود
                </Link>
              )}
            </>
          )}

          {/* Search */}
          <div className="relative flex items-center">
            {showSearch ? (
              <div className="animate-search-in flex items-center overflow-hidden rounded-full border border-white/15 bg-white/[0.07] shadow-[0_0_24px_rgba(255,255,255,0.08)] backdrop-blur-md">
                <input
                  type="text"
                  placeholder="جستجو در طبقه ۱۶..."
                  className="h-10 w-[170px] bg-transparent px-4 text-sm text-white placeholder:text-gray-500 focus:outline-none sm:w-[230px]"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />

                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition-all duration-300 hover:rotate-90 hover:text-white"
                  aria-label="بستن جستجو"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleSearch}
                aria-label="جستجو"
                className="group flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-all duration-300 hover:bg-white/[0.07] hover:text-white active:scale-90"
              >
                <i className="fas fa-search text-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-90"
            >
              <span
                className={`absolute h-[2px] w-5 rounded-full bg-white transition-all duration-300 ease-out ${
                  isOpen
                    ? "translate-y-0 rotate-45"
                    : "-translate-y-[7px]"
                }`}
              />
              <span
                className={`absolute h-[2px] w-5 rounded-full bg-white transition-all duration-300 ease-out ${
                  isOpen ? "scale-x-0 opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute h-[2px] w-5 rounded-full bg-white transition-all duration-300 ease-out ${
                  isOpen
                    ? "translate-y-0 -rotate-45"
                    : "translate-y-[7px]"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        role="menu"
        aria-hidden={!isOpen}
        className={`overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out md:hidden ${
          isOpen ? "visible max-h-[520px] opacity-100" : "invisible max-h-0 opacity-0"
        }`}
      >
        <div className="relative mt-2 mb-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
          <div className="h-px w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />

          <nav className="p-3">
            <ul className="space-y-1.5">
              {NavbarItems.map((item, index) => {
                const Icon = MENU_ICONS[item.href] ?? Home;
                const isActive = pathname === item.href;

                return (
                  <li
                    key={item.href}
                    style={{
                      transitionDelay: isOpen
                        ? `${80 + index * 55}ms`
                        : "0ms",
                    }}
                    className={`transform transition-all duration-300 ${
                      isOpen
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-0"
                    }`}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      prefetch
                      className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-l from-white/[0.12] to-white/[0.03] text-white"
                          : "text-gray-300 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                          isActive
                            ? "bg-white/10 text-white"
                            : "bg-white/[0.05] text-gray-400 group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>

                      <span className="flex-1">{item.label}</span>

                      {isActive && (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                      )}

                      <ChevronLeft className="h-4 w-4 shrink-0 -translate-x-1 text-gray-500 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Mobile Authentication */}
            {!isLoading && (
              <div
                style={{
                  transitionDelay: isOpen
                    ? `${90 + NavbarItems.length * 55}ms`
                    : "0ms",
                }}
                className={`mt-3 border-t border-white/10 pt-3 transition-all duration-300 ${
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-2 opacity-0"
                }`}
              >
                {isAuthenticated && user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-300 hover:bg-white/[0.05]"
                    >
                      <UserAvatar
                        initial={avatarInitial}
                        src={user.avatarUrl}
                        size="small"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {user.name?.trim() || "کاربر طبقه ۱۶"}
                        </p>

                        <p
                          dir="ltr"
                          className="mt-0.5 truncate text-left text-[11px] text-gray-400"
                          title={user.email}
                        >
                          {user.email}
                        </p>
                      </div>

                      <ChevronLeft className="h-4 w-4 shrink-0 text-gray-500" />
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-right text-sm text-red-400 transition-colors duration-300 hover:bg-red-500/10"
                    >
                      <i
                        className="fas fa-right-from-bracket"
                        aria-hidden="true"
                      />
                      خروج از حساب
                    </button>
                  </>
                ) : (
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:bg-white/10"
                  >
                    ورود / ثبت‌نام
                  </Link>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
