"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  ListMusic,
  Mic2,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import UserProfileCard from "@/components/dashboard/UserProfileCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  listAdminPodcasts,
  listAdminUsers,
} from "@/utils/api";

type DashboardStats = {
  users: number;
  podcasts: number;
  published: number;
  drafts: number;
};

export default function Profile() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [usersResult, podcastsResult, publishedResult] =
        await Promise.all([
          listAdminUsers({ page: 1, limit: 1 }),
          listAdminPodcasts({ page: 1, limit: 1 }),
          listAdminPodcasts({ page: 1, limit: 1, status: "published" }),
        ]);

      setStats({
        users: usersResult.meta.total,
        podcasts: podcastsResult.meta.total,
        published: publishedResult.meta.total,
        drafts: podcastsResult.meta.total - publishedResult.meta.total,
      });
      setStatsError(false);
    } catch {
      setStatsError(true);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  const statCards = [
    {
      key: "users",
      label: "کاربران",
      value: stats?.users,
      icon: Users,
      accent: "text-sky-400",
      iconBg: "bg-sky-500/10",
    },
    {
      key: "podcasts",
      label: "کل پادکست‌ها",
      value: stats?.podcasts,
      icon: ListMusic,
      accent: "text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      key: "published",
      label: "منتشرشده",
      value: stats?.published,
      icon: Mic2,
      accent: "text-violet-400",
      iconBg: "bg-violet-500/10",
    },
    {
      key: "drafts",
      label: "پیش‌نویس",
      value: stats?.drafts,
      icon: LayoutDashboard,
      accent: "text-amber-400",
      iconBg: "bg-amber-500/10",
    },
  ];

  const quickActions = [
    {
      label: "مدیریت پادکست‌ها",
      description: "افزودن، ویرایش و انتشار اپیزودها",
      href: "/admin/podcasts",
      icon: ListMusic,
    },
    {
      label: "مدیریت کاربران",
      description: "بررسی نقش و تأیید کاربران",
      href: "/admin/users",
      icon: UserPlus,
    },
    {
      label: "مشاهده سایت",
      description: "بازدید از صفحه اصلی طبقه ۱۶",
      href: "/",
      icon: TrendingUp,
    },
  ];

  const formatNumber = (value: number | undefined) =>
    value === undefined
      ? "—"
      : value.toLocaleString("fa-IR");

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {user?.name?.trim() || "کاربر طبقه ۱۶"}
            <span className="text-gray-500"> — داشبورد</span>
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            نمای کلی پنل مدیریت طبقه ۱۶
          </p>
        </div>
      </div>

      {/* User profile card */}
      <UserProfileCard
        name={user?.name || ""}
        email={user?.email || ""}
        role={user?.role || "user"}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.key}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05]"
            >
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${card.iconBg} ${card.accent} transition-transform duration-300 group-hover:scale-110`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-2xl font-bold text-white">
                {formatNumber(card.value)}
              </p>
              <p className="mt-1 text-sm text-gray-400">{card.label}</p>
            </div>
          );
        })}
      </div>

      {statsError && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">
          دریافت آمار با خطا مواجه شد. مطمئن شوید بک‌اند در حال اجراست.
        </div>
      )}

      {/* Quick Actions */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-bold text-white">دسترسی سریع</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.href}
                onClick={() => router.push(action.href)}
                className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 text-right transition-all duration-300 hover:border-white/20 hover:bg-white/[0.05] active:scale-[0.98]"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-gray-200 transition-colors duration-300 group-hover:bg-white/10 group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-white">
                    {action.label}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-gray-400">
                    {action.description}
                  </span>
                </span>
                <ArrowLeft className="h-4 w-4 shrink-0 text-gray-500 transition-all duration-300 group-hover:-translate-x-1 group-hover:text-white" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
