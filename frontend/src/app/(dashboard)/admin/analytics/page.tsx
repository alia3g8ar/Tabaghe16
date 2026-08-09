"use client";

import {
  BarChart3,
  Eye,
  Heart,
  Loader2,
  LogIn,
  MessageCircle,
  MousePointerClick,
  Podcast,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminAnalytics, resolveMediaUrl } from "@/utils/api";
import type { AdminAnalyticsOverview, AnalyticsRange } from "@/utils/api";

const faNumber = (value: number): string =>
  new Intl.NumberFormat("fa-IR").format(value);

const RANGES: { key: AnalyticsRange; label: string }[] = [
  { key: "today", label: "امروز" },
  { key: "week", label: "این هفته" },
  { key: "month", label: "این ماه" },
  { key: "year", label: "امسال" },
];

function formatWatchTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return "۰";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${faNumber(hours)} ساعت و ${faNumber(minutes)} دقیقه`;
  if (minutes > 0) return `${faNumber(minutes)} دقیقه`;
  return `${faNumber(totalSeconds)} ثانیه`;
}

function formatSessionDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "۰ ثانیه";
  if (totalSeconds < 60) return `${faNumber(totalSeconds)} ثانیه`;
  if (totalSeconds < 3600) return `${faNumber(Math.round(totalSeconds / 60))} دقیقه`;
  return `${faNumber(Math.floor(totalSeconds / 3600))} ساعت و ${faNumber(
    Math.round((totalSeconds % 3600) / 60),
  )} دقیقه`;
}

function formatTrendLabel(date: string, granularity: "hour" | "day"): string {
  if (!date) return "—";

  if (granularity === "hour") {
    const parsed = new Date(date.replace(" ", "T"));
    if (Number.isNaN(parsed.getTime())) return date;
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed);
  }

  const parsed = new Date(`${date}T00:00`);
  if (Number.isNaN(parsed.getTime())) return date;

  return new Intl.DateTimeFormat("fa-IR", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

type TrendPoint = { date: string; count: number };

function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }

  return path;
}

function LineAreaChart({
  title,
  icon,
  series,
  granularity,
  color,
  valueLabel,
}: {
  title: string;
  icon: React.ReactNode;
  series: TrendPoint[];
  granularity: "hour" | "day";
  color: string;
  valueLabel: string;
}) {
  const rawId = useId();
  const gradientId = `chart-grad-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const shadowId = `chart-shadow-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  const total = series.reduce((sum, point) => sum + point.count, 0);
  const max = Math.max(1, ...series.map((point) => point.count));
  const width = 640;
  const height = 220;
  const padding = 14;
  const count = series.length;

  const points = series.map((point, index) => {
    const x =
      count === 1
        ? width / 2
        : padding + (index * (width - 2 * padding)) / (count - 1);
    const y = height - padding - (point.count / max) * (height - 2 * padding);

    return { ...point, x, y };
  });

  const linePath = smoothPath(points);
  const areaPath = linePath
    ? `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : "";
  const showDots = count <= 90;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-gray-300">
          جمع: {faNumber(total)} {valueLabel}
        </span>
      </div>

      {series.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-500">
          هنوز داده‌ای برای این بازه ثبت نشده.
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label={title}
          >
            <defs>
              <linearGradient
                id={gradientId}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity="0.28" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
              <filter
                id={shadowId}
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="6"
                  stdDeviation="8"
                  floodColor={color}
                  floodOpacity="0.35"
                />
              </filter>
            </defs>

            {[0.25, 0.5, 0.75].map((fraction) => (
              <line
                key={fraction}
                x1={padding}
                x2={width - padding}
                y1={height - padding - fraction * (height - 2 * padding)}
                y2={height - padding - fraction * (height - 2 * padding)}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="1"
              />
            ))}

            {areaPath && <path d={areaPath} fill={`url(#${gradientId})`} />}

            {linePath && (
              <path
                d={linePath}
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#${shadowId})`}
              />
            )}

            {showDots &&
              points.map((point, index) => (
                <g key={`${point.date}-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="12"
                    fill="transparent"
                  >
                    <title>{`${formatTrendLabel(point.date, granularity)} — ${faNumber(point.count)} ${valueLabel}`}</title>
                  </circle>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3.5"
                    fill={color}
                    stroke="#0a0a0a"
                    strokeWidth="1.5"
                  />
                </g>
              ))}
          </svg>

          {count > 1 && (
            <div className="mt-2 flex justify-between text-[10px] text-gray-500">
              <span>{formatTrendLabel(points[0].date, granularity)}</span>
              {count > 2 && (
                <span>
                  {formatTrendLabel(
                    points[Math.floor(count / 2)].date,
                    granularity,
                  )}
                </span>
              )}
              <span>
                {formatTrendLabel(points[count - 1].date, granularity)}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AdminAnalyticsOverview | null>(null);
  const [range, setRange] = useState<AnalyticsRange>("week");
  const [loading, setLoading] = useState(true);
  const [rangeLoading, setRangeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (selectedRange: AnalyticsRange) => {
    try {
      setRangeLoading(true);
      setError(null);
      setData(await getAdminAnalytics(selectedRange));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "خطا در دریافت آمار",
      );
    } finally {
      setLoading(false);
      setRangeLoading(false);
    }
  }, []);

  useEffect(() => {
    // Defer the load out of the synchronous effect body (it updates state),
    // matching the pattern used elsewhere in the app.
    void Promise.resolve().then(() => {
      void load(range);
    });
  }, [load, range]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        {error}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { summary, periodSummary, loginsTrend, sessionsTrend, granularity, topPodcasts, recentLogins, recentComments } =
    data;

  const mostWatched = [...topPodcasts].sort(
    (a, b) => b.watchSeconds - a.watchSeconds,
  );
  const maxWatchSeconds = Math.max(
    1,
    ...mostWatched.map((item) => item.watchSeconds),
  );

  const periodCards = [
    {
      label: "بازدیدها",
      value: faNumber(periodSummary.sessions),
      icon: Eye,
      color: "text-cyan-400",
    },
    {
      label: "ورودها",
      value: faNumber(periodSummary.logins),
      icon: LogIn,
      color: "text-amber-400",
    },
    {
      label: "بازدیدکنندهٔ یکتا",
      value: faNumber(periodSummary.uniqueVisitors),
      icon: TrendingUp,
      color: "text-fuchsia-400",
    },
    {
      label: "زمان تماشا",
      value: formatWatchTime(periodSummary.watchSeconds),
      icon: Timer,
      color: "text-orange-400",
    },
    {
      label: "میانگین حضور",
      value: formatSessionDuration(periodSummary.avgDurationSeconds),
      icon: MousePointerClick,
      color: "text-sky-400",
    },
  ];

  const statCards = [
    {
      label: "کاربران",
      value: faNumber(summary.totalUsers),
      icon: Users,
      color: "text-sky-400",
    },
    {
      label: "اپیزودهای منتشرشده",
      value: faNumber(summary.totalPodcasts),
      icon: Podcast,
      color: "text-violet-400",
    },
    {
      label: "نظرات",
      value: faNumber(summary.totalComments),
      icon: MessageCircle,
      color: "text-emerald-400",
    },
    {
      label: "لایک‌ها",
      value: faNumber(summary.totalLikes),
      icon: Heart,
      color: "text-red-400",
    },
    {
      label: "ورودها",
      value: faNumber(summary.totalLogins),
      icon: LogIn,
      color: "text-amber-400",
    },
    {
      label: "بازدیدها (جلسات)",
      value: faNumber(summary.totalSessions),
      icon: Eye,
      color: "text-cyan-400",
    },
    {
      label: "بازدیدکنندهٔ منحصربه‌فرد",
      value: faNumber(summary.uniqueVisitors),
      icon: TrendingUp,
      color: "text-fuchsia-400",
    },
    {
      label: "زمان کل تماشا",
      value: formatWatchTime(summary.totalWatchSeconds),
      icon: Timer,
      color: "text-orange-400",
    },
  ];

  const activeRangeLabel =
    RANGES.find((item) => item.key === range)?.label ?? "این هفته";

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <BarChart3 className="h-6 w-6 text-sky-400" />
          آمار و تحلیل سایت
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          تمام اطلاعات واقعی بازدید، ورود، تماشا و تعامل‌ها — امروز:{" "}
          {faNumber(summary.loginsToday)} ورود • {faNumber(summary.sessionsToday)}{" "}
          بازدید • میانگین حضور{" "}
          {formatSessionDuration(summary.avgSessionDurationSeconds)}
        </p>
      </div>

      {/* Period selector + period summary */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Timer className="h-4 w-4 text-sky-400" />
            آمار بازهٔ {activeRangeLabel}
          </h2>

          <div
            role="tablist"
            aria-label="بازه زمانی"
            className="flex w-full overflow-hidden rounded-xl border border-white/10 bg-black/30 p-1 sm:w-auto"
          >
            {RANGES.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={range === item.key}
                onClick={() => setRange(item.key)}
                className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm ${
                  range === item.key
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {periodCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-gray-400">
                    {card.label}
                  </span>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                <p className="truncate text-lg font-bold text-white">
                  {card.value}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trend charts */}
      <div className="relative grid grid-cols-1 gap-4 lg:grid-cols-2">
        {rangeLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-black/40 backdrop-blur-[2px]">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
          </div>
        )}

        <LineAreaChart
          title="بازدیدها"
          icon={<Eye className="h-4 w-4 text-cyan-400" />}
          series={sessionsTrend}
          granularity={granularity}
          color="#22d3ee"
          valueLabel="بازدید"
        />
        <LineAreaChart
          title="ورودها"
          icon={<LogIn className="h-4 w-4 text-amber-400" />}
          series={loginsTrend}
          granularity={granularity}
          color="#fbbf24"
          valueLabel="ورود"
        />
      </div>

      {/* All-time stat cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-gray-400">{card.label}</span>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className="truncate text-xl font-bold text-white sm:text-2xl">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Top podcasts */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
          <MousePointerClick className="h-5 w-5 text-sky-400" />
          <h3 className="text-sm font-semibold text-white">
            محبوب‌ترین اپیزودها (بر اساس کلیک / بازدید)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead className="bg-white/[0.04]">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  #
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  اپیزود
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  بازدید
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  زمان تماشا
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  بینندهٔ یکتا
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  لایک
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  کامنت
                </th>
              </tr>
            </thead>
            <tbody>
              {topPodcasts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-gray-500"
                  >
                    هنوز اپیزودی مشاهده نشده.
                  </td>
                </tr>
              ) : (
                topPodcasts.map((item, index) => (
                  <tr
                    key={item.podcast.id}
                    className="border-b border-white/[0.06] last:border-0 transition-colors duration-200 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {faNumber(index + 1)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/watch?slug=${encodeURIComponent(item.podcast.slug)}`,
                          )
                        }
                        className="group flex items-center gap-3 text-right"
                        title="مشاهده اپیزود"
                      >
                        {resolveMediaUrl(item.podcast.coverImageUrl) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              resolveMediaUrl(item.podcast.coverImageUrl) ??
                              undefined
                            }
                            alt={item.podcast.title}
                            className="h-10 w-16 shrink-0 rounded-md border border-white/10 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="flex h-10 w-16 shrink-0 items-center justify-center rounded-md border border-white/10 bg-gray-800 text-[10px] text-gray-500">
                            بدون تصویر
                          </span>
                        )}
                        <span className="line-clamp-2 max-w-[260px] text-sm font-medium text-white transition group-hover:text-sky-300">
                          {item.podcast.title}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {faNumber(item.views)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {formatWatchTime(item.watchSeconds)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {faNumber(item.viewers)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {faNumber(item.likesCount)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {faNumber(item.commentsCount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Most watched + recent logins */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-2">
            <Timer className="h-5 w-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-white">
              پربیننده‌ترین از نظر زمان تماشا
            </h3>
          </div>

          {mostWatched.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              هنوز داده‌ای ثبت نشده.
            </p>
          ) : (
            <div className="space-y-4">
              {mostWatched.slice(0, 5).map((item) => (
                <div key={item.podcast.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/watch?slug=${encodeURIComponent(item.podcast.slug)}`,
                        )
                      }
                      className="line-clamp-1 text-right text-sm text-gray-200 transition hover:text-orange-300"
                    >
                      {item.podcast.title}
                    </button>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatWatchTime(item.watchSeconds)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-l from-orange-500 to-amber-400"
                      style={{
                        width: `${Math.round(
                          (item.watchSeconds / maxWatchSeconds) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="mb-4 flex items-center gap-2">
            <LogIn className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">آخرین ورودها</h3>
          </div>

          {recentLogins.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              هنوز ورودی ثبت نشده.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogins.map((login) => (
                <div
                  key={login.id}
                  className="flex items-center gap-3 border-b border-white/[0.06] pb-3 last:border-0 last:pb-0"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600 to-gray-900 text-xs font-bold text-white">
                    {login.email?.charAt(0).toUpperCase() || "؟"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-200">
                      {login.name?.trim() || "کاربر طبقه ۱۶"}
                    </p>
                    <p dir="ltr" className="truncate text-left text-[11px] text-gray-500">
                      {login.email || "—"}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-gray-500">
                    {formatFullDate(login.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent comments */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">آخرین نظرات</h3>
        </div>

        {recentComments.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            هنوز نظری ثبت نشده.
          </p>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {recentComments.map((comment) => (
              <div key={comment.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-white">
                    {comment.user.name?.trim() || "کاربر طبقه ۱۶"}
                  </span>
                  <span className="text-[11px] text-gray-500">
                    {formatFullDate(comment.createdAt)}
                  </span>
                  {comment.podcast.title && (
                    <button
                      type="button"
                      onClick={() =>
                        comment.podcast.slug &&
                        router.push(
                          `/watch?slug=${encodeURIComponent(comment.podcast.slug)}`,
                        )
                      }
                      className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-sky-300 transition hover:border-sky-400/40"
                    >
                      {comment.podcast.title}
                    </button>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-gray-300">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}
    </div>
  );
}
