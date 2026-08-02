"use client";
import { Bell, LogOut, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const getEmailInitial = (email: string) => {
  const emailUsername = email.trim().split("@")[0];

  return emailUsername?.charAt(0).toUpperCase() || "?";
};

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/sign-in");
    router.refresh();
  };

  return (
    <header className="shrink-0 border-b border-white/10 bg-[#0a0a0a]/80 px-6 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white sm:text-xl">
            پنل مدیریت
          </h1>
          <span className="hidden h-5 w-px bg-white/10 sm:block" />
          <p className="hidden text-sm text-gray-400 sm:block">
            طبقه ۱۶ — جایی برای تمرکز، رشد و ساختن
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="جستجو..."
              className="w-52 rounded-xl border border-white/10 bg-white/[0.04] py-2 pl-3 pr-10 text-sm text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
            />
          </div>

          {/* Notifications */}
          <button
            className="relative rounded-xl p-2 text-gray-400 transition-all duration-300 hover:bg-white/[0.06] hover:text-white active:scale-90"
            aria-label="اعلان‌ها"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
          </button>

          {/* User chip */}
          {user && (
            <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5">
              <span
                dir="ltr"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600 to-gray-900 text-xs font-bold text-white"
              >
                {getEmailInitial(user.email)}
              </span>
              <div className="hidden text-right sm:block">
                <p className="max-w-[140px] truncate text-xs font-medium text-white">
                  {user.name?.trim() || "کاربر طبقه ۱۶"}
                </p>
                <p className="max-w-[140px] truncate text-[10px] text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition-all duration-300 hover:bg-red-500/20 hover:text-red-300 active:scale-[0.97]"
            aria-label="خروج از حساب"
            title="خروج از حساب"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden lg:inline">خروج</span>
          </button>
        </div>
      </div>
    </header>
  );
}
