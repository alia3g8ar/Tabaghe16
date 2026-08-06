"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import logo from "@/assets/logo.png";
import { NavbarItems } from "@/composables/NavbarItems";
import { useAuth } from "@/contexts/AuthContext";
import {
  ChevronLeft,
  Clapperboard,
  Home,
  Podcast,
  type LucideIcon,
} from "lucide-react";

import "@fortawesome/fontawesome-free/css/all.min.css";

const ROLE_LABELS: Record<string, string> = {
  owner: "مالک",
  admin: "مدیر",
  user: "کاربر",
};

const MENU_ICONS: Record<string, LucideIcon> = {
  "/": Home,
  "/podcasts": Podcast,
  "/#short-videos": Clapperboard,
};

const getEmailInitial = (email: string) => {
  const emailUsername = email.trim().split("@")[0];

  return emailUsername?.charAt(0).toUpperCase() || "?";
};

interface UserAvatarProps {
  initial: string;
  size?: "small" | "large";
  isActive?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  initial,
  size = "large",
  isActive = false,
}) => {
  const sizeClasses =
    size === "small"
      ? "h-10 w-10 text-lg"
      : "h-12 w-12 text-xl";

  return (
    <span
      aria-hidden="true"
      dir="ltr"
      className={`flex shrink-0 items-center justify-center rounded-full border-2 bg-gradient-to-br from-gray-700 to-gray-950 font-bold uppercase text-white shadow-md transition-all duration-200 ${sizeClasses} ${
        isActive
          ? "border-white shadow-white/10"
          : "border-transparent hover:border-gray-500"
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

  const roleLabel = user
    ? ROLE_LABELS[user.role] ?? user.role
    : "";

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
    <nav className="sticky top-0 z-50 mx-auto flex max-w-6xl flex-col justify-center bg-black/95 pt-4 pl-[13px] font-IRANSans backdrop-blur-sm">
      <div className="mx-auto flex w-[98%] items-center justify-between py-2 md:py-4">
        {/* Logo */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="ml-2.5 shrink-0 md:ml-5">
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
          <ul className="hidden space-x-4 md:flex md:items-center lg:space-x-8 rtl:space-x-reverse">
            {NavbarItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`text-sm font-medium transition-colors duration-300 ${
                    pathname === item.href
                      ? "font-bold text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                  prefetch
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center">
          {/* Authentication */}
          {!isLoading && (
            <>
              {isAuthenticated && user ? (
                <div
                  ref={profileMenuRef}
                  className="relative ml-2.5 hidden md:ml-5 md:block"
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
                      isActive={isProfileOpen}
                    />
                  </button>

                  {isProfileOpen && (
                    <div
                      id="user-profile-menu"
                      role="menu"
                      dir="rtl"
                      className="animate-popup-in absolute top-full left-0 z-[70] mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md"
                    >
                      <div className="h-px w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />

                      <div className="flex items-center gap-3 border-b border-white/10 p-4">
                        <UserAvatar initial={avatarInitial} />

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

                      <div className="space-y-2 p-3 text-xs">
                        <div className="group flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 transition-colors duration-300 hover:bg-white/[0.08]">
                          <span className="flex items-center gap-2.5 text-gray-400">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-gray-300 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                              <i
                                className="fas fa-user-shield text-[10px]"
                                aria-hidden="true"
                              />
                            </span>
                            نقش کاربری
                          </span>

                          <span className="font-medium text-gray-100">
                            {roleLabel}
                          </span>
                        </div>

                        <div className="group flex items-center justify-between gap-2 rounded-xl bg-white/[0.04] px-3 py-2.5 transition-colors duration-300 hover:bg-white/[0.08]">
                          <span className="flex items-center gap-2.5 text-gray-400">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-gray-300 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                              <i
                                className="fas fa-fingerprint text-[10px]"
                                aria-hidden="true"
                              />
                            </span>
                            شناسه کاربر
                          </span>

                          <span
                            dir="ltr"
                            className="max-w-[130px] truncate font-mono text-gray-100"
                            title={user.id}
                          >
                            {user.id}
                          </span>
                        </div>

                        <div
                          aria-disabled="true"
                          className="relative mt-2 cursor-not-allowed overflow-hidden rounded-xl border border-white/10 bg-gradient-to-l from-white/[0.06] to-white/[0.02] p-3 opacity-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gray-300">
                              <i
                                className="fas fa-bookmark"
                                aria-hidden="true"
                              />
                            </div>

                            <div className="min-w-0 flex-1 text-right">
                              <p className="text-sm font-medium text-gray-100">
                                پادکست‌های ذخیره‌شده
                              </p>

                              <p className="mt-1 text-[11px] leading-5 text-gray-400">
                                پادکست‌های موردعلاقه‌ات را اینجا نگه دار
                              </p>
                            </div>

                            <span className="shrink-0 rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] text-gray-300">
                              به‌زودی
                            </span>
                          </div>

                          <div
                            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <div className="border-t border-white/10 p-3">
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
                  className="ml-2.5 hidden text-sm text-gray-300 transition-colors hover:text-white md:ml-5 md:block"
                >
                  ورود
                </Link>
              )}
            </>
          )}

          {/* Search */}
          <div className="relative ml-2 md:ml-4">
            {showSearch ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="h-10 w-[180px] border-b border-white px-4 pr-10 text-white transition-colors duration-300 focus:outline-none sm:w-[230px]"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />

                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="absolute top-1/2 left-3 -translate-y-1/2 transform text-gray-400 transition-colors duration-300 hover:text-white"
                  aria-label="بستن جستجو"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleSearch}
                className="p-2 text-gray-400 transition-colors duration-300 hover:text-white"
                aria-label="جستجو"
              >
                <i className="fas fa-search text-lg" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="ml-2 md:hidden">
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
        <div className="relative mx-3 mb-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md">
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
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2">
                      <UserAvatar
                        initial={avatarInitial}
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
                    </div>

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
