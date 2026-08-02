"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  deleteAdminUser,
  listAdminUsers,
  updateAdminUserRole,
  updateAdminUserVerification,
} from "@/utils/api";
import type { AdminUser, UserRole } from "@/utils/api";
import { Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const PAGE_SIZE = 20;

const roleLabels: Record<UserRole, string> = {
  user: "کاربر",
  admin: "مدیر",
  owner: "مالک",
};

function toPersianError(error: unknown): string {
  const message =
    error instanceof Error ? error.message : "خطای ناشناخته‌ای رخ داد.";

  const translations: Record<string, string> = {
    "admins cannot assign the owner role":
      "مدیر اجازه تخصیص نقش مالک را ندارد.",
    "admins cannot modify an owner": "مدیر اجازه مدیریت حساب مالک را ندارد.",
    "you cannot delete your own account":
      "امکان حذف حساب فعلی شما وجود ندارد.",
    "user not found": "کاربر موردنظر یافت نشد.",
    "user already has this role": "کاربر در حال حاضر همین نقش را دارد.",
    "user already has this verification status":
      "وضعیت تأیید کاربر تغییری نکرده است.",
    "شما به این بخش دسترسی ندارید":
      "شما اجازه انجام این عملیات را ندارید.",
  };

  return translations[message] || message;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingUserId, setSavingUserId] = useState<number | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [pendingAction, setPendingAction] = useState<
    | { kind: "verify-revoke"; user: AdminUser }
    | { kind: "delete"; user: AdminUser }
    | null
  >(null);

  const isCurrentUserOwner = currentUser?.role === "owner";

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listAdminUsers({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        role: roleFilter || undefined,
      });
      setUsers(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (caughtError) {
      setError(toPersianError(caughtError));
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  // جستجوی خودکار: بعد از هر تایپ، با کمی تأخیر سرچ انجام می‌شود
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const handleRoleChange = async (
    targetUser: AdminUser,
    role: UserRole,
  ) => {
    try {
      setSavingUserId(targetUser.id);
      setError(null);
      await updateAdminUserRole(targetUser.id, role);
      await loadUsers();
    } catch (caughtError) {
      setError(toPersianError(caughtError));
    } finally {
      setSavingUserId(null);
    }
  };

  const handleVerificationChange = (targetUser: AdminUser) => {
    const nextVerification = !targetUser.is_verified;

    if (targetUser.is_verified) {
      setPendingAction({ kind: "verify-revoke", user: targetUser });
      return;
    }

    void applyVerificationChange(targetUser, nextVerification);
  };

  const applyVerificationChange = async (
    targetUser: AdminUser,
    nextVerification: boolean,
  ) => {
    try {
      setSavingUserId(targetUser.id);
      setError(null);
      await updateAdminUserVerification(
        targetUser.id,
        nextVerification,
      );
      await loadUsers();
    } catch (caughtError) {
      setError(toPersianError(caughtError));
    } finally {
      setSavingUserId(null);
    }
  };

  const handleDelete = (targetUser: AdminUser) => {
    setPendingAction({ kind: "delete", user: targetUser });
  };

  const applyDelete = async (targetUser: AdminUser) => {
    try {
      setDeletingUserId(targetUser.id);
      setError(null);
      await deleteAdminUser(targetUser.id);

      if (users.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadUsers();
      }
    } catch (caughtError) {
      setError(toPersianError(caughtError));
    } finally {
      setDeletingUserId(null);
    }
  };

  const confirmPendingAction = () => {
    if (!pendingAction) {
      return;
    }

    if (pendingAction.kind === "verify-revoke") {
      void applyVerificationChange(
        pendingAction.user,
        false,
      );
    } else {
      void applyDelete(pendingAction.user);
    }

    setPendingAction(null);
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-white">مدیریت کاربران</h1>
        <p className="mt-1 text-sm text-gray-400">
          مجموع {total.toLocaleString("fa-IR")} کاربر
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جست‌وجو با نام یا ایمیل"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-4 pr-10 text-sm text-white placeholder:text-gray-500 outline-none transition-colors duration-300 focus:border-white/30 focus:bg-white/[0.06]"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as UserRole | "");
              setPage(1);
            }}
            className="shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition-colors duration-300 focus:border-white/30 [&>option]:bg-[#171717] [&>option]:text-white"
          >
            <option value="">همه نقش‌ها</option>
            <option value="user">کاربر</option>
            <option value="admin">مدیر</option>
            <option value="owner">مالک</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead className="bg-white/[0.04]">
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  شناسه
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  نام
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  ایمیل
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  نقش
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  وضعیت تأیید
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">
                  تاریخ عضویت
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
                    در حال بارگذاری کاربران...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                    <p>کاربری یافت نشد.</p>
                    <p className="mt-2 text-xs">
                      کاربران جدید از طریق ورود با کد یک‌بارمصرف ایجاد
                      می‌شوند.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((targetUser) => {
                  const isSelf =
                    String(targetUser.id) === String(currentUser?.id);
                  const isOwnerProtected =
                    !isCurrentUserOwner && targetUser.role === "owner";
                  const rowSaving = savingUserId === targetUser.id;
                  const rowDeleting = deletingUserId === targetUser.id;

                  return (
                    <tr
                      key={targetUser.id}
                      className="border-b border-white/[0.06] last:border-0 transition-colors duration-200 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {targetUser.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {targetUser.name || "—"}
                      </td>
                      <td
                        className="px-4 py-3 text-sm text-gray-300"
                        dir="ltr"
                      >
                        {targetUser.email}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <select
                            value={targetUser.role}
                            disabled={
                              isSelf || rowSaving || isOwnerProtected
                            }
                            onChange={(event) =>
                              void handleRoleChange(
                                targetUser,
                                event.target.value as UserRole,
                              )
                            }
                            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-sm text-white outline-none transition-colors duration-200 focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-[#171717] [&>option]:text-white"
                            aria-label={`تغییر نقش ${targetUser.email}`}
                            title={
                              isSelf
                                ? "امکان تغییر نقش حساب فعلی وجود ندارد"
                                : undefined
                            }
                          >
                            <option value="user">{roleLabels.user}</option>
                            <option value="admin">{roleLabels.admin}</option>
                            <option
                              value="owner"
                              disabled={!isCurrentUserOwner}
                            >
                              {roleLabels.owner}
                            </option>
                          </select>
                          {isSelf && (
                            <p className="mt-1 text-xs text-gray-400">
                              امکان تغییر نقش خودتان وجود ندارد.
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={rowSaving || isOwnerProtected}
                          onClick={() => handleVerificationChange(targetUser)}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                            targetUser.is_verified
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-red-500/10 text-red-400"
                          }`}
                        >
                          {targetUser.is_verified
                            ? "تأییدشده"
                            : "تأییدنشده"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {formatCreatedAt(targetUser.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={
                            isSelf ||
                            isOwnerProtected ||
                            rowDeleting ||
                            rowSaving
                          }
                          onClick={() => handleDelete(targetUser)}
                          className="inline-flex items-center gap-1 text-sm font-medium text-red-400 transition-colors duration-200 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                          title={
                            isSelf
                              ? "امکان حذف حساب فعلی وجود ندارد"
                              : isOwnerProtected
                                ? "مدیر اجازه حذف مالک را ندارد"
                                : "حذف کاربر"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                          {rowDeleting ? "در حال حذف..." : "حذف"}
                        </button>
                      </td>
                    </tr>
                  );
                })
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

      <ConfirmDialog
        open={pendingAction !== null}
        title={
          pendingAction?.kind === "delete"
            ? "حذف کاربر"
            : "لغو تأیید حساب"
        }
        message={
          pendingAction ? (
            pendingAction.kind === "delete" ? (
              <>
                آیا از حذف کاربر «
                <span className="font-semibold text-white">
                  {pendingAction.user.name?.trim() ||
                    pendingAction.user.email}
                </span>
                » با ایمیل{" "}
                <span
                  dir="ltr"
                  className="font-mono text-white"
                >
                  {pendingAction.user.email}
                </span>{" "}
                مطمئن هستید؟ این عملیات قابل بازگشت نیست.
              </>
            ) : (
              <>
                آیا از لغو تأیید حساب «
                <span
                  dir="ltr"
                  className="font-mono text-white"
                >
                  {pendingAction.user.email}
                </span>
                » مطمئن هستید؟
              </>
            )
          ) : null
        }
        confirmLabel={
          pendingAction?.kind === "delete" ? "حذف" : "لغو تأیید"
        }
        onConfirm={confirmPendingAction}
        onCancel={() => setPendingAction(null)}
      />
    </div>
  );
}
