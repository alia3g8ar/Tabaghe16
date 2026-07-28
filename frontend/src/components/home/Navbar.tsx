"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import logo from "@/assets/logo.png";
import { NavbarItems } from "@/composables/NavbarItems";
import { useAuth } from "@/contexts/AuthContext";

import "@fortawesome/fontawesome-free/css/all.min.css";

const ROLE_LABELS: Record<string, string> = {
  owner: "مالک",
  admin: "مدیر",
  user: "کاربر",
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
                      className="absolute top-full left-0 z-[70] mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
                    >
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

                      <div className="space-y-2 p-4 text-xs">
                        <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
                          <span className="text-gray-400">
                            نقش کاربری
                          </span>

                          <span className="font-medium text-gray-100">
                            {roleLabel}
                          </span>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2">
                          <span className="text-gray-400">
                            شناسه کاربر
                          </span>

                          <span
                            dir="ltr"
                            className="max-w-[140px] truncate font-mono text-gray-100"
                            title={user.id}
                          >
                            {user.id}
                          </span>
                        </div>

                        <div
                          aria-disabled="true"
                          className="relative mt-3 cursor-not-allowed overflow-hidden rounded-xl border border-white/10 bg-gradient-to-l from-white/[0.06] to-white/[0.02] p-3 opacity-50"
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
                          className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
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
              className="p-2 text-white transition-colors duration-300 hover:text-gray-300 focus:outline-none"
              aria-label="منو"
              aria-expanded={isOpen}
            >
              <i
                className={`fas ${
                  isOpen ? "fa-times" : "fa-bars"
                } text-xl`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`transition-all duration-300 ease-in-out md:hidden ${
          isOpen
            ? "visible max-h-[500px] opacity-100"
            : "invisible max-h-0 opacity-0"
        }`}
        role="menu"
        aria-hidden={!isOpen}
      >
        <div className="space-y-1 bg-gray-900/95 px-4 py-2 backdrop-blur-sm">
          {NavbarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors duration-300 ${
                pathname === item.href
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
              onClick={() => setIsOpen(false)}
              prefetch
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile Authentication */}
          {!isLoading && (
            <div className="mt-2 border-t border-gray-800 pt-2">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2">
                    <UserAvatar
                      initial={avatarInitial}
                      size="small"
                    />

                    <span
                      dir="ltr"
                      className="truncate text-left text-xs text-gray-300"
                      title={user.email}
                    >
                      {user.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-md px-3 py-2 text-right text-sm text-red-400 transition-colors hover:bg-gray-800"
                  >
                    خروج از حساب
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
                >
                  ورود / ثبت‌نام
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
