// Typed client for the backend API (../backend). Not yet wired into any
// component — src/utils/data.ts remains the site's live source of truth.
// Kept here as a ready-to-use contract for whoever picks up:
//   1. fetching services/clinic info live instead of the static data, and
//   2. building the appointment-request and contact-inquiry forms the
//      site doesn't have yet.

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiError {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export class ApiRequestError extends Error {
  readonly code: string;
  readonly details?: unknown;

  constructor(code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiRequestError";
    this.code = code;
    this.details = details;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!body.success) {
    throw new ApiRequestError(body.error.code, body.error.message, body.error.details);
  }

  return body.data;
}

export interface ApiClinicInfo {
  name: string;
  addressLine1: string;
  addressLine2: string;
  hours: string;
  phoneDisplay: string | null;
  phoneHref: string | null;
}

export interface ApiService {
  id: string;
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export interface AppointmentRequestInput {
  patientName: string;
  patientPhone: string;
  requestedService: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
}

export interface InquiryInput {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

export const api = {
  getClinic: () => request<ApiClinicInfo>("/clinic"),

  getServices: () => request<ApiService[]>("/services"),

  getServiceBySlug: (slug: string) => request<ApiService>(`/services/${slug}`),

  submitAppointment: (input: AppointmentRequestInput) =>
    request<{ id: string; status: string }>("/appointments", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  submitInquiry: (input: InquiryInput) =>
    request<{ id: string; status: string }>("/inquiries", {
      method: "POST",
      body: JSON.stringify(input),
    }),
};
