export type PodcastStatus = "draft" | "published";

export interface Podcast {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  episodeNumber: number | null;
  durationSeconds: number | null;
  audioUrl: string | null;
  videoUrl: string | null;
  coverImageUrl: string | null;
  guest: string | null;
  status: PodcastStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PodcastListResponse {
  message: string;
  data: Podcast[];
  meta: PaginationMeta;
}

interface PodcastResponse {
  message: string;
  data: Podcast;
}

interface MessageResponse {
  message: string;
}

export interface PodcastPayload {
  title: string;
  slug: string;
  description?: string | null;
  episodeNumber?: number | null;
  durationSeconds?: number | null;
  audioUrl?: string | null;
  videoUrl?: string | null;
  coverImageUrl?: string | null;
  guest?: string | null;
  status?: PodcastStatus;
}

export interface PodcastListParams {
  page?: number;
  limit?: number;
}

export interface AdminPodcastListParams extends PodcastListParams {
  search?: string;
  status?: PodcastStatus;
}

export type UserRole = "user" | "admin" | "owner";

export interface AdminUser {
  id: number;
  name: string | null;
  email: string;
  role: UserRole;
  is_verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
}

export interface AdminUserListResponse {
  message: string;
  data: AdminUser[];
  meta: PaginationMeta;
}

interface AdminUserResponse {
  message: string;
  data: AdminUser;
}

type BackendError = {
  message?: string | string[];
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new ApiError(
      "آدرس سرویس API تنظیم نشده است.",
      500,
    );
  }

  return apiUrl.replace(/\/+$/, "");
}

const AUTH_STORAGE_KEYS = [
  "token",
  "accessToken",
  "refreshToken",
  "role",
  "user",
] as const;

interface RefreshTokenResponse {
  message?: string | string[];
  data?: {
    accessToken?: string;
  };
}

function clearAuthStorage(): void {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
}

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    clearAuthStorage();
    window.dispatchEvent(new Event("auth:session-expired"));
    throw new ApiError("نشست شما منقضی شده است. دوباره وارد شوید.", 401);
  }

  const response = await fetch(
    `${getApiBaseUrl()}/auth/refresh-token`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
      cache: "no-store",
    },
  );
  const body = (await response.json().catch(() => null)) as
    | RefreshTokenResponse
    | null;

  if (!response.ok || !body?.data?.accessToken) {
    clearAuthStorage();
    window.dispatchEvent(new Event("auth:session-expired"));

    const backendMessage = body?.message;
    const message = Array.isArray(backendMessage)
      ? backendMessage.join("، ")
      : backendMessage || "نشست شما منقضی شده است. دوباره وارد شوید.";

    throw new ApiError(message, 401);
  }

  const newAccessToken = body.data.accessToken;
  localStorage.setItem("accessToken", newAccessToken);
  localStorage.setItem("token", newAccessToken);

  return newAccessToken;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  requiresAuthentication = false,
): Promise<T> {
  const headers = new Headers(init.headers);

  if (init.body) {
    headers.set("Content-Type", "application/json");
  }

  let accessToken: string | null = null;

  if (requiresAuthentication) {
    accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      throw new ApiError(
        "برای انجام این عملیات باید وارد حساب شوید.",
        401,
      );
    }

    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  let response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  // Access tokens expire quickly; when the server rejects the token,
  // exchange the stored refresh token for a fresh access token once
  // and retry the original request.
  if (response.status === 401 && requiresAuthentication && accessToken) {
    try {
      const refreshedAccessToken = await (refreshPromise ??=
        refreshAccessToken().finally(() => {
          refreshPromise = null;
        }));
      headers.set("Authorization", `Bearer ${refreshedAccessToken}`);
      response = await fetch(`${getApiBaseUrl()}${path}`, {
        ...init,
        headers,
        cache: "no-store",
      });

      // Safety net: if the retried request is still rejected, the session
      // is genuinely broken — clean up instead of keeping stale state.
      if (response.status === 401) {
        clearAuthStorage();
        window.dispatchEvent(new Event("auth:session-expired"));
      }
    } catch (error) {
      throw error instanceof Error
        ? error
        : new ApiError("نشست شما منقضی شده است. دوباره وارد شوید.", 401);
    }
  }

  const body = (await response.json().catch(() => null)) as
    | (T & BackendError)
    | null;

  if (!response.ok) {
    const backendMessage = body?.message;
    const message = Array.isArray(backendMessage)
      ? backendMessage.join("، ")
      : backendMessage || `خطای سرویس با کد ${response.status}`;

    throw new ApiError(message, response.status);
  }

  if (!body) {
    throw new ApiError("پاسخ نامعتبر از سرویس دریافت شد.", 502);
  }

  return body;
}

function createQuery(params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function listPublishedPodcasts(
  params: PodcastListParams = {},
): Promise<PodcastListResponse> {
  return request(
    `/podcasts${createQuery({
      page: params.page,
      limit: params.limit,
    })}`,
  );
}

export async function getPublishedPodcast(slug: string): Promise<Podcast> {
  const response = await request<PodcastResponse>(
    `/podcasts/${encodeURIComponent(slug)}`,
  );
  return response.data;
}

export function listAdminPodcasts(
  params: AdminPodcastListParams = {},
): Promise<PodcastListResponse> {
  return request(
    `/admin/podcasts${createQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
    })}`,
    {},
    true,
  );
}

export async function getAdminPodcast(id: number): Promise<Podcast> {
  const response = await request<PodcastResponse>(
    `/admin/podcasts/${id}`,
    {},
    true,
  );
  return response.data;
}

export async function createPodcast(
  payload: PodcastPayload,
): Promise<Podcast> {
  const response = await request<PodcastResponse>(
    "/admin/podcasts",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
  return response.data;
}

export async function updatePodcast(
  id: number,
  payload: Partial<PodcastPayload>,
): Promise<Podcast> {
  const response = await request<PodcastResponse>(
    `/admin/podcasts/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
    true,
  );
  return response.data;
}

export async function deletePodcast(id: number): Promise<string> {
  const response = await request<MessageResponse>(
    `/admin/podcasts/${id}`,
    { method: "DELETE" },
    true,
  );
  return response.message;
}

export function listAdminUsers(
  params: AdminUserListParams = {},
): Promise<AdminUserListResponse> {
  return request(
    `/admin/users${createQuery({
      page: params.page,
      limit: params.limit,
      search: params.search,
      role: params.role,
    })}`,
    {},
    true,
  );
}

export async function updateAdminUserRole(
  id: number,
  role: UserRole,
): Promise<AdminUser> {
  const response = await request<AdminUserResponse>(
    `/admin/users/${id}/role`,
    {
      method: "PATCH",
      body: JSON.stringify({ role }),
    },
    true,
  );
  return response.data;
}

export async function updateAdminUserVerification(
  id: number,
  isVerified: boolean,
): Promise<AdminUser> {
  const response = await request<AdminUserResponse>(
    `/admin/users/${id}/verification`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_verified: isVerified }),
    },
    true,
  );
  return response.data;
}

export async function deleteAdminUser(id: number): Promise<string> {
  const response = await request<MessageResponse>(
    `/admin/users/${id}`,
    { method: "DELETE" },
    true,
  );
  return response.message;
}

export function formatDuration(durationSeconds: number | null): string {
  if (durationSeconds === null) {
    return "—";
  }

  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
}
