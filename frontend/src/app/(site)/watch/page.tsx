"use client";

import Image from "next/image";
import {
  createPodcastComment,
  deletePodcastComment,
  formatDuration,
  getPodcastInteractions,
  getPublishedPodcast,
  listPodcastComments,
  listPublishedPodcasts,
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
import { trackWatch } from "@/utils/tracking";
import {
  Bookmark,
  ChevronDown,
  ChevronUp,
  Heart,
  ListVideo,
  Loader2,
  MessageCircle,
  Play,
  Send,
  Share2,
  Trash2,
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

const formatFaNumber = (value: number): string =>
  new Intl.NumberFormat("fa-IR").format(value);

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

  // related episodes ("up next" sidebar)
  const [related, setRelated] = useState<Podcast[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // description expand/collapse
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

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
  const previousSlugRef = useRef<string | null>(null);

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
      setError(
        message === "podcast not found"
          ? "این پادکست رو پیدا نکردیم!"
          : message,
      );
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

  const loadRelated = useCallback(async () => {
    try {
      setRelatedLoading(true);
      const response = await listPublishedPodcasts({ limit: 12 });
      setRelated(
        response.data.filter((episode) => episode.slug !== slug).slice(0, 8),
      );
    } catch {
      // recommendations are optional UI
      setRelated([]);
    } finally {
      setRelatedLoading(false);
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
      void loadRelated();
    });

    return () => {
      cancelled = true;
    };
  }, [loadPodcast, loadComments, loadRelated]);

  // When switching episodes from the sidebar, start from the top of the page
  // and reset per-episode UI state.
  useEffect(() => {
    if (
      slug &&
      previousSlugRef.current &&
      previousSlugRef.current !== slug
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setDescriptionExpanded(false);
    }
    previousSlugRef.current = slug;
  }, [slug]);

  // Track episode views and accumulated watch time while the page is open.
  useEffect(() => {
    if (!podcast) return;

    const podcastId = Number(podcast.id);
    if (!Number.isFinite(podcastId)) return;

    // First call with 0 registers the episode view (counts as a click).
    trackWatch(podcastId, 0);

    const watchRef = { podcastId, lastFlushAt: Date.now() };

    const heartbeat = window.setInterval(() => {
      const now = Date.now();
      const seconds = Math.round((now - watchRef.lastFlushAt) / 1000);
      if (seconds < 1) return;
      watchRef.lastFlushAt = now;
      trackWatch(watchRef.podcastId, seconds);
    }, 15_000);

    const flush = () => {
      const seconds = Math.max(
        1,
        Math.round((Date.now() - watchRef.lastFlushAt) / 1000),
      );
      trackWatch(watchRef.podcastId, seconds);
    };
    window.addEventListener("pagehide", flush);

    return () => {
      window.clearInterval(heartbeat);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [podcast?.id]);

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
          <p className="text-sm text-gray-400">داریم آماده‌ش می‌کنیم...</p>
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

  const descriptionIsLong = (podcast.description?.length ?? 0) > 300;

  const episodeMeta = [
    podcast.episodeNumber
      ? `قسمت ${formatFaNumber(podcast.episodeNumber)}`
      : null,
    formatPersianDate(podcast.publishedAt),
    podcast.durationSeconds !== null
      ? `مدت: ${formatDuration(podcast.durationSeconds)}`
      : null,
    podcast.guest ? `مهمان: ${podcast.guest}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="w-full" dir="rtl">
      <div className="mx-auto w-full px-4 py-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
          <button
            onClick={() => router.push("/podcasts")}
            className="transition hover:text-white"
          >
            پادکست‌ها
          </button>
          <span>/</span>
          <span className="truncate text-gray-400">{podcast.title}</span>
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_400px]">
          {/* ================= Main column (right in RTL, like YouTube) ================= */}
          <div className="min-w-0">
            {/* Player */}
            {podcast.coverImageUrl ? (
              <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                <div className="relative aspect-video">
                  <Image
                    src={podcast.coverImageUrl}
                    alt={podcast.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                    unoptimized
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white shadow-[0_0_40px_rgba(0,0,0,0.5)] backdrop-blur-md sm:h-20 sm:w-20">
                      <Play className="h-7 w-7 translate-x-[-1px] fill-current sm:h-9 sm:w-9" />
                    </span>
                  </div>

                  {podcast.durationSeconds !== null && (
                    <span
                      dir="ltr"
                      className="absolute bottom-3 left-3 rounded-md bg-black/80 px-2 py-1 text-xs font-medium text-white"
                    >
                      {formatDuration(podcast.durationSeconds)}
                    </span>
                  )}
                </div>
              </div>
            ) : podcast.videoUrl ? (
              <div className="relative mb-4 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
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
            ) : null}

            {podcast.audioUrl && (
              <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <p className="mb-2 text-sm font-medium text-white">نسخه صوتی</p>
                <audio className="w-full" controls src={podcast.audioUrl}>
                  مرورگر شما پخش صوت را پشتیبانی نمی‌کند.
                </audio>
              </div>
            )}

            {/* Title */}
            <h1 className="mb-3 text-xl font-IRANYekanExtraBold leading-snug text-white sm:text-2xl">
              {podcast.title}
            </h1>

            {/* Channel meta + action buttons */}
            <div className="mb-5 flex flex-wrap items-center gap-3 border-b border-white/5 pb-4">
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-x-2 text-sm text-gray-400">
                  {episodeMeta.map((part, index) => (
                    <span key={part} className="flex items-center gap-2">
                      {index > 0 && <span className="text-gray-700">•</span>}
                      <span className="truncate">{part}</span>
                    </span>
                  ))}
                </p>
              </div>

              {/* Actions */}
              <div className="ms-auto flex flex-wrap items-center gap-2">
                <button
                  onClick={handleLike}
                  disabled={actionPending === "like"}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-60 ${
                    interactions.liked
                      ? "border-red-500/30 bg-red-500/10 text-red-400"
                      : "border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  {actionPending === "like" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Heart
                      className={`h-4 w-4 ${
                        interactions.liked ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  )}
                  {interactions.liked ? "پسندیدید" : "پسندیدن"}
                  <span className="text-xs text-gray-400">
                    {formatFaNumber(likesCount)}
                  </span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={actionPending === "save"}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-60 ${
                    interactions.saved
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                      : "border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/25 hover:bg-white/[0.06]"
                  }`}
                >
                  {actionPending === "save" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bookmark
                      className={`h-4 w-4 ${
                        interactions.saved ? "fill-amber-300 text-amber-300" : ""
                      }`}
                    />
                  )}
                  {interactions.saved ? "ذخیره شد" : "ذخیره"}
                </button>

                <button
                  onClick={scrollToComments}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-gray-200 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.06] active:scale-95"
                >
                  <MessageCircle className="h-4 w-4" />
                  {formatFaNumber(commentsCount)} نظر
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm font-medium text-gray-200 transition-all duration-200 hover:border-white/25 hover:bg-white/[0.06] active:scale-95"
                >
                  <Share2 className="h-4 w-4" />
                  اشتراک‌گذاری
                </button>
              </div>
            </div>

            {/* Description */}
            {podcast.description && (
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p
                  className={`whitespace-pre-wrap break-words leading-8 text-gray-300 ${
                    descriptionIsLong && !descriptionExpanded
                      ? "line-clamp-3"
                      : ""
                  }`}
                >
                  {podcast.description}
                </p>
                {descriptionIsLong && (
                  <button
                    onClick={() =>
                      setDescriptionExpanded((expanded) => !expanded)
                    }
                    className="mt-3 flex items-center gap-1 text-sm font-medium text-gray-400 transition hover:text-white"
                  >
                    {descriptionExpanded ? (
                      <>
                        نمایش کمتر
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        نمایش بیشتر
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Comments */}
            <div ref={commentsRef} className="scroll-mt-28">
              <div className="mb-5 flex items-center gap-2">
                <h2 className="flex items-center gap-2 text-lg font-IRANYekanExtraBold text-white">
                  <MessageCircle className="h-5 w-5 text-gray-400" />
                  نظرات
                </h2>
                <span className="text-sm text-gray-500">
                  ({formatFaNumber(commentsCount)})
                </span>
              </div>

              {/* Comment composer */}
              {isAuthenticated ? (
                <div className="mb-6 flex gap-3">
                  {resolveMediaUrl(user?.avatarUrl) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resolveMediaUrl(user?.avatarUrl) ?? undefined}
                      alt="آواتار"
                      className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600 to-gray-900 text-sm font-bold text-white">
                      {user?.email ? getEmailInitial(user.email) : "؟"}
                    </span>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="mb-1 text-sm font-medium text-white">
                      {user?.name?.trim() || "کاربر طبقه ۱۶"}
                    </p>
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
                </div>
              ) : (
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
                  <p className="text-sm text-gray-400">
                    برای نظر دادن اول باید وارد حسابت بشی.
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
                    هنوز کسی نظری نذاشته. تو اولین نفر باش!
                  </p>
                </div>
              ) : (
                <div>
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border-b border-white/5 py-4 last:border-0"
                    >
                      <div className="flex items-start gap-3">
                        {resolveMediaUrl(comment.user.avatarUrl) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={
                              resolveMediaUrl(comment.user.avatarUrl) ??
                              undefined
                            }
                            alt="آواتار"
                            className="h-10 w-10 shrink-0 rounded-full border border-white/10 object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-gray-600 to-gray-900 text-sm font-bold text-white">
                            {getEmailInitial(comment.user.email || "?")}
                          </span>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <p className="truncate text-sm font-medium text-white">
                              {comment.user.name?.trim() || "کاربر طبقه ۱۶"}
                            </p>
                            <span className="text-[11px] text-gray-500">
                              {formatRelativeTime(comment.createdAt)}
                            </span>

                            {canDeleteComment(comment) && (
                              <button
                                onClick={() =>
                                  void handleDeleteComment(comment.id)
                                }
                                disabled={deletingCommentId === comment.id}
                                className="ms-auto rounded-lg p-1.5 text-gray-500 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
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

                          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-7 text-gray-300">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= Sidebar — "در ادامه" (left in RTL, like YouTube) ================= */}
          <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-base font-IRANYekanExtraBold text-white">
                <ListVideo className="h-5 w-5 text-gray-400" />
                در ادامه
              </h2>
              <button
                onClick={() => router.push("/podcasts")}
                className="text-xs text-gray-500 transition hover:text-white"
              >
                همه پادکست‌ها
              </button>
            </div>

            {relatedLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="h-[94px] w-40 shrink-0 animate-pulse rounded-lg bg-white/5" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/5" />
                      <div className="h-3 w-2/5 animate-pulse rounded bg-white/5" />
                    </div>
                  </div>
                ))}
              </div>
            ) : related.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center">
                <p className="text-sm text-gray-500">
                  اپیزود دیگه‌ای برای پیشنهاد نیست.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {related.map((episode) => (
                  <div
                    key={episode.id}
                    role="button"
                    tabIndex={0}
                    onClick={() =>
                      router.push(
                        `/watch?slug=${encodeURIComponent(episode.slug)}`,
                      )
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        router.push(
                          `/watch?slug=${encodeURIComponent(episode.slug)}`,
                        );
                      }
                    }}
                    className={`group flex cursor-pointer gap-3 rounded-xl p-2 transition-colors duration-200 ${
                      episode.slug === slug
                        ? "bg-white/[0.06]"
                        : "hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="relative w-40 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black sm:w-44">
                      <div className="relative aspect-video">
                        {episode.coverImageUrl ? (
                          <Image
                            src={episode.coverImageUrl}
                            alt={episode.title}
                            fill
                            sizes="176px"
                            className="object-cover"
                            loading="lazy"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-800 text-xs text-gray-500">
                            بدون تصویر
                          </div>
                        )}
                      </div>

                      {episode.durationSeconds !== null && (
                        <span
                          dir="ltr"
                          className="absolute bottom-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white"
                        >
                          {formatDuration(episode.durationSeconds)}
                        </span>
                      )}

                      {episode.slug === slug && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Play className="h-6 w-6 fill-current text-white" />
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 py-0.5">
                      <h3 className="line-clamp-2 text-sm font-medium leading-6 text-white transition group-hover:text-gray-300">
                        {episode.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {episode.episodeNumber
                          ? `قسمت ${formatFaNumber(episode.episodeNumber)}`
                          : "اپیزود"}
                        {" • "}
                        {formatPersianDate(episode.publishedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
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
