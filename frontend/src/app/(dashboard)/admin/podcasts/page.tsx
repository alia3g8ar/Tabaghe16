"use client";

import {
  createPodcast,
  deletePodcast,
  formatDuration,
  getAdminPodcast,
  listAdminPodcasts,
  updatePodcast,
} from "@/utils/api";
import type {
  Podcast,
  PodcastPayload,
  PodcastStatus,
} from "@/utils/api";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import type { FormEvent, ReactNode } from "react";
import { Mic2, Plus, Search, X } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 10;

type PodcastForm = {
  title: string;
  slug: string;
  description: string;
  episodeNumber: string;
  duration: string;
  guest: string;
  audioUrl: string;
  videoUrl: string;
  coverImageUrl: string;
  status: PodcastStatus;
};

const emptyForm: PodcastForm = {
  title: "",
  slug: "",
  description: "",
  episodeNumber: "",
  duration: "",
  guest: "",
  audioUrl: "",
  videoUrl: "",
  coverImageUrl: "",
  status: "draft",
};

function durationToSeconds(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const match = /^(\d+):([0-5]\d):([0-5]\d)$/.exec(value.trim());

  if (!match) {
    throw new Error("مدت زمان باید با قالب HH:MM:SS وارد شود.");
  }

  const [, hours, minutes, seconds] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
}

function formFromPodcast(podcast: Podcast): PodcastForm {
  return {
    title: podcast.title,
    slug: podcast.slug,
    description: podcast.description || "",
    episodeNumber:
      podcast.episodeNumber === null ? "" : String(podcast.episodeNumber),
    duration:
      podcast.durationSeconds === null
        ? ""
        : formatDuration(podcast.durationSeconds),
    guest: podcast.guest || "",
    audioUrl: podcast.audioUrl || "",
    videoUrl: podcast.videoUrl || "",
    coverImageUrl: podcast.coverImageUrl || "",
    status: podcast.status,
  };
}

function toPersianError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "خطای ناشناخته‌ای رخ داد.";

  const translations: Record<string, string> = {
    "at least one of audioUrl or videoUrl is required":
      "حداقل یکی از آدرس‌های فایل صوتی یا ویدیو الزامی است.",
    "podcast slug already exists": "این نامک قبلاً استفاده شده است.",
    "podcast not found": "پادکست موردنظر یافت نشد.",
  };

  return translations[message] || message;
}

function mediaType(podcast: Podcast): string {
  if (podcast.audioUrl && podcast.videoUrl) {
    return "صوتی و ویدیویی";
  }
  if (podcast.videoUrl) {
    return "ویدیویی";
  }
  return "صوتی";
}

