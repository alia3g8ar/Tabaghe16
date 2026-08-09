"use client";

import Image from "next/image";
import {
  createPodcastComment,
  deletePodcastComment,
  formatDuration,
  getPodcastInteractions,
  getPublishedPodcast,
  listPodcastComments,
  togglePodcastLike,
  togglePodcastSave,
} from "@/utils/api";
import type {
  Podcast,
  PodcastComment,
  PodcastInteractions,
} from "@/utils/api";
import { useAuth } from "@/contexts/AuthContext";
import { resolveMediaUrl } from "@/utils/api";
import {
  Bookmark,
  CalendarDays,
  Clock3,
  Heart,
  Loader2,
  MessageCircle,
  Send,
  Share2,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

function getYoutubeEmbedUrl(value: string): string | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] || null;
    } else if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (url.pathname === "/watch") {
        videoId = url.searchParams.get("v");
      } else {
        const [kind, id] = url.pathname.split("/").filter(Boolean);
        if (kind === "embed" || kind === "shorts" || kind === "v") {
          videoId = id || null;
        }
      }
    }

    if (!videoId || !/^[A-Za-z0-9_-]{6,}$/.test(videoId)) {
      return null;
    }

    return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const getEmailInitial = (email: string) => {
  const emailUsername = email.trim().split("@")[0];
  return emailUsername?.charAt(0).toUpperCase() || "?";
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "همین حالا";
  if (minutes < 60) return `${minutes} دقیقه پیش`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ساعت پیش`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} روز پیش`;

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function formatPersianDate(dateString: string | null): string {
  if (!dateString) return "—";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
}

const WatchPodcastContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const { user, isAuthenticated } = useAuth();

  const [podcast, setPodcast] = useState<Podcast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // interactions
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [interactions, setInteractions] = useState<PodcastInteractions>({
    liked: false,
    saved: false,
  });
  const [actionPending, setActionPending] = useState<
    "like" | "save" | null
  >(null);

  // comments
  const [comments, setComments] = useState<PodcastComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );

  const commentsRef = useRef<HTMLDivElement>(null);

  const loadPodcast = useCallback(async () => {
    if (!slug) {
      setError("شناسه پادکست در آدرس موجود نیست.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getPublishedPodcast(slug);
      setPodcast(data);
      setLikesCount(data.likesCount ?? 0);
      setCommentsCount(data.commentsCount ?? 0);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : "خطا در بارگذاری پادکست";
      setError(message === "podcast not found" ? "پادکست موردنظر یافت نشد." : message);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const loadComments = useCallback(async () => {
    if (!slug) return;

    try {
      setCommentsLoading(true);
      const data = await listPodcastComments(slug);
      setComments(data);
    } catch {
      // comments are optional UI; keep the section usable
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    let cancelled = false;

    // Defer the loads out of the synchronous effect body (they update state),
    // and skip them entirely if the component unmounts first.
    void Promise.resolve().then(() => {
      if (cancelled) return;
      void loadPodcast();
      void loadComments();
    });

    return () => {
      cancelled = true;
    };
  }, [loadPodcast, loadComments]);

  useEffect(() => {
    if (!slug || !isAuthenticated) return;

    let cancelled = false;
    getPodcastInteractions(slug)
      .then((data) => {
        if (!cancelled) setInteractions(data);
      })
      .catch(() => {
        // silently ignore; buttons default to inactive
      });

    return () => {
      cancelled = true;
    };
  }, [slug, isAuthenticated]);

  const requireAuth = useCallback((): boolean => {
    if (isAuthenticated) return true;
    router.push("/sign-in");
    return false;
  }, [isAuthenticated, router]);

  const handleLike = async () => {
    if (!slug || !requireAuth() || actionPending) return;
    setActionPending("like");
    try {
      const data = await togglePodcastLike(slug);
      setInteractions((previous) => ({ ...previous, liked: data.liked }));
      setLikesCount(data.likesCount);
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        console.error("like failed:", caughtError.message);
      }
    } finally {
      setActionPending(null);
    }
  };

  const handleSave = async () => {
    if (!slug || !requireAuth() || actionPending) return;
    setActionPending("save");
    try {
      const data = await togglePodcastSave(slug);
      setInteractions((previous) => ({ ...previous, saved: data.saved }));
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        console.error("save failed:", caughtError.message);
      }
    } finally {
      setActionPending(null);
    }
  };

  const handleShare = () => {
    if (!podcast) return;

    if (navigator.share) {
      void navigator.share({
        title: podcast.title,
        text: podcast.guest || podcast.description || "",
        url: window.location.href,
      });
    } else {
      void navigator.clipboard.writeText(window.location.href);
      alert("لینک کپی شد!");
    }
  };

  const handleSubmitComment = async () => {
    if (!slug || !requireAuth()) return;
    const content = commentText.trim();
    if (!content) return;

    setCommentSubmitting(true);
    setCommentError(null);
    try {
      const created = await createPodcastComment(slug, content);
      setComments((previous) => [created, ...previous]);
      setCommentsCount((count) => count + 1);
      setCommentText("");
    } catch (caughtError) {
      setCommentError(
        caughtError instanceof Error
          ? caughtError.message
          : "ارسال نظر ناموفق بود",
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!slug) return;
    setDeletingCommentId(commentId);
    try {
      await deletePodcastComment(slug, commentId);
      setComments((previous) =>
        previous.filter((comment) => comment.id !== commentId),
      );
      setCommentsCount((count) => Math.max(0, count - 1));
    } catch (caughtError) {
      if (caughtError instanceof Error) {
        console.error("delete comment failed:", caughtError.message);
      }
    } finally {
      setDeletingCommentId(null);
    }
  };

  const scrollToComments = () => {
    commentsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const canDeleteComment = (comment: PodcastComment) => {
    if (!user) return false;
    if (user.role === "admin" || user.role === "owner") return true;
    return String(comment.user.id) === String(user.id);
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
          <p className="text-sm text-gray-400">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !podcast) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
          <p className="text-sm text-red-400">{error || "پادکست یافت نشد!"}</p>
          <button
            onClick={() => router.push("/podcasts")}
            className="mt-6 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
          >
            بازگشت به لیست پادکست‌ها
          </button>
        </div>
      </div>
    );
  }

  const youtubeEmbedUrl = podcast.videoUrl
    ? getYoutubeEmbedUrl(podcast.videoUrl)
    : null;
  const directVideoUrl =
    podcast.videoUrl && !youtubeEmbedUrl && isHttpUrl(podcast.videoUrl)
      ? podcast.videoUrl
      : null;

  return (
    <div className="w-full" dir="rtl">
      <div className="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
            <button
              onClick={() => router.push("/podcasts")}
              className="transition hover:text-white"
            >
              پادکست‌ها
            </button>
            <span>/</span>
            <span className="text-gray-400">{podcast.title}</span>
          </div>

          <h1 className="text-2xl font-IRANYekanExtraBold leading-snug text-white sm:text-3xl">
            {podcast.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-400">
            {podcast.guest && (
              <span className="flex items-center gap-1.5">
                <UserRound className="h-4 w-4" />
                مهمان: {podcast.guest}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-4 w-4" />
              مدت زمان: {formatDuration(podcast.durationSeconds)}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {formatPersianDate(podcast.publishedAt)}
            </span>
            {podcast.episodeNumber && (
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-gray-300">
                قسمت {new Intl.NumberFormat("fa-IR").format(podcast.episodeNumber)}
              </span>
            )}
          </div>
        </div>

        {/* Video player */}
        {podcast.videoUrl && (
          <div className="relative mb-6 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            <div className="relative aspect-video">
              {youtubeEmbedUrl ? (
                <iframe
                  className="absolute inset-0 h-full w-full"
                  src={youtubeEmbedUrl}
                  title={podcast.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : directVideoUrl ? (
                <video
                  className="absolute inset-0 h-full w-full bg-black"
                  controls
                  poster={podcast.coverImageUrl || undefined}
                  src={directVideoUrl}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
                  <p className="text-sm text-gray-400">لینک ویدیو پشتیبانی نمی‌شود</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!podcast.videoUrl && podcast.coverImageUrl && (
          <Image
            src={podcast.coverImageUrl}
            alt={podcast.title}
            width={1200}
            height={675}
            unoptimized
            className="mb-6 max-h-[32rem] w-full rounded-lg object-cover"
          />
        )}

        {podcast.audioUrl && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="mb-3 text-sm font-medium text-white">نسخه صوتی</p>
            <audio className="w-full" controls src={podcast.audioUrl}>
              مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
            </audio>
          </div>
        )}

        {/* Action bar */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <button
            onClick={handleLike}
            disabled={actionPending === "like"}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-60 ${
              interactions.liked
                ? "border-red-500/30 bg-red-500/10 text-red-400"
                : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25 hover:text-white"
            }`}
          >
            {actionPending === "like" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Heart
                className={`h-4 w-4 ${interactions.liked ? "fill-red-500 text-red-500" : ""}`}
              />
            )}
            {interactions.liked ? "پسندیدید" : "پسندیدن"}
            <span className="text-xs text-gray-400">
              {new Intl.NumberFormat("fa-IR").format(likesCount)}
            </span>
          </button>

          <button
            onClick={handleSave}
            disabled={actionPending === "save"}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-60 ${
              interactions.saved
                ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                : "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25 hover:text-white"
            }`}
          >
            {actionPending === "save" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Bookmark
                className={`h-4 w-4 ${interactions.saved ? "fill-amber-300 text-amber-300" : ""}`}
              />
            )}
            {interactions.saved ? "ذخیره شد" : "ذخیره"}
          </button>

          <button
            onClick={scrollToComments}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-white/25 hover:text-white active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
            {new Intl.NumberFormat("fa-IR").format(commentsCount)} نظر
          </button>

          <button
            onClick={handleShare}
            className="mr-auto flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-300 transition-all duration-200 hover:border-white/25 hover:text-white active:scale-95"
          >
            <Share2 className="h-4 w-4" />
            اشتراک‌گذاری
          </button>
        </div>

        {/* Description */}
        {podcast.description && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="leading-8 text-gray-300">{podcast.description}</p>
          </div>
        )}

        {/* Comments */}
        <div ref={commentsRef} className="scroll-mt-28">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-IRANYekanExtraBold text-white">
              <MessageCircle className="h-5 w-5 text-gray-400" />
              نظرات
              <span className="text-sm font-normal text-gray-500">
                ({new Intl.NumberFormat("fa-IR").format(commentsCount)})
              </span>
            </h2>
          </div>

          {/* Comment composer */}
          {isAuthenticated ? (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="mb-3 flex items-center gap-2.5">
                {resolveMediaUrl(user?.avatarUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveMediaUrl(user?.avatarUrl) ?? undefined}
                    alt="آواتار"
                    className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600 to-gray-900 text-sm font-bold text-white">
                    {user?.email ? getEmailInitial(user.email) : "؟"}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {user?.name?.trim() || "کاربر طبقه ۱۶"}
                  </p>
                  <p dir="ltr" className="truncate text-left text-[11px] text-gray-500">
                    {user?.email}
                  </p>
                </div>
              </div>

              <textarea
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                rows={3}
                placeholder="دیدگاه خود را بنویسید..."
                className="w-full resize-none rounded-xl border border-white/10 bg-black/40 p-3 text-sm leading-7 text-white placeholder:text-gray-500 focus:border-white/30 focus:outline-none"
              />

              {commentError && (
                <p className="mt-2 text-xs text-red-400">{commentError}</p>
              )}

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  {commentText.length} / 1000
                </span>
                <button
                  onClick={handleSubmitComment}
                  disabled={commentSubmitting || !commentText.trim()}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-gray-200 disabled:opacity-40"
                >
                  {commentSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  ارسال نظر
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <p className="text-sm text-gray-400">
                برای ثبت نظر باید وارد حساب خود شوید.
              </p>
              <button
                onClick={() => router.push("/sign-in")}
                className="mt-4 rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-gray-200"
              >
                ورود / ثبت‌نام
              </button>
            </div>
          )}

          {/* Comment list */}
          {commentsLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">در حال بارگذاری نظرات...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 py-10 text-center">
              <MessageCircle className="mx-auto mb-3 h-8 w-8 text-gray-600" />
              <p className="text-sm text-gray-500">
                هنوز نظری ثبت نشده است. اولین نفر باشید!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors duration-200 hover:bg-white/[0.05]"
                >
                  <div className="mb-2 flex items-center gap-2.5">
                    {resolveMediaUrl(comment.user.avatarUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          resolveMediaUrl(comment.user.avatarUrl) ?? undefined
                        }
                        alt="آواتار"
                        className="h-9 w-9 shrink-0 rounded-full border border-white/10 object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600 to-gray-900 text-sm font-bold text-white">
                        {getEmailInitial(comment.user.email || "?")}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {comment.user.name?.trim() || "کاربر طبقه ۱۶"}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {formatRelativeTime(comment.createdAt)}
                      </p>
                    </div>

                    {canDeleteComment(comment) && (
                      <button
                        onClick={() => void handleDeleteComment(comment.id)}
                        disabled={deletingCommentId === comment.id}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        title="حذف نظر"
                        aria-label="حذف نظر"
                      >
                        {deletingCommentId === comment.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>

                  <p className="whitespace-pre-wrap break-words text-sm leading-7 text-gray-300">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function WatchPodcast() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/60" />
        </div>
      }
    >
      <WatchPodcastContent />
    </Suspense>
  );
}
