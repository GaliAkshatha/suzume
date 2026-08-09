const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const data = await res.json();
      setAccessToken(data.accessToken);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  body?: unknown;
  skipAuthRetry?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, skipAuthRetry } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && !skipAuthRetry && !path.startsWith("/auth/")) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, skipAuthRetry: true });
    }
    onUnauthorized?.();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  let payload: any = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  if (!res.ok) {
    const message = payload?.error?.message ?? "Something went wrong. Please try again.";
    throw new ApiError(res.status, message, payload?.error?.code, payload?.error?.details);
  }

  return payload as T;
}
