// Typed client for the clinic backend's admin-facing API.
//
// Auth model: POST /auth/login returns a short-lived accessToken (kept in
// memory only — never localStorage) plus an httpOnly refresh_token cookie
// the browser stores automatically. Every other authenticated request sends
// `Authorization: Bearer <accessToken>`. If a request comes back 401 because
// the access token expired, we transparently call /auth/refresh (which relies
// on the cookie, hence `credentials: "include"`) once and retry the original
// request before giving up and forcing a re-login.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export type AdminRole = "SUPER_ADMIN" | "ADMIN" | "STAFF";
export type AppointmentStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
export type InquiryStatus = "NEW" | "READ" | "RESOLVED";

export interface SafeAdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt: string | null;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  requestedService: string;
  preferredDate: string | null;
  preferredTime: string | null;
  message: string | null;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  appointments: { pending: number; confirmed: number; completed: number; cancelled: number; noShow: number };
  inquiries: { new: number; read: number; resolved: number };
  services: { active: number; inactive: number };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

interface ApiError {
  success: false;
  error: { code: string; message: string; details?: string[] };
}

export class ApiRequestError extends Error {
  readonly code: string;
  readonly details?: string[];
  readonly status: number;

  constructor(status: number, code: string, message: string, details?: string[]) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** Called once from AuthContext so the client can force a logout when even a refresh fails. */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function rawRequest<T>(path: string, init: RequestInit = {}): Promise<{ data: T; meta?: PaginationMeta }> {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(init.headers as Record<string, string> | undefined) };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return { data: undefined as T };
  }

  const body = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!body.success) {
    throw new ApiRequestError(response.status, body.error.code, body.error.message, body.error.details);
  }

  return { data: body.data, meta: body.meta };
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const { data } = await rawRequest<{ accessToken: string; admin: SafeAdminUser }>("/auth/refresh", {
          method: "POST",
        });
        setAccessToken(data.accessToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function request<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
  try {
    const { data } = await rawRequest<T>(path, init);
    return data;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401 && !isRetry && path !== "/auth/refresh" && path !== "/auth/login") {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return request<T>(path, init, true);
      }
      onUnauthorized?.();
    }
    throw error;
  }
}

async function requestWithMeta<T>(path: string, init?: RequestInit, isRetry = false): Promise<{ data: T; meta?: PaginationMeta }> {
  try {
    return await rawRequest<T>(path, init);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401 && !isRetry) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        return requestWithMeta<T>(path, init, true);
      }
      onUnauthorized?.();
    }
    throw error;
  }
}

function toQueryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  async login(email: string, password: string) {
    const { data } = await rawRequest<{ accessToken: string; admin: SafeAdminUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    return data.admin;
  },

  async logout() {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      setAccessToken(null);
    }
  },

  getMe: () => request<{ id: string; email: string; name: string; role: AdminRole }>("/auth/me"),

  getDashboardSummary: () => request<DashboardSummary>("/dashboard/summary"),

  async getAppointments(params: { page?: number; limit?: number; status?: AppointmentStatus | ""; service?: string }) {
    return requestWithMeta<Appointment[]>(`/appointments${toQueryString(params)}`);
  },

  updateAppointment: (id: string, patch: { status?: AppointmentStatus; preferredDate?: string; preferredTime?: string; message?: string }) =>
    request<Appointment>(`/appointments/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),

  async getInquiries(params: { page?: number; limit?: number; status?: InquiryStatus | "" }) {
    return requestWithMeta<Inquiry[]>(`/inquiries${toQueryString(params)}`);
  },

  updateInquiry: (id: string, patch: { status: InquiryStatus }) =>
    request<Inquiry>(`/inquiries/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
};
