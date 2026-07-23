"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "@/assets/logo.png";
import Profile from "@/assets/photo.jpg";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarItems } from "@/composables/NavbarItems";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <nav className="max-w-6xl mx-auto pl-[13px] flex justify-center flex-col font-IRANSans bg-black/95 backdrop-blur-sm sticky top-0 pt-4 z-50">
      <div className="w-[98%] mx-auto flex justify-between items-center py-2 md:py-4">
        {/* logo */}
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

          {/* menu - Desktop */}
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
                  prefetch={true}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center">
          {/* Profile btn */}
          <Link href="/profile" className="shrink-0 ml-2.5 md:ml-5">
            <Image
              src={Profile}
              alt="پروفایل"
              width={48}
              height={48}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-transparent hover:border-gray-300 transition-colors"
              priority
            />
          </Link>

          {/* Search */}
          <div className="relative ml-2 md:ml-4">
            {showSearch ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="جستجو..."
                  className="w-[180px] sm:w-[230px] h-10 text-white border-b border-white focus:outline-none px-4 pr-10  transition-colors duration-300"
                  autoFocus
                  onBlur={() => setShowSearch(false)}
                />
                <button
                  onClick={() => setShowSearch(false)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            ) : (
              <button
                onClick={toggleSearch}
                className="text-gray-400 hover:text-white transition-colors duration-300 p-2"
                aria-label="جستجو"
              >
                <i className="fas fa-search text-lg" />
              </button>
            )}
          </div>

          {/* دکمه منوی موبایل */}
          <div className="md:hidden ml-2">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-gray-300 focus:outline-none transition-colors duration-300 p-2"
              aria-label="منو"
              aria-expanded={isOpen}
            >
              <i className={`fas ${isOpen ? "fa-times" : "fa-bars"} text-xl`} />
            </button>
          </div>
        </div>
      </div>

      {/* منوی موبایل */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-96 opacity-100 visible"
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
              prefetch={true}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
