"use client";
import { Menu, X, LogOut } from "lucide-react";
import Image from "next/image";
import logo from "../../assets/logo.png";
import { menuItems } from "@/composables/MenuItems";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";

interface SidebarProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const getEmailInitial = (email: string) => {
  const emailUsername = email.trim().split("@")[0];

  return emailUsername?.charAt(0).toUpperCase() || "?";
};

const ROLE_LABELS: Record<string, string> = {
  owner: "مالک",
  admin: "مدیر",
  user: "کاربر",
};

export default function Sidebar({ isOpen = true, onToggle }: SidebarProps) {
  const items = menuItems;
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => pathname === path;

  const handleLogout = () => {
    logout();
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <>
      {isOpen && (
        <div
          className="animate-backdrop-in fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed right-0 top-0 z-40 flex h-full flex-col border-l border-white/10 bg-[#0d0d0d]/95 backdrop-blur-md
        transition-all duration-300
        ${isOpen ? "w-64" : "w-16"}`}
      >
        {/* Logo Section */}
        <div
          className={`flex h-16 shrink-0 items-center border-b border-white/10 px-4 ${
            isOpen ? "justify-between" : "justify-center"
          }`}
        >
          {isOpen && (
            <div className="flex items-center gap-3">
              <Image
                src={logo}
                alt="طبقه ۱۶"
                width={40}
                height={32}
                className="object-contain"
              />
              <div className="leading-tight">
                <p className="text-sm font-bold text-white">طبقه ۱۶</p>
                <p className="text-[10px] text-gray-400">پنل مدیریت</p>
              </div>
            </div>
          )}

          {!isOpen && (
            <Image
              src={logo}
              alt="طبقه ۱۶"
              width={32}
              height={32}
              className="object-contain"
            />
          )}

          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-white/[0.06] transition-colors text-gray-300 hover:text-white"
            aria-label={isOpen ? "بستن منو" : "باز کردن منو"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {isOpen && (
            <p className="mb-3 px-2 text-[11px] font-medium text-gray-500">
              منوی مدیریت
            </p>
          )}
          <ul className="space-y-1.5">
            {items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <li key={item.key}>
                  <button
                    onClick={() => router.push(item.path)}
                    title={!isOpen ? item.label : undefined}
                    className={`flex w-full items-center rounded-lg py-2.5 font-medium text-sm
                      transition-colors duration-200
                      ${isOpen ? "px-3" : "px-2 justify-center"}
                      ${
                        active
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${isOpen ? "ml-3" : ""}`}
                    />
                    {isOpen && (
                      <span className="truncate text-right flex-1">
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Footer */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {user ? (
            <div
              className={`flex items-center rounded-xl bg-white/[0.04] p-2.5 transition-colors duration-200 hover:bg-white/[0.06] ${
                isOpen ? "" : "justify-center"
              }`}
            >
              <span
                dir="ltr"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600 to-gray-900 text-sm font-bold text-white"
              >
                {getEmailInitial(user.email)}
              </span>

              {isOpen && (
                <>
                  <div className="min-w-0 flex-1 px-3 text-right">
                    <p className="truncate text-xs font-semibold text-white">
                      {user.name?.trim() || "کاربر طبقه ۱۶"}
                    </p>
                    <p className="truncate text-[10px] text-gray-400">
                      {ROLE_LABELS[user.role] ?? user.role}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="rounded-lg p-2 text-gray-400 transition-colors duration-200 hover:bg-red-500/10 hover:text-red-400"
                    aria-label="خروج از حساب"
                    title="خروج از حساب"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ) : (
            isOpen && (
              <p className="px-2 py-2 text-center text-xs text-gray-500">
                وارد نشده‌اید
              </p>
            )
          )}
        </div>
      </aside>
    </>
  );
}
