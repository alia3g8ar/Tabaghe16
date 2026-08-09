// Lightweight client-side analytics tracking. All calls are fire-and-forget:
// failures are swallowed so tracking never breaks the user experience.

const SESSION_STORAGE_KEY = "t16_session_id";

function getApiBaseUrl(): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return (apiUrl || "").replace(/\/+$/, "");
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);

  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }

  return sessionId;
}

function getUserId(): number | undefined {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { id?: string | number };
    const id = Number(parsed.id);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  } catch {
    return undefined;
  }
}

async function postJson(path: string, body: Record<string, unknown>): Promise<void> {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) return;

  try {
    await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true,
    });
  } catch {
    // tracking is best-effort
  }
}

function beacon(path: string, body: Record<string, unknown>): void {
  const baseUrl = getApiBaseUrl();
  if (!baseUrl || typeof navigator === "undefined") return;

  try {
    const payload = new Blob([JSON.stringify(body)], {
      type: "application/json",
    });
    navigator.sendBeacon(`${baseUrl}${path}`, payload);
  } catch {
    // tracking is best-effort
  }
}

/**
 * Starts tracking the current session: registers the session with the backend,
 * sends a heartbeat every 30 seconds and flushes the final heartbeat on
 * pagehide. Returns a cleanup function.
 */
export function startSessionTracking(): () => void {
  const sessionId = getSessionId();
  if (!sessionId) return () => undefined;

  void postJson("/analytics/session", {
    sessionId,
    action: "start",
    userAgent: navigator.userAgent.slice(0, 500),
  });

  const heartbeat = window.setInterval(() => {
    void postJson("/analytics/session", {
      sessionId,
      action: "heartbeat",
    });
  }, 30_000);

  const flush = () => {
    beacon("/analytics/session", { sessionId, action: "heartbeat" });
  };
  window.addEventListener("pagehide", flush);

  return () => {
    window.clearInterval(heartbeat);
    window.removeEventListener("pagehide", flush);
  };
}

/** Records a successful login for the current session. */
export function trackLogin(email: string): void {
  const sessionId = getSessionId();
  if (!sessionId) return;

  void postJson("/analytics/events", {
    sessionId,
    events: [{ eventType: "login", meta: { email } }],
  });
}

/**
 * Records watch time for an episode. The first call with 0 seconds registers
 * the episode view (a click), later calls accumulate watch time.
 */
export function trackWatch(podcastId: number, watchSeconds: number): void {
  const sessionId = getSessionId();
  if (!sessionId) return;

  void postJson("/analytics/watch", {
    sessionId,
    podcastId,
    watchSeconds,
    userId: getUserId(),
  });
}