export default function AdminPodcasts() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const [form, setForm] = useState<PodcastForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openingId, setOpeningId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Podcast | null>(null);

  const loadPodcasts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listAdminPodcasts({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
      });
      setPodcasts(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (caughtError) {
      setError(toPersianError(caughtError));
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadPodcasts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadPodcasts]);

  // جستجوی خودکار: بعد از هر تایپ، با کمی تأخیر سرچ انجام می‌شود
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const openCreateModal = () => {
    setEditingPodcast(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = async (id: number) => {
    try {
      setOpeningId(id);
      setError(null);
      const podcast = await getAdminPodcast(id);
      setEditingPodcast(podcast);
      setForm(formFromPodcast(podcast));
      setFormError(null);
      setModalOpen(true);
    } catch (caughtError) {
      setError(toPersianError(caughtError));
    } finally {
      setOpeningId(null);
    }
  };

  const closeModal = useCallback(() => {
    if (!submitting) {
      setModalOpen(false);
      setEditingPodcast(null);
      setFormError(null);
    }
  }, [submitting]);

  // Lock page scroll while the podcast form modal is open, and close it on Escape
  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [modalOpen, closeModal]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (!form.audioUrl.trim() && !form.videoUrl.trim()) {
      setFormError("حداقل آدرس فایل صوتی یا ویدیو را وارد کنید.");
      return;
    }

    try {
      const durationSeconds = durationToSeconds(form.duration);
      const episodeNumber = form.episodeNumber.trim()
        ? Number(form.episodeNumber)
        : null;

      if (
        episodeNumber !== null &&
        (!Number.isInteger(episodeNumber) || episodeNumber < 1)
      ) {
        throw new Error("شماره اپیزود باید یک عدد صحیح مثبت باشد.");
      }

      const payload: PodcastPayload = {
        title: form.title.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        episodeNumber,
        durationSeconds,
        guest: form.guest.trim() || null,
        audioUrl: form.audioUrl.trim() || null,
        videoUrl: form.videoUrl.trim() || null,
        coverImageUrl: form.coverImageUrl.trim() || null,
        status: form.status,
      };

      setSubmitting(true);

      if (editingPodcast) {
        await updatePodcast(editingPodcast.id, payload);
      } else {
        await createPodcast(payload);
      }

      setModalOpen(false);
      setEditingPodcast(null);
      setForm(emptyForm);
      await loadPodcasts();
    } catch (caughtError) {
      setFormError(toPersianError(caughtError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (podcast: Podcast) => {
    setPendingDelete(podcast);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) {
      return;
    }

    const podcast = pendingDelete;
    setPendingDelete(null);

    try {
      setDeletingId(podcast.id);
      setError(null);
      await deletePodcast(podcast.id);

      if (podcasts.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadPodcasts();
      }
    } catch (caughtError) {
      setError(toPersianError(caughtError));
    } finally {
      setDeletingId(null);
    }
  };

  const updateForm = <Key extends keyof PodcastForm>(
    field: Key,
    value: PodcastForm[Key],
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">مدیریت پادکست‌ها</h1>
          <p className="mt-1 text-sm text-gray-400">
            مجموع {total.toLocaleString("fa-IR")} پادکست
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-2.5 text-sm font-medium text-emerald-300 transition-all duration-300 hover:bg-emerald-500/20 hover:text-emerald-200 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          پادکست جدید
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جست‌وجو در عنوان، نامک یا توضیحات"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead className="bg-white/[0.04]">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  شماره اپیزود
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  عنوان
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  مهمان
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  مدت
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  نوع رسانه
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  وضعیت
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    در حال بارگذاری...
                  </td>
                </tr>
              ) : podcasts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    پادکستی یافت نشد.
                  </td>
                </tr>
              ) : (
                podcasts.map((podcast) => (
                  <tr
                    key={podcast.id}
                    className="border-b border-white/[0.06] last:border-0 transition-colors duration-200 hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {podcast.episodeNumber?.toLocaleString("fa-IR") || "—"}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-sm font-medium text-white">
                      <span className="line-clamp-2">{podcast.title}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {podcast.guest || "—"}
                    </td>
                    <td
                      className="px-4 py-3 text-sm text-gray-300"
                      dir="ltr"
                    >
                      {formatDuration(podcast.durationSeconds)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {mediaType(podcast)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-medium ${
                          podcast.status === "published"
                            ? "text-emerald-400"
                            : "text-amber-400"
                        }`}
                      >
                        {podcast.status === "published"
                          ? "منتشرشده"
                          : "پیش‌نویس"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          disabled={openingId === podcast.id}
                          onClick={() => void openEditModal(podcast.id)}
                          className="text-sm font-medium text-sky-400 transition-colors duration-200 hover:text-sky-300 disabled:opacity-50"
                        >
                          {openingId === podcast.id ? "..." : "ویرایش"}
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === podcast.id}
                          onClick={() => handleDelete(podcast)}
                          className="text-sm font-medium text-red-400 transition-colors duration-200 hover:text-red-300 disabled:opacity-50"
                        >
                          {deletingId === podcast.id ? "..." : "حذف"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-center gap-2 border-t border-white/10 p-4">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-gray-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              قبلی
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`rounded-lg border px-3 py-1 transition-colors duration-200 ${
                    pageNumber === page
                      ? "border-sky-500 bg-sky-600 text-white"
                      : "border-white/10 bg-transparent text-gray-300 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {pageNumber.toLocaleString("fa-IR")}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 text-gray-300 transition-colors duration-200 hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="animate-backdrop-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="podcast-form-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !submitting) {
              closeModal();
            }
          }}
        >
          <div className="animate-popup-in relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0d]/95 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-md">
            <div className="h-px w-full bg-gradient-to-l from-transparent via-white/20 to-transparent" />

            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2
                id="podcast-form-title"
                className="flex items-center gap-3 text-lg font-bold text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.08] text-white">
                  <Mic2 className="h-5 w-5" />
                </span>
                {editingPodcast ? "ویرایش پادکست" : "افزودن پادکست"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 transition-all duration-300 hover:bg-white/[0.06] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-90 disabled:opacity-50"
                aria-label="بستن"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 space-y-4 overflow-y-auto p-6"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="عنوان">
                  <input
                    required
                    maxLength={255}
                    value={form.title}
                    onChange={(event) =>
                      updateForm("title", event.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                  />
                </FormField>
                <FormField label="نامک">
                  <input
                    required
                    maxLength={255}
                    value={form.slug}
                    onChange={(event) =>
                      updateForm("slug", event.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                    dir="ltr"
                  />
                </FormField>
                <FormField label="شماره اپیزود">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={form.episodeNumber}
                    onChange={(event) =>
                      updateForm("episodeNumber", event.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                  />
                </FormField>
                <FormField label="مدت زمان (HH:MM:SS)">
                  <input
                    value={form.duration}
                    onChange={(event) =>
                      updateForm("duration", event.target.value)
                    }
                    placeholder="01:25:45"
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                    dir="ltr"
                  />
                </FormField>
                <FormField label="مهمان">
                  <input
                    maxLength={255}
                    value={form.guest}
                    onChange={(event) =>
                      updateForm("guest", event.target.value)
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                  />
                </FormField>
                <FormField label="وضعیت">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value as PodcastStatus,
                      )
                    }
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06] [&>option]:bg-[#171717] [&>option]:text-white"
                  >
                    <option value="draft">پیش‌نویس</option>
                    <option value="published">منتشرشده</option>
                  </select>
                </FormField>
              </div>

              <FormField label="توضیحات">
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                />
              </FormField>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="آدرس فایل صوتی">
                  <input
                    type="url"
                    maxLength={2048}
                    value={form.audioUrl}
                    onChange={(event) =>
                      updateForm("audioUrl", event.target.value)
                    }
                    placeholder="https://..."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                    dir="ltr"
                  />
                </FormField>
                <FormField label="آدرس ویدیو">
                  <input
                    type="url"
                    maxLength={2048}
                    value={form.videoUrl}
                    onChange={(event) =>
                      updateForm("videoUrl", event.target.value)
                    }
                    placeholder="https://..."
                    className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                    dir="ltr"
                  />
                </FormField>
              </div>

              <FormField label="آدرس تصویر کاور">
                <input
                  maxLength={2048}
                  value={form.coverImageUrl}
                  onChange={(event) =>
                    updateForm("coverImageUrl", event.target.value)
                  }
                  placeholder="/images/img_1.jfif یا https://..."
                  className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
                  dir="ltr"
                />
              </FormField>

              {formError && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-red-300">
                  {formError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2 text-sm text-gray-200 transition-all duration-300 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 active:scale-[0.98] disabled:opacity-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-sm text-white transition-all duration-300 hover:bg-blue-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting
                    ? "در حال ذخیره..."
                    : editingPodcast
                      ? "ذخیره تغییرات"
                      : "ایجاد پادکست"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="حذف پادکست"
        message={
          pendingDelete ? (
            <>
              آیا از حذف پادکست «
              <span className="font-semibold text-white">
                {pendingDelete.title}
              </span>
              » مطمئن هستید؟ این عملیات قابل بازگشت نیست.
            </>
          ) : null
        }
        confirmLabel="حذف"
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}
      </span>
      {children}
    </label>
  );
}
