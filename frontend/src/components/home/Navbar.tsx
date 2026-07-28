"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import logo from "@/assets/logo.png";
import Profile from "@/assets/photo.jpg";
import { NavbarItems } from "@/composables/NavbarItems";
import { useAuth } from "@/contexts/AuthContext";

import "@fortawesome/fontawesome-free/css/all.min.css";

const ROLE_LABELS: Record<string, string> = {
  owner: "مالک",
  admin: "مدیر",
  user: "کاربر",
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
    setIsOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    setIsProfileOpen(false);
    setShowSearch((prev) => !prev);
  };

  const toggleProfile = () => {
    setShowSearch(false);
    setIsProfileOpen((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsProfileOpen(false);
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <nav className="max-w-6xl mx-auto pl-[13px] flex justify-center flex-col font-IRANSans bg-black/95 backdrop-blur-sm sticky top-0 pt-4 z-50">
      <div className="w-[98%] mx-auto flex justify-between items-center py-2 md:py-4">
        {/* Logo */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className="shrink-0 ml-2.5 md:ml-5">
            <Link href="/">
              <Image
                src={logo}
                alt="طبقه 16"
                width={48}
                height={40}
                className="w-10 h-8 md:w-12 md:h-10 object-contain hover:opacity-80 transition-opacity"
                priority
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex md:items-center space-x-4 lg:space-x-8 rtl:space-x-reverse">
            {NavbarItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`transition-colors duration-300 text-sm font-medium ${
                    pathname === item.href
                      ? "text-white font-bold"
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
                  className="relative hidden md:block ml-2.5 md:ml-5"
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
                    <Image
                      src={Profile}
                      alt="پروفایل"
                      width={48}
                      height={48}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full border-2 object-cover transition-all duration-200 ${
                        isProfileOpen
                          ? "border-white"
                          : "border-transparent hover:border-gray-500"
                      }`}
                      priority
                    />
                  </button>

                  {isProfileOpen && (
                    <div
                      id="user-profile-menu"
                      role="menu"
                      dir="rtl"
                      className="absolute left-0 top-full z-[70] mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#171717] shadow-[0_20px_60px_rgba(0,0,0,0.65)]"                    >



                      <div className="flex items-center gap-3 border-b border-white/10 p-4">
                        <Image
                          src={Profile}
                          alt=""
                          width={48}
                          height={48}
                          className="h-12 w-12 shrink-0 rounded-full object-cover"
                        />

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
                  className="hidden md:block ml-2.5 md:ml-5 text-sm text-gray-300 hover:text-white transition-colors"
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
                  className="w-[180px] sm:w-[230px] h-10 text-white border-b border-white focus:outline-none px-4 pr-10 transition-colors duration-300"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />

                <button
                  type="button"
                  onClick={() => setShowSearch(false)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                  aria-label="بستن جستجو"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={toggleSearch}
                className="text-gray-400 hover:text-white transition-colors duration-300 p-2"
                aria-label="جستجو"
              >
                <i className="fas fa-search text-lg" />
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-2">
            <button
              type="button"
              onClick={toggleMenu}
              className="text-white hover:text-gray-300 focus:outline-none transition-colors duration-300 p-2"
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
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-[500px] opacity-100 visible"
            : "max-h-0 opacity-0 invisible"
        }`}
        role="menu"
        aria-hidden={!isOpen}
      >
        <div className="px-4 py-2 space-y-1 bg-gray-900/95 backdrop-blur-sm">
          {NavbarItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md transition-colors duration-300 text-sm font-medium ${
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
            <div className="border-t border-gray-800 mt-2 pt-2">
              {isAuthenticated && user ? (
                <>
                  <div className="px-3 py-2 flex items-center gap-3">
                    <Image
                      src={Profile}
                      alt="پروفایل"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full"
                    />

                    <span className="text-xs text-gray-300 truncate">
                      {user.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-right px-3 py-2 rounded-md text-sm text-red-400 hover:bg-gray-800 transition-colors"
                  >
                    خروج از حساب
                  </button>
                </>
              ) : (
                <Link
                  href="/sign-in"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
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