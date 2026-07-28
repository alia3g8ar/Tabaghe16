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
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";

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

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

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

  const handleVerificationChange = async (targetUser: AdminUser) => {
    const nextVerification = !targetUser.is_verified;

    if (
      targetUser.is_verified &&
      !window.confirm(
        `آیا از لغو تأیید حساب «${targetUser.email}» مطمئن هستید؟`,
      )
    ) {
      return;
    }

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

  const handleDelete = async (targetUser: AdminUser) => {
    const identity = targetUser.name?.trim() || targetUser.email;

    if (
      !window.confirm(
        `آیا از حذف کاربر «${identity}» با ایمیل ${targetUser.email} مطمئن هستید؟`,
      )
    ) {
      return;
    }

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

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">مدیریت کاربران</h1>
        <p className="mt-1 text-sm text-gray-500">
          مجموع {total.toLocaleString("fa-IR")} کاربر
        </p>
      </div>

      <div className="rounded-lg bg-white p-4 shadow">
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 md:flex-row"
        >
          <div className="relative min-w-0 flex-1">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="جست‌وجو با نام یا ایمیل"
              className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-10 outline-none focus:border-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as UserRole | "");
              setPage(1);
            }}
            className="rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="">همه نقش‌ها</option>
            <option value="user">کاربر</option>
            <option value="admin">مدیر</option>
            <option value="owner">مالک</option>
          </select>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            جست‌وجو
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead className="bg-gray-50">
              <tr className="border-b">
                <th className="p-3 text-right">شناسه</th>
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">ایمیل</th>
                <th className="p-3 text-right">نقش</th>
                <th className="p-3 text-right">وضعیت تأیید</th>
                <th className="p-3 text-right">تاریخ عضویت</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">
                    در حال بارگذاری کاربران...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-gray-500">
                    <p>کاربری یافت نشد.</p>
                    <p className="mt-2 text-sm">
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
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="p-3">{targetUser.id}</td>
                      <td className="p-3">{targetUser.name || "—"}</td>
                      <td className="p-3" dir="ltr">
                        {targetUser.email}
                      </td>
                      <td className="p-3">
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
                            className="rounded border border-gray-300 px-2 py-1 disabled:cursor-not-allowed disabled:bg-gray-100"
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
                            <p className="mt-1 text-xs text-gray-500">
                              امکان تغییر نقش خودتان وجود ندارد.
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          disabled={rowSaving || isOwnerProtected}
                          onClick={() =>
                            void handleVerificationChange(targetUser)
                          }
                          className={`rounded-full px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50 ${
                            targetUser.is_verified
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {targetUser.is_verified
                            ? "تأییدشده"
                            : "تأییدنشده"}
                        </button>
                      </td>
                      <td className="p-3">
                        {formatCreatedAt(targetUser.createdAt)}
                      </td>
                      <td className="p-3">
                        <button
                          type="button"
                          disabled={
                            isSelf ||
                            isOwnerProtected ||
                            rowDeleting ||
                            rowSaving
                          }
                          onClick={() => void handleDelete(targetUser)}
                          className="inline-flex items-center gap-1 text-red-600 disabled:cursor-not-allowed disabled:opacity-30"
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
          <div className="flex flex-wrap items-center justify-center gap-2 border-t p-4">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded border px-3 py-1 disabled:opacity-40"
            >
              قبلی
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  type="button"
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`rounded border px-3 py-1 ${
                    pageNumber === page
                      ? "bg-blue-600 text-white"
                      : "bg-white"
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
              className="rounded border px-3 py-1 disabled:opacity-40"
            >
              بعدی
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
