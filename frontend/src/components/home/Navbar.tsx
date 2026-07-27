"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import logo from "@/assets/logo.png";
import Profile from "@/assets/photo.jpg";
import { NavbarItems } from "@/composables/NavbarItems";
import { useAuth } from "@/contexts/AuthContext";

import "@fortawesome/fontawesome-free/css/all.min.css";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const toggleSearch = () => {
    setShowSearch((prev) => !prev);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/sign-in");
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
                <div className="hidden md:flex items-center gap-3 ml-2.5 md:ml-5">
                  <div
                    className="flex items-center gap-2"
                    title={user.email}
                  >
                    <Image
                      src={Profile}
                      alt="پروفایل"
                      width={48}
                      height={48}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-transparent"
                      priority
                    />

                    <span className="hidden lg:block text-xs text-gray-300 max-w-[160px] truncate">
                      {user.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    خروج
                  </button>
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